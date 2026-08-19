[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-TaskFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Description
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Required $Description was not found: $Path"
    }
}

function Assert-TaskDirectory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Description
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "Required $Description was not found: $Path"
    }
}

function Test-TaskPathWithinRoot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Root
    )

    $taskFullPath = [System.IO.Path]::GetFullPath($Path)
    $taskFullRoot = [System.IO.Path]::GetFullPath($Root).TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    ) + [System.IO.Path]::DirectorySeparatorChar

    return $taskFullPath.StartsWith(
        $taskFullRoot,
        [System.StringComparison]::OrdinalIgnoreCase
    )
}

function Format-TaskBytes {
    param(
        [Parameter(Mandatory = $true)]
        [long]$Bytes
    )

    if ($Bytes -ge 1GB) {
        return "{0:N2} GB" -f ($Bytes / 1GB)
    }

    if ($Bytes -ge 1MB) {
        return "{0:N2} MB" -f ($Bytes / 1MB)
    }

    if ($Bytes -ge 1KB) {
        return "{0:N2} KB" -f ($Bytes / 1KB)
    }

    return "$Bytes bytes"
}

$taskScriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$taskRepositoryRoot = [System.IO.Path]::GetFullPath(
    (Join-Path $taskScriptDirectory "..")
)
$taskSourceRoot = Join-Path $taskRepositoryRoot "PrototypeWebApp"
$taskOutputDirectory = Join-Path $taskRepositoryRoot "StaticPackage"
$taskZipPath = Join-Path $taskRepositoryRoot "StaticPackage.zip"

$taskPageSource = Join-Path $taskSourceRoot "AccessiblePrototype.aspx"
$taskCssSource = Join-Path $taskSourceRoot "Content\accessibility-prototype.css"
$taskScenarioEngineSource = Join-Path $taskSourceRoot "Scripts\scenario-engine.js"
$taskSimulatorSource = Join-Path $taskSourceRoot "Scripts\accessibility-simulator.js"
$taskCatalogSource = Join-Path $taskSourceRoot "prototypes\scenarios.xml"
$taskPrototypeSourceRoot = Join-Path $taskSourceRoot "prototypes"
$taskMediaSource = Join-Path $taskSourceRoot "media"

Assert-TaskDirectory -Path $taskSourceRoot -Description "authoritative PrototypeWebApp directory"
Assert-TaskFile -Path $taskPageSource -Description "flagship ASP.NET page"
Assert-TaskFile -Path $taskCssSource -Description "simulator stylesheet"
Assert-TaskFile -Path $taskScenarioEngineSource -Description "scenario engine"
Assert-TaskFile -Path $taskSimulatorSource -Description "simulator renderer"
Assert-TaskFile -Path $taskCatalogSource -Description "scenario catalog"
Assert-TaskDirectory -Path $taskPrototypeSourceRoot -Description "scenario XML directory"
Assert-TaskDirectory -Path $taskMediaSource -Description "media directory"

$taskOutputParent = Split-Path -Parent ([System.IO.Path]::GetFullPath($taskOutputDirectory))
$taskZipParent = Split-Path -Parent ([System.IO.Path]::GetFullPath($taskZipPath))

if (
    $taskOutputParent -ne $taskRepositoryRoot -or
    (Split-Path -Leaf $taskOutputDirectory) -ne "StaticPackage"
) {
    throw "Refusing to replace an unexpected output directory: $taskOutputDirectory"
}

if (
    $taskZipParent -ne $taskRepositoryRoot -or
    (Split-Path -Leaf $taskZipPath) -ne "StaticPackage.zip"
) {
    throw "Refusing to replace an unexpected ZIP path: $taskZipPath"
}

if (Test-Path -LiteralPath $taskOutputDirectory) {
    Remove-Item -LiteralPath $taskOutputDirectory -Recurse -Force
}

if (Test-Path -LiteralPath $taskZipPath) {
    Remove-Item -LiteralPath $taskZipPath -Force
}

$taskContentOutput = Join-Path $taskOutputDirectory "Content"
$taskScriptsOutput = Join-Path $taskOutputDirectory "Scripts"
$taskPrototypesOutput = Join-Path $taskOutputDirectory "prototypes"
$taskMediaOutput = Join-Path $taskOutputDirectory "media"

foreach ($taskDirectory in @(
    $taskOutputDirectory,
    $taskContentOutput,
    $taskScriptsOutput,
    $taskPrototypesOutput,
    $taskMediaOutput
)) {
    New-Item -ItemType Directory -Path $taskDirectory -Force | Out-Null
}

$taskUtf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
$taskPageMarkup = [System.IO.File]::ReadAllText($taskPageSource)
$taskPageMarkup = [System.Text.RegularExpressions.Regex]::Replace(
    $taskPageMarkup,
    '(?im)^\s*<%@\s*Page\b.*?%>\s*\r?\n?',
    ''
)
$taskPageMarkup = [System.Text.RegularExpressions.Regex]::Replace(
    $taskPageMarkup,
    '\s+runat\s*=\s*(["''])server\1',
    '',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)

$taskForbiddenMarkup = @(
    '<%@',
    'runat\s*=',
    'CodeBehind\s*=',
    'Inherits\s*=',
    '<asp:'
)

foreach ($taskPattern in $taskForbiddenMarkup) {
    if ([System.Text.RegularExpressions.Regex]::IsMatch(
        $taskPageMarkup,
        $taskPattern,
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )) {
        throw "Static HTML still contains unsupported ASP.NET markup matching: $taskPattern"
    }
}

$taskIndexPath = Join-Path $taskOutputDirectory "index.html"
[System.IO.File]::WriteAllText($taskIndexPath, $taskPageMarkup, $taskUtf8WithoutBom)

Copy-Item -LiteralPath $taskCssSource -Destination $taskContentOutput -Force
Copy-Item -LiteralPath $taskScenarioEngineSource -Destination $taskScriptsOutput -Force
Copy-Item -LiteralPath $taskSimulatorSource -Destination $taskScriptsOutput -Force

Copy-Item -LiteralPath $taskCatalogSource -Destination $taskPrototypesOutput -Force

[xml]$taskCatalog = [System.IO.File]::ReadAllText($taskCatalogSource)
$taskScenarioNodes = @($taskCatalog.SelectNodes('/scenarios/scenario'))

if ($taskScenarioNodes.Count -eq 0) {
    throw "The scenario catalog does not contain any scenario entries."
}

$taskScenarioPaths = New-Object 'System.Collections.Generic.HashSet[string]' (
    [System.StringComparer]::OrdinalIgnoreCase
)

foreach ($taskScenarioNode in $taskScenarioNodes) {
    $taskEnabled = $taskScenarioNode.GetAttribute("enabled")

    if ($taskEnabled -and $taskEnabled -notmatch '^(?i:true)$') {
        continue
    }

    $taskFileNode = $taskScenarioNode.SelectSingleNode('./file')

    if ($null -eq $taskFileNode -or [string]::IsNullOrWhiteSpace($taskFileNode.InnerText)) {
        throw "Enabled scenario '$($taskScenarioNode.GetAttribute("id"))' has no XML file path."
    }

    $taskRelativeScenarioPath = $taskFileNode.InnerText.Trim().Replace(
        '/',
        [System.IO.Path]::DirectorySeparatorChar
    )

    if ([System.IO.Path]::IsPathRooted($taskRelativeScenarioPath)) {
        throw "Scenario path must be relative: $taskRelativeScenarioPath"
    }

    $taskScenarioSource = [System.IO.Path]::GetFullPath(
        (Join-Path $taskSourceRoot $taskRelativeScenarioPath)
    )

    if (-not (Test-TaskPathWithinRoot -Path $taskScenarioSource -Root $taskPrototypeSourceRoot)) {
        throw "Scenario path leaves the authoritative prototypes directory: $taskRelativeScenarioPath"
    }

    Assert-TaskFile -Path $taskScenarioSource -Description "enabled scenario XML"

    if ([System.IO.Path]::GetExtension($taskScenarioSource) -ne ".xml") {
        throw "Enabled scenario file is not XML: $taskRelativeScenarioPath"
    }

    [void]$taskScenarioPaths.Add($taskRelativeScenarioPath)
}

foreach ($taskRelativeScenarioPath in $taskScenarioPaths) {
    $taskScenarioSource = Join-Path $taskSourceRoot $taskRelativeScenarioPath
    $taskScenarioDestination = Join-Path $taskOutputDirectory $taskRelativeScenarioPath
    $taskScenarioDestinationParent = Split-Path -Parent $taskScenarioDestination

    New-Item -ItemType Directory -Path $taskScenarioDestinationParent -Force | Out-Null
    Copy-Item -LiteralPath $taskScenarioSource -Destination $taskScenarioDestination -Force
}

foreach ($taskMediaEntry in Get-ChildItem -LiteralPath $taskMediaSource -Force) {
    Copy-Item -LiteralPath $taskMediaEntry.FullName -Destination $taskMediaOutput -Recurse -Force
}

$taskReadme = @'
PCWA Scam Awareness Simulator - Static Deployment Package

This folder contains the complete browser-based simulator.

Deployment:
1. Upload the contents of this folder to a web-accessible directory.
2. Preserve the folder structure.
3. Configure index.html as the entry page if needed.
4. Access the simulator through HTTP or HTTPS.

Example:
https://example.org/scam-awareness/

Important:
- Do not open index.html directly using file:// because the simulator loads scenario XML at runtime.
- Serve the package from an HTTP or HTTPS web server.
- Content/, Scripts/, prototypes/, and media/ must remain relative to index.html.
- No ASP.NET or .NET Framework runtime is required for this package.
'@

$taskReadmePath = Join-Path $taskOutputDirectory "README.txt"
[System.IO.File]::WriteAllText($taskReadmePath, $taskReadme.Trim() + [Environment]::NewLine, $taskUtf8WithoutBom)

$taskPackageItems = @(Get-ChildItem -LiteralPath $taskOutputDirectory -Force)

if ($taskPackageItems.Count -eq 0) {
    throw "The generated package is empty."
}

Compress-Archive -Path ($taskPackageItems | ForEach-Object { $_.FullName }) `
    -DestinationPath $taskZipPath `
    -CompressionLevel Optimal `
    -Force

Assert-TaskFile -Path $taskZipPath -Description "generated static package ZIP"

$taskPackageFiles = @(Get-ChildItem -LiteralPath $taskOutputDirectory -Recurse -File)
$taskMediaFiles = @(Get-ChildItem -LiteralPath $taskMediaOutput -Recurse -File)
$taskMp4Files = @($taskMediaFiles | Where-Object { $_.Extension -ieq ".mp4" })
$taskUncompressedBytes = [long](($taskPackageFiles | Measure-Object Length -Sum).Sum)
$taskZipBytes = [long](Get-Item -LiteralPath $taskZipPath).Length
$taskXmlCount = 1 + $taskScenarioPaths.Count
$taskJavaScriptCount = @(Get-ChildItem -LiteralPath $taskScriptsOutput -Filter "*.js" -File).Count
$taskCssCount = @(Get-ChildItem -LiteralPath $taskContentOutput -Filter "*.css" -File).Count

Write-Host "Static deployment package created successfully."
Write-Host "Output directory: $taskOutputDirectory"
Write-Host "ZIP path: $taskZipPath"
Write-Host "XML files copied: $taskXmlCount"
Write-Host "JavaScript files copied: $taskJavaScriptCount"
Write-Host "CSS files copied: $taskCssCount"
Write-Host "Media files copied: $($taskMediaFiles.Count)"
Write-Host "MP4 files copied: $($taskMp4Files.Count)"
Write-Host "Uncompressed package size: $(Format-TaskBytes -Bytes $taskUncompressedBytes) ($taskUncompressedBytes bytes)"
Write-Host "ZIP size: $(Format-TaskBytes -Bytes $taskZipBytes) ($taskZipBytes bytes)"
