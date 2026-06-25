export {};

type UsbConnectionStatus = 'connected' | 'disconnected';

interface USBDeviceInfo {
  deviceName: string;
  driveLetter: string;
  status: UsbConnectionStatus;
}

interface USBStatusPayload {
  connected: boolean;
  device: USBDeviceInfo | null;
}

declare global {
  interface Window {
    medilogix?: {
      app: {
        getPlatform: () => Promise<string>;
        getVersion: () => Promise<string>;
      };
      usb: {
        getStatus: () => Promise<USBStatusPayload>;
        onConnected: (callback: (device: USBDeviceInfo) => void) => () => void;
        onDisconnected: (callback: (device: USBDeviceInfo) => void) => () => void;
        onStatus: (callback: (status: USBStatusPayload) => void) => () => void;
      };
    };
  }
}
