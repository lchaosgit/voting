declare module '*.json' {
  const value: any;
  export default value;
}

interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, handler: (...args: any[]) => void): void;
  removeListener(event: string, handler: (...args: any[]) => void): void;
}

interface Window {
  ethereum?: EthereumProvider;
}