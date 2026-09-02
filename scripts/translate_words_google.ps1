param(
    [ValidateSet('Fetch','Apply')][string]$Mode = 'Fetch',
    [string]$DataDir = (Join-Path $PSScriptRoot '..\data'),
    [string]$CheckpointPath = (Join-Path $PSScriptRoot '..\google_translation_checkpoint.json'),
    [int]$BatchSize = 100,
    [int]$DelayMilliseconds = 500
)

$ErrorActionPreference = 'Stop'
$levels = @('A1','A2','B1','B2','C1')
$utf8 = [Text.UTF8Encoding]::new($false)

function Read-Level([string]$level) {
    $path = Join-Path $DataDir "data_$level.json"
    return @(Get-Content -Raw -Encoding UTF8 -LiteralPath $path | ConvertFrom-Json)
}

function Save-Checkpoint($state) {
    [IO.File]::WriteAllText($CheckpointPath, ($state | ConvertTo-Json -Depth 8), $utf8)
}

function Load-Checkpoint {
    if (Test-Path -LiteralPath $CheckpointPath) {
        return Get-Content -Raw -Encoding UTF8 -LiteralPath $CheckpointPath | ConvertFrom-Json
    }
    return [pscustomobject]@{
        version = '1.0.0'; provider = 'Google Cloud Translation v2'; source = 'en'; target = 'vi'
        createdAt = (Get-Date).ToString('o'); translations = [pscustomobject]@{}
    }
}

function Set-Translation($state, [string]$id, $record) {
    $state.translations | Add-Member -NotePropertyName $id -NotePropertyValue $record -Force
}

function Invoke-GoogleBatch([object[]]$items, [string]$apiKey) {
    $body = @{ q = @($items | ForEach-Object { $_.english }); source = 'en'; target = 'vi'; format = 'text' } |
        ConvertTo-Json -Depth 4
    $headers = @{ 'X-Goog-Api-Key' = $apiKey }
    $uri = 'https://translation.googleapis.com/language/translate/v2'
    $lastError = $null
    for ($attempt = 1; $attempt -le 5; $attempt++) {
        try {
            $result = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -ContentType 'application/json; charset=utf-8' -Body $body
            $translations = @($result.data.translations)
            if ($translations.Count -ne $items.Count) { throw "Google returned $($translations.Count) results for $($items.Count) inputs." }
            return $translations
        } catch {
            $lastError = $_
            if ($attempt -lt 5) { Start-Sleep -Seconds ([math]::Pow(2, $attempt)) }
        }
    }
    throw $lastError
}

$allItems = [System.Collections.Generic.List[object]]::new()
foreach ($level in $levels) {
    foreach ($item in (Read-Level $level)) {
        if ($item.type -eq 'word') { $allItems.Add($item) }
    }
}
if ($allItems.Count -ne 25000) { throw "Expected exactly 25,000 word items, found $($allItems.Count)." }

$state = Load-Checkpoint
if (-not $state.translations) { $state | Add-Member translations ([pscustomobject]@{}) -Force }

if ($Mode -eq 'Fetch') {
    $apiKey = $env:GOOGLE_TRANSLATE_API_KEY
    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        $apiKey = [Environment]::GetEnvironmentVariable('GOOGLE_TRANSLATE_API_KEY', 'User')
    }
    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        throw 'Set GOOGLE_TRANSLATE_API_KEY in the environment. The key is intentionally not accepted as a command-line argument.'
    }
    $pending = @($allItems | Where-Object { -not $state.translations.PSObject.Properties[$_.id] })
    Write-Output "Already translated: $($allItems.Count - $pending.Count); pending: $($pending.Count)."
    for ($offset = 0; $offset -lt $pending.Count; $offset += $BatchSize) {
        $end = [math]::Min($offset + $BatchSize - 1, $pending.Count - 1)
        $batch = @($pending[$offset..$end])
        $translated = Invoke-GoogleBatch $batch $apiKey
        for ($index = 0; $index -lt $batch.Count; $index++) {
            $text = [Net.WebUtility]::HtmlDecode([string]$translated[$index].translatedText).Trim()
            if ([string]::IsNullOrWhiteSpace($text)) { throw "Empty translation for $($batch[$index].id)." }
            Set-Translation $state $batch[$index].id ([pscustomobject]@{
                english = $batch[$index].english; original = $batch[$index].vietnamese
                translated = $text; fetchedAt = (Get-Date).ToString('o')
            })
        }
        Save-Checkpoint $state
        $completed = [math]::Min($offset + $batch.Count, $pending.Count)
        Write-Output "Fetched $completed / $($pending.Count) pending translations."
        Start-Sleep -Milliseconds $DelayMilliseconds
    }
    Write-Output 'Fetch complete. Review google_translation_checkpoint.json, then run again with -Mode Apply.'
    exit 0
}

$missing = @($allItems | Where-Object { -not $state.translations.PSObject.Properties[$_.id] })
if ($missing.Count -gt 0) { throw "Checkpoint is incomplete: $($missing.Count) word translations are missing. No data was changed." }

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupDir = Join-Path (Split-Path $DataDir -Parent) "backup_before_google_$timestamp"
[IO.Directory]::CreateDirectory($backupDir) | Out-Null

foreach ($level in $levels) {
    $jsonPath = Join-Path $DataDir "data_$level.json"
    [IO.File]::Copy($jsonPath, (Join-Path $backupDir "data_$level.json"), $false)
    $items = Read-Level $level
    foreach ($item in $items) {
        if ($item.type -eq 'word') {
            $item.vietnamese = [string]$state.translations.PSObject.Properties[$item.id].Value.translated
            $item | Add-Member -NotePropertyName translation_source -NotePropertyValue 'Google Cloud Translation v2' -Force
        }
    }
    $json = $items | ConvertTo-Json -Depth 8
    [IO.File]::WriteAllText($jsonPath, $json, $utf8)
    [IO.File]::WriteAllText((Join-Path $DataDir "data_$level.js"), "window.DATA_$level = $json;", $utf8)
}
Write-Output "Applied 25,000 translations. Original JSON files are in $backupDir"
