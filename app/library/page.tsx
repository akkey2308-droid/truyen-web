import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function LibraryPage() {
  const cookieStore = await cookies();
  const browserId = cookieStore.get("browserId")?.value || "";

  const books = await prisma.book.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      chapters: {
        orderBy: {
          chapterNumber: "asc",
        },
      },
      progress: {
        where: browserId
          ? {
              browserId,
            }
          : {
              browserId: "__no_browser__",
            },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
    },
  });

  const totalBooks = books.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Link href="/" className="block w-fit">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 transition hover:text-zinc-300">
                Bãi Rác Vũ Trụ
              </p>
            </Link>

            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Thư viện truyện
            </h1>

            <p className="mt-4 text-zinc-400">
              Đọc tiếp và theo dõi kho truyện của Dờ.
            </p>
          </div>

          <div className="w-full max-w-[220px] rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:shrink-0">
            <p className="text-sm text-zinc-400">Tổng truyện</p>

            <p className="mt-2 text-4xl font-bold text-amber-400">
              {totalBooks}
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Kho truyện</h2>

          <Link
            href="/"
            className="text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            ← Trang chủ
          </Link>
        </div>

        {books.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-xl font-semibold">Chưa có truyện nào</h2>
            <p className="mt-3 text-zinc-400">
              Hãy thêm truyện đầu tiên để bắt đầu xây thư viện cá nhân.
            </p>

            <div className="mt-6">
              <Link
                href="/admin/books/new"
                className="inline-flex rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
              >
                Tạo truyện đầu tiên
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => {
              const continueReading = book.progress[0] ?? null;
              const latestChapter =
                book.chapters.length > 0
                  ? book.chapters[book.chapters.length - 1]
                  : null;

              return (
                <div
                  key={book.id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700 hover:bg-zinc-800"
                >
                  <Link href={`/book/${book.slug}`} className="block">
                    <div className="aspect-[3/4] bg-zinc-800">
                      {book.cover ? (
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
                  </Link>

                  <div className="space-y-3 p-4">
                    <div>
                      <Link href={`/book/${book.slug}`}>
                        <h2 className="line-clamp-2 text-lg font-semibold text-zinc-100 hover:text-zinc-300">
                          {book.title}
                        </h2>
                      </Link>

                      <p className="mt-2 text-sm text-zinc-500">
                        {book.chapters.length} chương
                      </p>
                    </div>

                    <p className="line-clamp-2 text-sm text-zinc-400">
                      {book.description || "Chưa có mô tả."}
                    </p>

                    {book.status && (
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                          book.status === "Hoàn thành"
                            ? "border-green-500/30 bg-green-500/10 text-green-400"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {book.status}
                      </span>
                    )}

                    <div className="flex flex-col gap-2 pt-1">
                      <Link
                        href={`/book/${book.slug}`}
                        className="rounded-lg border border-zinc-700 px-3 py-2 text-center text-sm transition hover:bg-zinc-700"
                      >
                        Xem truyện
                      </Link>

                      {continueReading ? (
                        <Link
                          href={`/chapter/${continueReading.chapterId}`}
                          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-sm font-medium text-amber-400 transition hover:bg-amber-500/15"
                        >
                          Đọc tiếp
                        </Link>
                      ) : latestChapter ? (
                        <Link
                          href={`/chapter/${latestChapter.id}`}
                          className="rounded-lg border border-zinc-700 px-3 py-2 text-center text-sm transition hover:bg-zinc-700"
                        >
                          Đọc mới nhất
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}