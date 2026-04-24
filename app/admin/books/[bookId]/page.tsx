import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteBook } from "./delete-action";
import { deleteChapter } from "@/app/admin/chapters/[chapterId]/delete-action";

type Props = {
  params: Promise<{
    bookId: string;
  }>;
};

export default async function AdminBookDetailPage({ params }: Props) {
  const { bookId } = await params;
  const id = Number(bookId);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: {
          chapterNumber: "asc",
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  const bookDeleteAction = deleteBook.bind(null, book.id);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-zinc-400 transition hover:text-zinc-200"
            >
              ← Quay lại admin
            </Link>

            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-amber-400">
              Book Admin
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              {book.title}
            </h1>

            <p className="mt-3 text-zinc-400">
              Quản lý truyện và toàn bộ chương của truyện này.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/books/${book.id}/edit`}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-medium text-zinc-100 transition hover:bg-zinc-800"
            >
              Sửa truyện
            </Link>

            <Link
              href={`/admin/books/${book.id}/chapters/new`}
              className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
            >
              Thêm chương
            </Link>

            <form action={bookDeleteAction}>
              <button
                type="submit"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-medium text-red-400 transition hover:bg-red-500/15"
              >
                Xóa truyện
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="self-start overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 lg:sticky lg:top-6">
            <div className="aspect-[3/4] bg-zinc-800">
              {book.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.cover}
                  alt={book.title}
                  className="block h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  No Cover
                </div>
              )}
            </div>

            <div className="space-y-3 p-4">
              <p className="text-sm text-zinc-500">Slug</p>
              <p className="break-all text-sm text-zinc-200">{book.slug}</p>

              {book.status ? (
                <>
                  <p className="pt-2 text-sm text-zinc-500">Trạng thái</p>
                  <p className="text-sm text-zinc-200">{book.status}</p>
                </>
              ) : null}

              {book.description ? (
                <>
                  <p className="pt-2 text-sm text-zinc-500">Mô tả</p>
                  <p className="text-sm leading-7 text-zinc-300">
                    {book.description}
                  </p>
                </>
              ) : null}

              <div className="pt-3">
                <Link
                  href={`/book/${book.slug}`}
                  className="inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
                >
                  Xem trang public
                </Link>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Danh sách chương</h2>

              
            </div>

            {book.chapters.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
                Truyện này chưa có chương nào.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {book.chapters.map((chapter) => {
                  const chapterDeleteAction = deleteChapter.bind(null, chapter.id);

                  return (
                    <div
                      key={chapter.id}
                      className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-zinc-500">
                          Chương {chapter.chapterNumber}
                        </p>

                        <h3 className="line-clamp-1 text-lg font-semibold">
                          {chapter.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        

                        <Link
                          href={`/admin/chapters/${chapter.id}/edit`}
                          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
                        >
                          Sửa
                        </Link>

                        <form action={chapterDeleteAction}>
                          <button
                            type="submit"
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/15"
                          >
                            Xóa
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}