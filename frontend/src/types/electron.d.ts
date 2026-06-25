export {};

declare global {
  interface Window {
    medilogix?: {
      app: {
        getPlatform: () => Promise<string>;
        getVersion: () => Promise<string>;
      };
    };
  }
}
