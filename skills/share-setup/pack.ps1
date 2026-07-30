param(
    [switch]$Full,
    [string]$Name = "",
    [string]$Out = ".",
    [switch]$WithRules,
    [string]$ForWhom = ""
)

$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$ProjectName = if ($Name) { $Name } elseif ($Full) { Split-Path $Root -Leaf } else { "agent-setup" }
$OutPath = Join-Path $Root (Join-Path $Out "$ProjectName.zip")

$SkipNames = @(".git", ".DS_Store", "Thumbs.db", "desktop.ini", "node_modules", "__pycache__", ".venv", "venv", ".idea", ".vscode", ".pytest_cache", ".mypy_cache", ".playwright-mcp")
$SkipSuffixes = @(".pyc", ".pyo", ".zip", ".log")

function Should-Skip($item) {
    if ($SkipNames -contains $item.Name) { return $true }
    if ($SkipSuffixes -contains $item.Extension.ToLower()) { return $true }
    return $false
}

function Get-FilesToPack($dir) {
    $results = @()
    if (-not (Test-Path $dir)) { return $results }
    Get-ChildItem -Path $dir -Recurse | ForEach-Object {
        if (-not (Should-Skip $_)) {
            if (-not $_.PSIsContainer) {
                $results += $_
            }
        }
    }
    return $results
}

$files = @()
if ($Full) {
    $files = Get-FilesToPack $Root
} else {
    $items = @(".agents")
    if ($WithRules) {
        $items += "GEMINI.md"
        $items += "AGENTS.md"
    }
    foreach ($item in $items) {
        $target = Join-Path $Root $item
        if (Test-Path $target) {
            if ((Get-Item $target).PSIsContainer) {
                $files += Get-FilesToPack $target
            } else {
                if (-not (Should-Skip (Get-Item $target))) {
                    $files += Get-Item $target
                }
            }
        }
    }
}

if ($files.Count -eq 0) {
    Write-Error "담을 파일이 없습니다."
    exit 1
}

# Load zip assembly
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

if (Test-Path $OutPath) { Remove-Item $OutPath -Force }

$zip = [System.IO.Compression.ZipFile]::Open($OutPath, [System.IO.Compression.ZipArchiveMode]::Create)

$totalBytes = 0
foreach ($file in $files) {
    if ($file.FullName -eq (Resolve-Path $OutPath -ErrorAction SilentlyContinue).Path) { continue }
    
    $relPath = $file.FullName.Substring($Root.Path.Length + 1).Replace("\", "/")
    $entryName = "$ProjectName/$relPath"
    
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    $totalBytes += $file.Length
}

# Template replacements
$templatePath = Join-Path $PSScriptRoot "시작하기-템플릿.md"
$rulesTemplatePath = Join-Path $PSScriptRoot "GEMINI-템플릿.md"

if (-not $Full -and -not $WithRules) {
    $rulesContent = Get-Content $rulesTemplatePath -Raw -Encoding UTF8
    $rulesEntry = $zip.CreateEntry("$ProjectName/GEMINI.md", [System.IO.Compression.CompressionLevel]::Optimal)
    $writer = New-Object System.IO.StreamWriter($rulesEntry.Open(), [System.Text.Encoding]::UTF8)
    $writer.Write($rulesContent)
    $writer.Close()
}

$skills = Get-ChildItem -Path (Join-Path $Root ".agents\skills") -ErrorAction SilentlyContinue | Where-Object { Test-Path (Join-Path $_.FullName "SKILL.md") } | Select-Object -ExpandProperty Name
$skillLines = if ($skills) { ($skills | ForEach-Object { "- **$_**" }) -join "`n" } else { "- (없음)" }

$contents = if ($Full) {
    "프로젝트 파일 전부와 에이전트 설정(`.agents/`, 규칙 파일)이 들어 있다.`n받는 사람이 곧바로 이어서 작업할 수 있다."
} else {
    "에이전트 설정(`.agents/`)과 규칙 파일 서식(`GEMINI.md`)이 들어 있다.`n이 폴더를 그대로 열어서 써도 되고, 두 항목을 이미 쓰던 프로젝트 폴더로 옮겨도 된다."
}

$intro = if ($ForWhom) { "`n**$ForWhom** 에서 쓰는 폴더다.`n" } else { "" }

$mcpSection = ""
$mcpConfigPath = Join-Path $Root ".agents\mcp_config.json"
if (Test-Path $mcpConfigPath) {
    try {
        $json = Get-Content $mcpConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json
        $servers = $json.mcpServers.psobject.properties.Name
        if ($servers) {
            $serverList = ($servers | ForEach-Object { "- **$_**" }) -join "`n"
            $mcpSection = @"

## 추가 — 딸려오는 도구 (MCP)

이 폴더에는 아래 도구가 **미리 등록되어 있다.** 따로 설치하거나 설정할 필요 없이,
폴더를 열면 에이전트가 바로 쓸 수 있다.

$serverList

다만 이 도구들은 **Node.js**를 필요로 한다. 없으면 도구만 안 뜨고 나머지는 정상 동작하니,
당장 필요하지 않다면 넘어가도 된다. 설치하려면 <https://nodejs.org> 에서 LTS 버전을 받는다.

잘 붙었는지는 `...`(Additional Options) → `MCP Servers`에서 확인할 수 있다.
"@
        }
    } catch {}
}

$readmeContent = Get-Content $templatePath -Raw -Encoding UTF8
$readmeContent = $readmeContent.Replace("{{PROJECT}}", $ProjectName)
$readmeContent = $readmeContent.Replace("{{FOR}}", $intro)
$readmeContent = $readmeContent.Replace("{{CONTENTS}}", $contents)
$readmeContent = $readmeContent.Replace("{{SKILLS}}", $skillLines)
$readmeContent = $readmeContent.Replace("{{MCP}}", $mcpSection)

$readmeEntry = $zip.CreateEntry("$ProjectName/시작하기.md", [System.IO.Compression.CompressionLevel]::Optimal)
$writer = New-Object System.IO.StreamWriter($readmeEntry.Open(), [System.Text.Encoding]::UTF8)
$writer.Write($readmeContent)
$writer.Close()

$zip.Dispose()

$outItem = Get-Item $OutPath
$compressedSize = $outItem.Length

$modeText = if ($Full) { 'FULL' } else { 'SETUP_ONLY' }
Write-Host "Created zip file: $OutPath"
Write-Host "  Files count: $($files.Count + 2)"
Write-Host "  Mode: $modeText"
Write-Host "Done. Share this zip file with team members."
