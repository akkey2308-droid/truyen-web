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
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-stone-300 bg-[#faf7f0] px-4 py-2.5 text-left text-sm font-medium text-zinc-950 transition hover:bg-stone-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
      >
        <span className="line-clamp-1">
          {currentChapter
            ? `Chương ${currentChapter.chapterNumber}: ${currentChapter.title}`
            : "Chọn chương"}
        </span>

        <span className="text-stone-500 dark:text-zinc-500">
          {open ? "↑" : "↓"}
        </span>
      </button>

      {open && (
        <div
          className={
            openUp
              ? "absolute bottom-full left-0 z-40 mb-2 w-full overflow-hidden rounded-xl border border-stone-300 bg-[#faf7f0] shadow-2xl dark:border-zinc-700 dark:bg-zinc-950"
              : "absolute left-0 top-full z-40 mt-2 w-full overflow-hidden rounded-xl border border-stone-300 bg-[#faf7f0] shadow-2xl dark:border-zinc-700 dark:bg-zinc-950"
          }
        >
          <div className="max-h-[360px] overflow-y-auto p-1">
            {chapters.map((chapter) => {
              const active = chapter.id === currentChapterId;

              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => goToChapter(chapter.id)}
                  className={
                    active
                      ? "block w-full rounded-lg bg-amber-500/15 px-3 py-2 text-left text-sm font-medium text-amber-600 dark:text-amber-400"
                      : "block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-800 transition hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
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