# Think Tank Prototype Development

Short project README: build and packaging notes for local development.

## Packaging (Windows)

- Build and package the app (production):

```powershell
npm run dist
```

- If you run into permission issues creating symbolic links during packaging (7-Zip errors like "A required privilege is not held by the client"), use the provided helper script to run packaging under an elevated temporary Administrator account without changing system policies:

```powershell
# Run this script as Administrator (UAC prompt)
Start-Process powershell -Verb runAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File "scripts\run-dist-as-admin.ps1"' -Wait
```

The helper script enables the built-in Administrator, runs the pack, captures a log at `pack-log-admin.txt`, and disables the Administrator account when finished.

## Artifacts

- Installer: `release\Think Tank Prototype Setup 0.1.0.exe`
- Pack log (Admin run): `pack-log-admin.txt`
- Output folder: `release\win-unpacked`

## Permanent fix (recommended)

To avoid needing the helper script in the future, grant your user account the **Create symbolic links** user right:

1. Run `secpol.msc` → Local Policies → User Rights Assignment → **Create symbolic links** → Add your user.
2. Sign out and sign back in (no full reboot required).

## Notes

- The helper script is intended as a safe, temporary workaround. Use the Local Security Policy GUI to apply a permanent fix if you prefer not to run packaging as Administrator.
- Packaging logs and installer artifacts are kept in the `release/` directory.

