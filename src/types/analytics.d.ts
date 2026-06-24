export {};

declare global {
  interface Window {
    _fbq?: FbqFunction;
    dataLayer: unknown[][];
    fbq?: FbqFunction;
    gtag?: (...args: unknown[]) => void;
  }
}

type FbqFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push: (...args: unknown[]) => number;
  queue: unknown[][];
  version?: string;
};
