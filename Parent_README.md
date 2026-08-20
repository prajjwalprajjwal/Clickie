# ESP32 Keyring Clicker

An open-source, low-power ESP32 keyring device featuring a minimalist, personality-driven interface, local NVS data persistence, and a Web Serial firmware deployment pipeline.

---

## Repository Architecture
```
├── Artworks/               # Visual design, pixel graphics, and product assets
│   ├── Exports/            # Rendered image exports (PNG/BMP) for OLED display conversion
│   └── PIXEL SCREENS.ai   # Master Adobe Illustrator source file for display graphics
│
└── Clicker_Code/           # PlatformIO project, firmware logic, and deployment scripts
    ├── include/            # C++ header files and hardware interface definitions
    ├── src/                # Application source code (OSManager, InputManager, etc.)
    ├── releases/           # Versioned binary builds (v1.0.0, etc.)
    ├── tools/              # Helper scripts and utility tools
    ├── web_flasher/        # Web Serial flasher deployment site (hosted via Cloudflare)
    ├── CHANGELOG.md        # Parent log documenting project milestones and decisions
    ├── PROJECT_RULES.md    # Code freeze rules and AI assistant boundaries
    ├── build_release.bat   # Interactive release manager (semantic version bumping)
    ├── flash_device.bat    # Interactive CLI flasher with NVS data preservation options
    └── platformio.ini      # PlatformIO configuration and board settings
```
---

## Subdirectory Breakdown

###  Artworks/
Contains all visual and graphical assets for the project. The Adobe Illustrator file (`PIXEL SCREENS.ai`) serves as the canvas for designing custom 128x64 OLED display artwork, screen layouts, and icon sequences. Exported image files inside `Exports/` are converted into C++ byte arrays for display rendering.

###  Clicker_Code/
Contains the complete firmware codebase, compilation system, and deployment pipeline.

* **Firmware Stack:** Built with PlatformIO for ESP32 DOIT DevKit V1 and SSD1306 OLED display.
* **Persistent Storage:** Uses NVS memory (`0x9000` partition) to ensure click counts, stats, and milestones persist across resets and updates.
* **Web Deployment:** Integrates with the official web installer hosted at https://flashclicker.uprajjwal.com.np.

---

##  Quick Start & Development Workflow

### 1. Local Testing & Compilation
Open `Clicker_Code/` in VS Code with the PlatformIO extension installed:
* **Build Firmware:** `pio run`
* **Flash via USB:** `pio run --target upload`

### 2. Updating Firmware Safely (Preserving Stats)
To update your device without losing saved click stats:
* **Option A (Web):** Visit https://flashclicker.uprajjwal.com.np using Chrome or Edge and click **Install**. Select **Keep Data** when prompted.
* **Option B (CLI):** Run `Clicker_Code/flash_device.bat` and select Option 1 (*Standard Update - Keep Data*).

> ** WARNING ON THIRD-PARTY FLASHERS:** Generic flashing tools like `web.esphome.io` or full chip erase commands (`esptool.py erase_flash`) will **permanently erase** the device's NVS partition and reset all click stats to 0. Always use the official web flasher or `flash_device.bat` to keep your data intact.

### 3. Creating a New Firmware Release
To create and publish a new firmware release:
1. Navigate to `Clicker_Code/`.
2. Execute `build_release.bat`.
3. Choose the release type (*Major*, *Minor*, or *Bug Fix*). The script automatically compiles the binaries, creates the versioned release folder, updates `manifest.json` and `versions.json`, and merges the factory binary.
4. Push your changes to GitHub:
   git add .
   git commit -m "Release vX.Y.Z"
   git push origin main
5. Cloudflare Pages will automatically detect the commit and deploy the update to https://flashclicker.uprajjwal.com.np.

---

##  Code Freeze & Contribution Guidelines

Core files critical to hardware functionality and data safety (`StorageManager.cpp`, pin definitions, and Web Serial scripts) are locked under project safety rules. 

Before modifying core storage or hardware definitions, review `Clicker_Code/PROJECT_RULES.md` and check `Clicker_Code/CHANGELOG.md` for historical design decisions.
