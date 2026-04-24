const BROWSER_KEY = "browser-id";

export function getOrCreateBrowserId() {
  if (typeof window === "undefined") return "";

  let browserId = window.localStorage.getItem(BROWSER_KEY);

  if (!browserId) {
    browserId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(BROWSER_KEY, browserId);
  }

  return browserId;
}