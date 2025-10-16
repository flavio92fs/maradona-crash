export function saveSettings(key: string, params: any) {
    localStorage.setItem(key, JSON.stringify(params));
}

export function loadSettings<T>(key: string, defaults: T): T {
    const saved = localStorage.getItem(key);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  }

export function resetSettings(key: string, defaultParams: any) {
    localStorage.setItem(key, JSON.stringify(defaultParams));
}