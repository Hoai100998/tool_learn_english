param(
    [string]$DataDir = (Join-Path $PSScriptRoot '..\data'),
    [string]$ReportPath = (Join-Path $PSScriptRoot '..\data_quality_report.json')
)

$ErrorActionPreference = 'Stop'
$levels = @('A1', 'A2', 'B1', 'B2', 'C1')
$required = @('id', 'level', 'type', 'english', 'vietnamese', 'part_of_speech', 'hint', 'example', 'example_vi')
$ids = @{}
$words = @{}
$samples = [ordered]@{
    placeholderIpa = [System.Collections.Generic.List[object]]::new()
    suspiciousIpa = [System.Collections.Generic.List[object]]::new()
    suspiciousTranslation = [System.Collections.Generic.List[object]]::new()
}
$counts = [ordered]@{
    total = 0; duplicateIds = 0; duplicateEnglish = 0; missingRequired = 0
    invalidLevel = 0; invalidType = 0; missingIpa = 0; placeholderIpa = 0; suspiciousIpa = 0
    genericHint = 0; genericExample = 0; suspiciousTranslation = 0
    words = 0; phrases = 0; sentences = 0
}

function Add-Sample([string]$bucket, $item, [string]$reason) {
    if ($samples[$bucket].Count -lt 100) {
        $samples[$bucket].Add([ordered]@{ id=$item.id; english=$item.english; value=if($bucket -eq 'suspiciousTranslation'){$item.vietnamese}else{$item.ipa}; reason=$reason })
    }
}

foreach ($level in $levels) {
    $path = Join-Path $DataDir "data_$level.json"
    $data = Get-Content -Raw -Encoding UTF8 -LiteralPath $path | ConvertFrom-Json
    foreach ($item in $data) {
        $counts.total++
        foreach ($field in $required) {
            if (-not $item.PSObject.Properties[$field] -or [string]::IsNullOrWhiteSpace([string]$item.$field)) { $counts.missingRequired++ }
        }
        if ($ids.ContainsKey([string]$item.id)) { $counts.duplicateIds++ } else { $ids[[string]$item.id] = $true }
        if ($words.ContainsKey([string]$item.english)) { $counts.duplicateEnglish++ } else { $words[[string]$item.english] = $true }
        if ($item.level -ne $level) { $counts.invalidLevel++ }
        if ($item.type -notin @('word','phrase','sentence')) { $counts.invalidType++ } else { $counts[([string]$item.type + 's')]++ }

        $ipa = [string]$item.ipa
        if ([string]::IsNullOrWhiteSpace($ipa)) {
            $counts.missingIpa++
        } elseif ($item.type -eq 'word' -and $ipa -eq ('/' + $item.english + '/')) {
            $counts.placeholderIpa++; Add-Sample 'placeholderIpa' $item 'IPA is just the English spelling'
        } elseif ($item.type -eq 'word' -and ($ipa -notmatch '^/.+/$' -or $ipa -match '\s{2,}' -or $ipa -match '/[^/]*\b(are|know|contain|materials)\b[^/]*/')) {
            $counts.suspiciousIpa++; Add-Sample 'suspiciousIpa' $item 'Malformed or spelling-like transcription'
        }

        if ([string]$item.hint -match '^Từ vựng tiếng Anh:') { $counts.genericHint++ }
        if ([string]$item.example -match '^Practice pronouncing') { $counts.genericExample++ }

        $vi = [string]$item.vietnamese
        if ($item.type -eq 'word' -and ($vi -match '(^\)?\s*xem\s|s\. of |\bn\b|\bc\. of |\(từ hiếm|spermatozoon|\s\.$)' -or $vi.Length -gt 240)) {
            $counts.suspiciousTranslation++; Add-Sample 'suspiciousTranslation' $item 'Dictionary artifact, obsolete notation, or excessively broad gloss'
        }
    }
}

$report = [ordered]@{
    generatedAt = (Get-Date).ToString('o')
    scope = 'Automated structural and heuristic QA; not a human lexical verification'
    cefrStatus = 'unsupported: levels are frequency buckets, not verified CEFR labels'
    counts = $counts
    samples = $samples
}
$json = $report | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText((Join-Path (Resolve-Path (Split-Path $ReportPath -Parent)) (Split-Path $ReportPath -Leaf)), $json, [Text.UTF8Encoding]::new($false))
Write-Output $json
