
$projectDir = "C:\Users\Dash Longgadog\Downloads\Think Tank Prototype Development"
cd $projectDir


$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = Join-Path $projectDir "pack-log-$timestamp.txt"
$startMsg = "Starting packaging at $(Get-Date) ...`nLogging to: $logFile"
Write-Output $startMsg
$startMsg | Out-File -FilePath $logFile -Encoding utf8 -Append

try {
    
    npm run dist *>&1 | Tee-Object -FilePath $logFile -Append
    $exitCode = $LASTEXITCODE
    $finishMsg = "`nPackaging finished with exit code $exitCode at $(Get-Date)"
    Write-Output $finishMsg
    $finishMsg | Out-File -FilePath $logFile -Encoding utf8 -Append
} catch {
    $err = "`nError during packaging: $($_ | Out-String)"
    Write-Output $err
    $err | Out-File -FilePath $logFile -Encoding utf8 -Append
}

Write-Output "`nPackaging complete. Log: $logFile"
Write-Output "Press Enter to close this window..."
$null = Read-Host
