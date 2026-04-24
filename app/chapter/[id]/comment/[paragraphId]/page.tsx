import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CommentDisplayNameInput from "@/components/comment-display-name-input";
import CommentDeleteButton from "@/components/comment-delete-button";
import { createParagraphComment, deleteComment } from "./actions";

type Props = {
  params: Promise<{
    id: string;
    paragraphId: string;
  }>;
};

export default async function CommentPage({ params }: Props) {
  const { id, paragraphId } = await params;

  const chapterId = Number(id);
  const pid = Number(paragraphId);

  if (!Number.isInteger(chapterId) || !Number.isInteger(pid)) {
    notFound();
  }

  const paragraph = await prisma.chapterParagraph.findUnique({
    where: { id: pid },
    include: {
      chapter: {
        include: {
          book: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!paragraph) {
    notFound();
  }

  const action = createParagraphComment.bind(null, chapterId, pid);

  return (
    <main className="bg-zinc-900 text-zinc-100">
      <div className="space-y-4">
        <form
          action={action}
          className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900"
        >
          <CommentDisplayNameInput />

          <div className="space-y-2">
            <label
              htmlFor="content"
              className="text-sm font-medium text-zinc-200"
            >
              Nội dung bình luận
            </label>

            <textarea
              id="content"
              name="content"
              rows={3}
              placeholder="Ghi chú / cảm nghĩ / phân tích..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Lưu bình luận
          </button>
        </form>

        <section className="mt-2">
          <h2 className="mb-3 text-xl font-semibold">
            Bình luận ({paragraph.comments.length})
          </h2>

          {paragraph.comments.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-400">
              Chưa có bình luận nào.
            </div>
          ) : (
            <div className="space-y-3">
              {paragraph.comments.map((comment) => {
                const deleteAction = deleteComment.bind(
                  null,
                  chapterId,
                  pid,
                  comment.id
                );

                return (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-amber-400">
                            {comment.displayName || "Khách"}
                          </p>

                          <span className="text-[11px] text-zinc-600">
                            {new Date(comment.createdAt).toLocaleString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      <CommentDeleteButton
                        commentBrowserId={comment.browserId || null}
                      >
                        <form action={deleteAction}>
                          <button
                            type="submit"
                            className="shrink-0 text-sm text-red-400 transition hover:text-red-300"
                          >
                            Xóa
                          </button>
                        </form>
                      </CommentDeleteButton>
                    </div>

                    <p className="whitespace-pre-wrap text-zinc-200">
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}