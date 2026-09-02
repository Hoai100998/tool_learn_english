$port = 5500
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "[DictaLearn Server] Running at: http://localhost:$port/index.html"
} catch {
    $port = 5501
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
    Write-Host "[DictaLearn Server] Running at: http://localhost:$port/index.html"
}

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $rawUrl = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($rawUrl) -or $rawUrl -eq '/') {
        $rawUrl = 'index.html'
    }
    
    $filePath = Join-Path (Get-Location) ($rawUrl -replace '/', '\')
    if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $mime = switch ($ext) {
            '.html' { 'text/html; charset=utf-8' }
            '.js'   { 'application/javascript; charset=utf-8' }
            '.json' { 'application/json; charset=utf-8' }
            '.css'  { 'text/css; charset=utf-8' }
            '.svg'  { 'image/svg+xml' }
            '.png'  { 'image/png' }
            '.ico'  { 'image/x-icon' }
            default { 'application/octet-stream' }
        }
        $response.ContentType = $mime
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes('File Not Found')
        $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
    }
    $response.OutputStream.Close()
}
