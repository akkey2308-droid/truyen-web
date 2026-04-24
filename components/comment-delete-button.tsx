"use client";

import { useEffect, useState } from "react";

const BROWSER_KEY = "browser-id";

function getBrowserId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(BROWSER_KEY) || "";
}

type Props = {
  commentBrowserId: string | null;
  children: React.ReactNode;
};

export default function CommentDeleteButton({
  commentBrowserId,
  children,
}: Props) {
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const currentBrowserId = getBrowserId();
    setCanDelete(
      !!commentBrowserId &&
        !!currentBrowserId &&
        currentBrowserId === commentBrowserId
    );
  }, [commentBrowserId]);

  if (!canDelete) return null;

  return <>{children}</>;
}