"use client";

import { useRef, useState } from "react";

type Props = {
  defaultValue: string;
};

function parseContent(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function imageUrlFromMarker(text: string) {
  const match = text.match(/^\[\[IMAGE:(\/media\/.+?)\]\]$/);
  return match?.[1] || null;
}

export default function ChapterContentEditor({ defaultValue }: Props) {
  const [content, setContent] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/admin/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      alert("Upload ảnh thất bại.");
      return;
    }

    const data = await response.json();
    insertText(`\n\n[[IMAGE:${data.url}]]\n\n`);
  }

  function insertText(text: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      setContent((current) => `${current}\n\n${text}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const next =
      content.slice(0, start) + text + content.slice(end);

    setContent(next);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + text.length;
      textarea.selectionEnd = start + text.length;
    }, 0);
  }

  async function removeImage(marker: string) {
  const url = imageUrlFromMarker(marker);

  if (url) {
    await fetch("/admin/delete-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mediaPath: url,
      }),
    });
  }

  setContent((current) =>
    current
      .replace(marker, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

  async function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const imageItem = Array.from(event.clipboardData.items).find((item) =>
      item.type.startsWith("image/")
    );

    if (!imageItem) return;

    const file = imageItem.getAsFile();

    if (!file) return;

    event.preventDefault();
    await uploadImage(file);
  }

  const blocks = parseContent(content);

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];

          if (file) {
            await uploadImage(file);
            event.target.value = "";
          }
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition hover:bg-amber-500/15"
        >
          + Chèn ảnh
        </button>

        <p className="text-sm text-zinc-500">
          Có thể chọn ảnh hoặc Ctrl+V ảnh vào ô nội dung.
        </p>
      </div>

      {blocks.some((block) => imageUrlFromMarker(block)) && (
        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm font-medium text-zinc-300">
            Preview ảnh trong chương
          </p>

          {blocks.map((block, index) => {
            const url = imageUrlFromMarker(block);

            if (!url) return null;

            return (
              <div
                key={`${url}-${index}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-3"
              >
                <img
                  src={url}
                  alt="Ảnh trong chương"
                  className="mx-auto max-h-72 rounded-lg object-contain"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="break-all text-xs text-zinc-500">{url}</p>

                  <button
                    type="button"
                    onClick={() => removeImage(block)}
                    className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/15"
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <textarea
        ref={textareaRef}
        name="content"
        rows={18}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onPaste={handlePaste}
        className="min-h-[360px] w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 leading-7 text-zinc-100 outline-none transition focus:border-amber-500"
      />

      <p className="text-sm text-zinc-500">
        Mỗi đoạn cách nhau 1 dòng trống. Ảnh sẽ được lưu dưới dạng
        <span className="mx-1 text-amber-400">[[IMAGE:/media/...]]</span>.
      </p>
    </div>
  );
}