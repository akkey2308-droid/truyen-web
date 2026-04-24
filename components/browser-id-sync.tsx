"use client";

import { useEffect } from "react";
import { getOrCreateBrowserId } from "./get-browser-id";

export default function BrowserIdSync() {
  useEffect(() => {
    const browserId = getOrCreateBrowserId();
    document.cookie = `browserId=${browserId}; path=/; max-age=31536000`;
  }, []);

  return null;
}