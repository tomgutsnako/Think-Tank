# Think Tank Prototype Development

Short project README: build and packaging notes for local development.

## Getting started  Development

Follow these steps to run the app locally for development (fast edit-refresh cycle):

1. Install dependencies

```powershell
npm ci
```

2. Start the Vite dev server (in Terminal A)

```powershell
npm run dev
```

Vite usually serves at http://localhost:5173 — note the exact URL printed in the terminal.

3. Launch Electron (in Terminal B) pointed at the running dev server

- PowerShell:

```powershell
$env:VITE_DEV_SERVER_URL='http://localhost:5173'
electron .
```

- CMD (Windows):

```cmd
set VITE_DEV_SERVER_URL=http://localhost:5173 && electron .
```

> Tip: Use two terminals (one for Vite, one for Electron). If Vite selects a different port, copy the full dev server URL it prints and set it in `VITE_DEV_SERVER_URL` before running Electron.

Note: The existing `start:electron` script runs a production build and then starts Electron (slower), so the dev server + env approach above is better for iterative development.

---

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

- Installer (if available): `release\Think Tank Prototype Setup 0.1.0.exe` or the latest asset on the project's **GitHub Releases** page.
- Pack log (Admin run): `pack-log-admin.txt`
- Output folder (portable/unpacked app): `release\win-unpacked`

### Installing & unpacking the app (Windows) 

Options to get and run the app:

1. Installer (recommended)

- Download the latest `Think Tank Prototype Setup <version>.exe` from **GitHub Releases** (or a provided release asset).
- Double-click the `.exe` and follow the installer prompts.
- After installation you'll find the app in the Start Menu (search "Think Tank Prototype") or run the executable from the installation folder (usually `C:\Program Files\Think Tank Prototype\Think Tank Prototype.exe`).

2. Portable / Unpacked folder (developer-friendly)

- If you or a teammate ran `npm run dist`, the unpacked app will be available at `release\win-unpacked`.
- You can run the app directly by executing `release\win-unpacked\Think Tank Prototype.exe` or copy the folder and run the exe from there.

3. Extract installer without running it (7‑Zip)

- GUI: Right-click the `.exe` → 7‑Zip → "Extract to \"Think Tank Prototype Setup <version>\"".
- CLI: `7z x "release\Think Tank Prototype Setup 0.1.0.exe" -o"release\extracted"`

Notes & cautions:

- Windows SmartScreen or Defender may warn on unsigned builds — use the Release artifacts served from GitHub or CI for distribution.
- The portable `win-unpacked` folder is a quick way to test the built app without running the installer.

## Permanent fix (recommended)

To avoid needing the helper script in the future, grant your user account the **Create symbolic links** user right:

1. Run `secpol.msc` → Local Policies → User Rights Assignment → **Create symbolic links** → Add your user.
2. Sign out and sign back in (no full reboot required).

## Notes

- The helper script is intended as a safe, temporary workaround. Use the Local Security Policy GUI to apply a permanent fix if you prefer not to run packaging as Administrator.
- Packaging logs and installer artifacts are kept in the `release/` directory.

