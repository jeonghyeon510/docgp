# DocGP 로컬 서버 (PowerShell용, Python 없이 동작)
$port = 8080
$root = "$PSScriptRoot"

$UPSTAGE_KEY = "up_2Tym25ZOXlznGcfuApwqoSlBkHdNk"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "DocGP 서버 실행 중: http://localhost:$port" -ForegroundColor Green
Write-Host "종료하려면 Ctrl+C" -ForegroundColor Yellow

Start-Process "http://localhost:$port"

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".png"  = "image/png"
    ".ico"  = "image/x-icon"
}

try {
    while ($listener.IsListening) {
        $ctx  = $listener.GetContext()
        $req  = $ctx.Request
        $resp = $ctx.Response
        $resp.Headers.Add("Access-Control-Allow-Origin", "*")
        $resp.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        $resp.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

        if ($req.HttpMethod -eq "OPTIONS") {
            $resp.StatusCode = 204
            $resp.Close()
            continue
        }

        if ($req.HttpMethod -eq "POST" -and $req.Url.LocalPath -eq "/api/chat") {
            try {
                $sr      = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
                $jsonIn  = $sr.ReadToEnd()
                $parsed  = $jsonIn | ConvertFrom-Json
                $apiKey  = if ($parsed.apiKey -and $parsed.apiKey.Trim()) { $parsed.apiKey.Trim() } else { $UPSTAGE_KEY }
                $userMsg = $parsed.message

                $payload = @{
                    model    = "solar-pro"
                    messages = @(
                        @{ role = "system"; content = "너는 전주시 특화 1차 방문 진료과 추천 AI 가이드 DocGP이다. 환자의 증상을 듣고 친절하게 1차 방문 추천 진료과(정형외과, 내과, 신경과, 이비인후과 등)와 전주 지역 1·2차 대표 병원을 3문장 이내로 명확하게 권장해라. 의학적 진단이 아닌 1차 진료과 네비게이션 가이드임을 밝혀라." }
                        @{ role = "user";   content = $userMsg }
                    )
                } | ConvertTo-Json -Depth 10

                $headers = @{
                    "Authorization" = "Bearer $apiKey"
                    "Content-Type"  = "application/json"
                }

                $upResp = Invoke-RestMethod -Uri "https://api.upstage.ai/v1/chat/completions" `
                          -Method POST -Headers $headers -Body $payload -ContentType "application/json; charset=utf-8"

                $reply  = $upResp.choices[0].message.content
                $outJson = @{ reply = $reply } | ConvertTo-Json -Compress

                $buf = [System.Text.Encoding]::UTF8.GetBytes($outJson)
                $resp.ContentType = "application/json; charset=utf-8"
                $resp.ContentLength64 = $buf.Length
                $resp.OutputStream.Write($buf, 0, $buf.Length)
            } catch {
                $errJson = @{ error = $_.Exception.Message } | ConvertTo-Json -Compress
                $buf = [System.Text.Encoding]::UTF8.GetBytes($errJson)
                $resp.StatusCode = 500
                $resp.ContentType = "application/json; charset=utf-8"
                $resp.ContentLength64 = $buf.Length
                $resp.OutputStream.Write($buf, 0, $buf.Length)
                Write-Host "API 오류: $($_.Exception.Message)" -ForegroundColor Red
            }
            $resp.Close()
            continue
        }

        # 정적 파일 서빙
        $localPath = $req.Url.LocalPath.TrimStart("/")
        if ($localPath -eq "" -or $localPath -eq "/") { $localPath = "index.html" }
        $filePath = Join-Path $root $localPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext  = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }
            $buf  = [System.IO.File]::ReadAllBytes($filePath)
            $resp.ContentType = $mime
            $resp.ContentLength64 = $buf.Length
            $resp.OutputStream.Write($buf, 0, $buf.Length)
        } else {
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
            $resp.StatusCode = 404
            $resp.ContentLength64 = $msg.Length
            $resp.OutputStream.Write($msg, 0, $msg.Length)
        }
        $resp.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "서버 종료됨."
}
