# Clicker ESP32 Firmware

Official open-source firmware for the ESP32-based Clicker device.

> [!NOTE]
> **Developer / AI Agent Notice**: Critical subsystems (NVS memory, display/hardware configurations, and release directories) are locked under code freeze. See [`PROJECT_RULES.md`](PROJECT_RULES.md) before making modifications.

---

## Features
- **Zero Idle Power Drain**: High-efficiency state machine with OLED display management.
- **100% NVS Data Preservation**: Lifetime clicks, completed cycles, milestone bitmasks, and applet states are saved in Non-Volatile Storage (NVS) at partition `0x9000`.
- **Web Serial Firmware Updater**: Web-based flasher powered by [ESP Web Tools](https://esphome.github.io/esp-web-tools/) for zero-driver browser updates.

---

## 1-Click Desktop Scripts

| Script | Purpose |
|---|---|
| [`run_flasher.bat`](run_flasher.bat) | Starts local web server & automatically opens Web Serial flasher in your default browser. |
| [`flash_device.bat`](flash_device.bat) | Interactive desktop terminal flasher (auto COM port detection, Update vs Clean Reset). |
| [`build_release.bat`](build_release.bat) | Interactive release manager (semantic version bump, PlatformIO build, 3-part packaging). |

---

## Quick Start (Flashing Firmware)

### 1. Web-Based Browser Flasher (Recommended)
1. Double-click [`run_flasher.bat`](run_flasher.bat) (or run `python tools/flasher/serve_flasher.py`).
2. Your browser will automatically open `http://localhost:8080/web_flasher/index.html`.
3. Connect your ESP32 via USB and click **"Connect & Flash Device"**.

> [!NOTE]
> **Post-Flash Reboot**: After flashing completes, if the screen does not turn on immediately, press the **EN / RESET** button on your ESP32 board or unplug/replug the USB cable to exit bootloader download mode.

---

## Building & Publishing Firmware Releases

### 1. Local Development & Testing
To compile and flash directly to your connected device using PlatformIO CLI:

```bash
# Build firmware
pio run -e esp32doit-devkit-v1

# Upload directly to ESP32 over serial COM port
pio run --target upload
```

### 2. Interactive Release Publishing (`build_release.bat`)
When you are ready to publish a new version:

```powershell
.\build_release.bat
```

The interactive menu will display your current version and prompt you:
```
============================================================
    CLICKER ESP32 FIRMWARE RELEASE MANAGER
============================================================
  Current active version: v1.0.0

  Select release type:
    [1] Major Release         (v2.0.0)
    [2] Minor / Feature       (v1.1.0)
    [3] Bug Fix / Patch       (v1.0.1)
    [4] Custom Version Tag    (enter manually)
    [Q] Quit / Cancel
```

This automated workflow will:
1. Recompile the firmware binary via PlatformIO.
2. Create `releases/vX.Y.Z/` with `bootloader.bin`, `partitions.bin`, and `firmware.bin`.
3. Generate the 3-part manifest with `"new_install_prompt_erase": true`.
4. Automatically maintain the last 5 release folders and update `web_flasher/versions.json`.
5. Sync files to `web_flasher/` for local and web flasher hosting.

### 3. Deploying / Pushing to GitHub
Commit and push the updated repository:
```bash
git add .
git commit -m "Release vX.Y.Z"
git push
```

---

---

## Data Preservation & Firmware Updates

> [!WARNING]
> **THIRD-PARTY WEB FLASHER WARNING (`web.esphome.io`)**:  
> Third-party tools like **web.esphome.io** automatically execute a full chip erase before writing binaries, which **PERMANENTLY WIPES ALL SAVED DATA** (lifetime clicks, milestones, and settings in NVS).  
> 
> To update your firmware without losing your data, use either:
> 1. **The Official Web Flasher** (`run_flasher.bat` or `https://click.uprajjwal.com.np/flash`) with Chrome/Edge.
> 2. **The Desktop CLI Flasher** (`.\flash_device.bat` &rarr; Option `[1] Standard Update`).

---

## Manual Flashing Methods

For desktop users who want to flash without a web browser or using third-party tools:

### 1. Interactive Desktop CLI Flasher (Recommended)
Double-click [`flash_device.bat`](flash_device.bat) or run:

```powershell
.\flash_device.bat
```

This tool automatically detects your COM port and presents an interactive choice:
- **`[1] Standard Update (Keep Data)`**: Flashes `firmware.bin` directly to `0x10000` **without** erasing flash, preserving all lifetime clicks and unlocked milestones in NVS (`0x9000`).
- **`[2] Clean Factory Reset (Erase All Data)`**: Erases flash and writes `factory_firmware.bin` to `0x0`.

---

### 2. Manual Commands via `esptool.py`

#### A. Standard Update (KEEP STATS & CLICKS):
```bash
esptool.py --chip esp32 --port COMx write_flash 0x10000 releases/v1.0.0/firmware.bin
```
> [!IMPORTANT]
> To keep your stats, flash `firmware.bin` at address `0x10000` **WITHOUT** running `erase_flash`.

#### B. Clean Factory Reset / Unbrick Recovery:
```bash
esptool.py --chip esp32 --port COMx erase_flash
esptool.py --chip esp32 --port COMx write_flash 0x0 releases/v1.0.0/factory_firmware.bin
```
> [!NOTE]
> Only flash `factory_firmware.bin` at `0x0` if doing a fresh board recovery or factory reset.

---

## Partition & Memory Layout

| Partition | Start Address | Size | Description |
|-----------|---------------|------|-------------|
| Bootloader | `0x1000` | 28 KB | ESP32 Second Stage Bootloader |
| Partition Table | `0x8000` | 4 KB | Partition Table Header |
| NVS Storage | `0x9000` | 20 KB | Persistent click counts & milestones (`Preferences.h`) |
| Application (`app0`) | `0x10000` (65536) | 1.25 MB | Active Clicker firmware binary |

