export const USB_EVENTS = {
  CONNECTED: 'usb-connected',
  DISCONNECTED: 'usb-disconnected',
  STATUS: 'usb-status',
} as const;

export const USB_IPC_CHANNELS = {
  GET_STATUS: 'usb:get-status',
  IMPORT_TXT_FILES: 'usb:import-txt-files',
} as const;

export type UsbConnectionStatus = 'connected' | 'disconnected';

export interface USBDeviceInfo {
  deviceName: string;
  driveType: number;
  driveLetter: string;
  isRemovable: boolean;
  status: UsbConnectionStatus;
  volumeLabel: string;
}

export interface USBStatusPayload {
  connected: boolean;
  device: USBDeviceInfo | null;
}
