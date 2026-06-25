export const USB_EVENTS = {
  CONNECTED: 'usb-connected',
  DISCONNECTED: 'usb-disconnected',
  STATUS: 'usb-status',
} as const;

export const USB_IPC_CHANNELS = {
  GET_STATUS: 'usb:get-status',
} as const;

export type UsbConnectionStatus = 'connected' | 'disconnected';

export interface USBDeviceInfo {
  deviceName: string;
  driveLetter: string;
  status: UsbConnectionStatus;
}

export interface USBStatusPayload {
  connected: boolean;
  device: USBDeviceInfo | null;
}
