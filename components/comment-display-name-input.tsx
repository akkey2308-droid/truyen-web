"use client";

import { useEffect, useState } from "react";

const NAME_KEY = "comment-display-name";
const BROWSER_KEY = "browser-id";

function getOrCreateBrowserId() {
  if (typeof window === "undefined") return "";

  let browserId = localStorage.getItem(BROWSER_KEY);

  if (!browserId) {
    browserId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(BROWSER_KEY, browserId);
  }

  return browserId;
}

export default function CommentDisplayNameInput() {
  const [name, setName] = useState("");
  const [browserId, setBrowserId] = useState("");

  useEffect(() => {
    setName(localStorage.getItem(NAME_KEY) || "");
    setBrowserId(getOrCreateBrowserId());
  }, []);

  function handleChange(value: string) {
    setName(value);
    localStorage.setItem(NAME_KEY, value);
  }

  return (
    <>
      <div className="space-y-2">
        <label
          htmlFor="displayName"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Tên hiển thị
        </label>

        <input
          id="displayName"
          name="displayName"
          type="text"
          value={name}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Nhập tên của bạn..."
          className="w-full rounded-xl border border-stone-300 bg-[#faf7f0] px-4 py-3 text-zinc-950 outline-none transition focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          required
        />
      </div>

      <input type="hidden" name="browserId" value={browserId} />
    </>
  );
}