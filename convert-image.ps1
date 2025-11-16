# Script to convert image to base64
$imagePath = "C:\Users\lenovo\OneDrive\سطح المكتب\mazen\unnamed.jpg"

# Try different possible paths
$possiblePaths = @(
    "C:\Users\lenovo\OneDrive\سطح المكتب\mazen\unnamed.jpg",
    "C:\Users\lenovo\OneDrive\سطح المكتب\mazen\unnamed\jpg",
    "C:\Users\lenovo\OneDrive\سطح المكتب\mazen\unnamed.jpg"
)

$foundPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $foundPath = $path
        Write-Host "Found image at: $path"
        break
    }
}

if (-not $foundPath) {
    # Search for JPG files in the mazen directory
    $mazenDir = "C:\Users\lenovo\OneDrive\سطح المكتب\mazen"
    if (Test-Path $mazenDir) {
        $jpgFiles = Get-ChildItem -Path $mazenDir -Recurse -Filter *.jpg -ErrorAction SilentlyContinue
        if ($jpgFiles.Count -gt 0) {
            $foundPath = $jpgFiles[0].FullName
            Write-Host "Found image at: $foundPath"
        }
    }
}

if ($foundPath) {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($foundPath)
        $base64 = [System.Convert]::ToBase64String($bytes)
        $mimeType = "image/jpeg"
        $dataUrl = "data:$mimeType;base64,$base64"
        
        # Save to file
        $outputFile = "image-base64.txt"
        $dataUrl | Out-File -FilePath $outputFile -Encoding UTF8
        Write-Host "Image converted successfully! Base64 saved to: $outputFile"
        Write-Host "Data URL length: $($dataUrl.Length) characters"
    } catch {
        Write-Host "Error converting image: $_"
    }
} else {
    Write-Host "Image not found. Please check the path."
}

