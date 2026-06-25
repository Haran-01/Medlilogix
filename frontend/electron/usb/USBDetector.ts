import { execFile } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { USB_EVENTS, type USBDeviceInfo, type USBStatusPayload } from './USBEvents';

interface WindowsLogicalDisk {
  DeviceID?: string;
  VolumeName?: string;
}

export class USBDetector extends EventEmitter {
  private currentDevice: USBDeviceInfo | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly pollIntervalMs: number;

  constructor(pollIntervalMs = 2500) {
    super();
    this.pollIntervalMs = pollIntervalMs;
  }

  start() {
    if (this.intervalId) {
      return;
    }

    void this.checkForRemovableDrive();
    this.intervalId = setInterval(() => {
      void this.checkForRemovableDrive();
    }, this.pollIntervalMs);
  }

  stop() {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  getStatus(): USBStatusPayload {
    return {
      connected: Boolean(this.currentDevice),
      device: this.currentDevice,
    };
  }

  private async checkForRemovableDrive() {
    const nextDevice = await this.getFirstWindowsRemovableDrive();
    const previousDrive = this.currentDevice?.driveLetter;
    const nextDrive = nextDevice?.driveLetter;

    if (previousDrive === nextDrive) {
      this.emitStatus();
      return;
    }

    if (nextDevice) {
      this.currentDevice = nextDevice;
      this.emit(USB_EVENTS.CONNECTED, nextDevice);
      this.emitStatus();
      return;
    }

    if (this.currentDevice) {
      const disconnectedDevice = {
        ...this.currentDevice,
        status: 'disconnected' as const,
      };
      this.currentDevice = null;
      this.emit(USB_EVENTS.DISCONNECTED, disconnectedDevice);
      this.emitStatus();
    }
  }

  private emitStatus() {
    this.emit(USB_EVENTS.STATUS, this.getStatus());
  }

  private getFirstWindowsRemovableDrive(): Promise<USBDeviceInfo | null> {
    if (process.platform !== 'win32') {
      return Promise.resolve(null);
    }

    const command = [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      'Get-CimInstance Win32_LogicalDisk -Filter "DriveType=2" | Select-Object DeviceID,VolumeName | ConvertTo-Json -Compress',
    ];

    return new Promise((resolve) => {
      execFile('powershell.exe', command, { windowsHide: true }, (error, stdout) => {
        if (error || !stdout.trim()) {
          resolve(null);
          return;
        }

        try {
          const parsed = JSON.parse(stdout.trim()) as WindowsLogicalDisk | WindowsLogicalDisk[];
          const firstDrive = Array.isArray(parsed) ? parsed[0] : parsed;

          if (!firstDrive?.DeviceID) {
            resolve(null);
            return;
          }

          resolve({
            deviceName: firstDrive.VolumeName || 'MEDILAB DEVICE',
            driveLetter: `${firstDrive.DeviceID}\\`,
            status: 'connected',
          });
        } catch {
          resolve(null);
        }
      });
    });
  }
}
