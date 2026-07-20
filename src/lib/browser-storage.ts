type BrowserStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export function safeReadBrowserStorage(
  getStorage: () => BrowserStorage,
  key: string,
) {
  try {
    return getStorage().getItem(key);
  } catch {
    return null;
  }
}

export function safeWriteBrowserStorage(
  getStorage: () => BrowserStorage,
  key: string,
  value: string,
) {
  try {
    getStorage().setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveBrowserStorage(
  getStorage: () => BrowserStorage,
  key: string,
) {
  try {
    getStorage().removeItem(key);
    return true;
  } catch {
    return false;
  }
}
