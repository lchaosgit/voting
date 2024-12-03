interface Window {
  ethereum?: {
    request: (request: { method: string }) => Promise<string[]>;
    isMetaMask?: boolean;
  }
}