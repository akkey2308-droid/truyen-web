"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CommentModal from "./comment-modal";

type Props = {
  count: number;
  paragraphId: number;
  chapterId: number;
};

export default function ParagraphCommentButton({
  count,
  paragraphId,
  chapterId,
}: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          count > 0
            ? "rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400"
            : "rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-400"
        }
      >
        💬 {count}
      </button>

      <CommentModal
        open={open}
        onClose={() => {
          setOpen(false);
          router.refresh();
        }}
      >
        <iframe
          src={`/chapter/${chapterId}/comment/${paragraphId}`}
          className="h-[70vh] w-full rounded-xl border border-zinc-800 bg-zinc-900"
        />
      </CommentModal>
    </>
  );
}