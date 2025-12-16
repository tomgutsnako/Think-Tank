# Grant SeCreateSymbolicLinkPrivilege to Administrators (requires elevation)
$projectDir = "C:\Users\Dash Longgadog\Downloads\Think Tank Prototype Development"
$infPath = Join-Path $projectDir "grant-symlink.inf"
$logFile = Join-Path $projectDir "grant-symlink-log.txt"

$infContent = @'
[Unicode]
Unicode=yes
[Version]
signature="$CHICAGO$"
Revision=1

[Privilege Rights]
SeCreateSymbolicLinkPrivilege = *S-1-5-32-544
'@

# Write INF as ASCII (required by secedit)
$infContent | Out-File -FilePath $infPath -Encoding ASCII

Write-Output "Applying privilege template: $infPath" | Tee-Object -FilePath $logFile -Append

# Apply using secedit
secedit /configure /db C:\Windows\security\local.sdb /cfg $infPath /areas USER_RIGHTS 2>&1 | Tee-Object -FilePath $logFile -Append

Write-Output "Operation complete. See log: $logFile" | Tee-Object -FilePath $logFile -Append
Write-Output "Press Enter to close this window..."
$null = Read-Host
