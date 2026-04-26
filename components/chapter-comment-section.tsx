import CommentDisplayNameInput from "@/components/comment-display-name-input";
import CommentDeleteButton from "@/components/comment-delete-button";
import {
  createChapterComment,
  deleteChapterComment,
} from "@/app/chapter/[id]/chapter-comment-actions";

type ChapterComment = {
  id: number;
  content: string;
  displayName: string | null;
  browserId: string | null;
  createdAt: Date;
};

type Props = {
  chapterId: number;
  comments: ChapterComment[];
};

export default function ChapterCommentSection({ chapterId, comments }: Props) {
  const createAction = createChapterComment.bind(null, chapterId);

  return (
    <section className="mx-auto mt-10 max-w-3xl rounded-2xl border border-stone-300 bg-[#faf7f0] p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-stone-300 pb-4 dark:border-zinc-800">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-500 dark:text-amber-400">
            Bình luận chương
          </p>
          <h2 className="mt-1 text-2xl font-bold">
            Ghi chú / cảm nhận chương
          </h2>
        </div>

        <span className="rounded-full border border-stone-300 px-3 py-1 text-sm text-stone-600 dark:border-zinc-700 dark:text-zinc-400">
          {comments.length} bình luận
        </span>
      </div>

      <form
        action={createAction}
        className="rounded-2xl border border-stone-300 bg-[#f5f1e8] p-4 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="space-y-4">
          <CommentDisplayNameInput />

          <div className="space-y-2">
            <label
              htmlFor="chapter-comment-content"
              className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Nội dung bình luận
            </label>

            <textarea
              id="chapter-comment-content"
              name="content"
              rows={4}
              placeholder="Cảm nhận, ghi chú hoặc góp ý cho chương này..."
              className="w-full rounded-xl border border-stone-300 bg-[#faf7f0] px-4 py-3 leading-7 text-zinc-950 outline-none transition focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              required
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Gửi bình luận
          </button>
        </div>
      </form>

      <div className="mt-6">
        {comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500 dark:border-zinc-800 dark:text-zinc-500">
            Chưa có bình luận nào cho chương này.
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => {
              const deleteAction = deleteChapterComment.bind(
                null,
                chapterId,
                comment.id
              );

              return (
                <article
                  key={comment.id}
                  className="rounded-2xl border border-stone-300 bg-[#f5f1e8] p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-amber-600 dark:text-amber-400">
                        {comment.displayName || "Khách"}
                      </p>

                      <p className="mt-1 text-xs text-stone-500 dark:text-zinc-500">
                        {new Date(comment.createdAt).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <CommentDeleteButton
                      commentBrowserId={comment.browserId || null}
                    >
                      <form action={deleteAction}>
                        <button
                          type="submit"
                          className="text-sm text-red-500 transition hover:text-red-400"
                        >
                          Xóa
                        </button>
                      </form>
                    </CommentDeleteButton>
                  </div>

                  <p className="whitespace-pre-wrap leading-7 text-zinc-900 dark:text-zinc-200">
                    {comment.content}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}