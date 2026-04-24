"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Chapter = {
  id: number;
  title: string;
  chapterNumber: number;
};

type Props = {
  chapters: Chapter[];
  currentChapterId: number;
  openUp?: boolean;
};

export default function ChapterSelect({
  chapters,
  currentChapterId,
  openUp = false,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const currentChapter = useMemo(
    () => chapters.find((chapter) => chapter.id === currentChapterId),
    [chapters, currentChapterId]
  );

  function goToChapter(chapterId: number) {
    setOpen(false);
    router.push(`/chapter/${chapterId}`);
  }

  return (
    <div className="relative w-full sm:w-[320px]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-left text-sm font-medium text-zinc-100 transition hover:bg-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
      >
        <span className="line-clamp-1">
          {currentChapter
            ? `Chương ${currentChapter.chapterNumber}: ${currentChapter.title}`
            : "Chọn chương"}
        </span>

        <span className="text-zinc-500">{open ? "↑" : "↓"}</span>
      </button>

      {open && (
        <div
          className={
            openUp
              ? "absolute bottom-full left-0 z-40 mb-2 w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl"
              : "absolute left-0 top-full z-40 mt-2 w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl"
          }
        >
          <div className="max-h-[360px] overflow-y-auto p-1 scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
            {chapters.map((chapter) => {
              const active = chapter.id === currentChapterId;

              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => goToChapter(chapter.id)}
                  className={
                    active
                      ? "block w-full rounded-lg bg-amber-500/15 px-3 py-2 text-left text-sm font-medium text-amber-400"
                      : "block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
                  }
                >
                  <span className="line-clamp-1">
                    Chương {chapter.chapterNumber}: {chapter.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}