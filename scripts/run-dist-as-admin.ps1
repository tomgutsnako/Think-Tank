# Run this script elevated (it will try to run itself elevated if not already)
$ErrorActionPreference = 'Stop'
$project = 'C:\Users\Dash Longgadog\Downloads\Think Tank Prototype Development'
$log = Join-Path $project 'pack-log-admin.txt'
$pass = 'TempAdm!2025$'

Write-Output "Enabling built-in Administrator..."
net user Administrator /active:yes
Write-Output "Setting Administrator password..."
net user Administrator $pass

Write-Output "Preparing credential and launching packaging as Administrator..."
$sec = ConvertTo-SecureString $pass -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('Administrator', $sec)
$cmd = "cd '$project'; npm run dist 2>&1 | Out-File -FilePath '$log' -Width 200; exit $LASTEXITCODE"
Start-Process -FilePath powershell -ArgumentList ('-NoProfile','-ExecutionPolicy','Bypass','-Command',$cmd) -Credential $cred -WorkingDirectory $project -Wait

Write-Output "Packaging finished; disabling built-in Administrator..."
net user Administrator /active:no
Write-Output "Done. Log: $log"