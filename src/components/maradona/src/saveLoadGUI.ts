import type GUI from "lil-gui";

export function saveSettings(key: string, params: any) {
    localStorage.setItem(key, JSON.stringify(params));
}

export function loadSettings(key: string, defaultParams: any, params: any) {
  const saved = localStorage.getItem(key);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(params, parsed); // copia i valori salvati
    } catch (e) {
      console.warn(`Errore nel parsing di ${key}:`, e);
      Object.assign(params, defaultParams);
    }
  } else {
    Object.assign(params, defaultParams);
  }
}

export function resetSettings(key: string, defaultParams: any, params: any, folder: GUI) {
    localStorage.setItem(key, JSON.stringify(defaultParams));

    for (const prop in defaultParams) {
      (params as any)[prop] = (defaultParams as any)[prop];
    }

    folder.controllers.forEach((controller) => {
        controller.updateDisplay();
    });
}