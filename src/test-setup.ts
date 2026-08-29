// Make window === globalThis so module side-effects (window.rn = ...) work in Node
if (typeof window === "undefined") {
  (globalThis as Record<string, unknown>).window = globalThis;
}

// Stub DOM Node so utils/index.ts can patch its prototype without crashing
if (typeof Node === "undefined") {
  (globalThis as Record<string, unknown>).Node = {
    prototype: {
      addEventListener: () => {},
      removeEventListener: () => {}
    }
  };
}

// Stub document so utils/index.ts DOMContentLoaded guard doesn't crash
if (typeof document === "undefined") {
  (globalThis as Record<string, unknown>).document = {
    readyState: "complete",
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null
  };
}

// Node 26 no longer exposes localStorage for the node test environment. Keep
// browser-facing migration and generator tests deterministic without changing
// production storage behavior.
let hasLocalStorage = false;
try {
  hasLocalStorage = typeof localStorage !== "undefined" && typeof localStorage.getItem === "function";
} catch {
  hasLocalStorage = false;
}

if (!hasLocalStorage) {
  const values = new Map<string, string>();
  const storage = {
    get length(): number {
      return values.size;
    },
    clear(): void {
      values.clear();
    },
    getItem(key: string): string | null {
      return values.get(String(key)) ?? null;
    },
    key(index: number): string | null {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key: string): void {
      values.delete(String(key));
      delete (storage as Record<string, unknown>)[String(key)];
    },
    setItem(key: string, value: string): void {
      const normalizedKey = String(key);
      values.set(normalizedKey, String(value));
      (storage as Record<string, unknown>)[normalizedKey] = String(value);
    }
  };
  Object.defineProperty(globalThis, "localStorage", { configurable: true, writable: true, value: storage });
}

// Stub the tooltip globals (registered by services/tooltips) so the registry's
// lazy-load loading tip doesn't throw outside the browser
if (typeof window.tip === "undefined") {
  window.tip = () => {};
}
if (typeof window.clearMainTip === "undefined") {
  window.clearMainTip = () => {};
}

// Logging flags declared in public/main.js and referenced bare by bundled modules
for (const flag of ["INFO", "TIME", "ERROR", "WARN", "DEBUG"]) {
  if (typeof (globalThis as Record<string, unknown>)[flag] === "undefined") {
    (globalThis as Record<string, unknown>)[flag] = false;
  }
}
