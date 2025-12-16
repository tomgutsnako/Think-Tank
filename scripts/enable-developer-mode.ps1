# Enable Developer Mode registry keys (requires elevation)
$projectDir = "C:\Users\Dash Longgadog\Downloads\Think Tank Prototype Development"
try {
    New-Item -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" -Force -ErrorAction SilentlyContinue | Out-Null
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" -Name "AllowDevelopmentWithoutDevLicense" -Value 1 -Type DWord -Force
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" -Name "AllowAllTrustedApps" -Value 1 -Type DWord -Force

    $props = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock"
    $out = "Developer Mode registry keys set:`n$($props | Format-List | Out-String)"
    $logFile = Join-Path $projectDir "devmode-result.txt"
    $out | Out-File -FilePath $logFile -Encoding utf8
    Write-Output "Developer Mode keys written to: $logFile"
} catch {
    $err = "Error enabling Developer Mode: $($_ | Out-String)"
    $err | Out-File -FilePath (Join-Path $projectDir "devmode-result.txt") -Encoding utf8 -Append
    Write-Output $err
}
Read-Host "Press Enter to close this window..."