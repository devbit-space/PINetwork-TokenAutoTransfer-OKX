declare global {
  interface Window {
    okxwallet?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isConnected: () => boolean;
      selectedAddress: string | null;
      chainId: string | null;
    };
  }
}

export {}; 