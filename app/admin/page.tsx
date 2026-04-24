import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
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
    },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
              Admin
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Quản lý truyện
            </h1>

            <p className="mt-3 text-zinc-400">
              Thêm, sửa, xóa truyện và quản lý chương trong khu vực admin.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
  <Link
  href="/admin/backup"
  className="rounded-xl border border-zinc-700 px-5 py-3 font-medium text-zinc-100 transition hover:bg-zinc-800"
>
  Backup / Restore
</Link>
  <Link
    href="/admin/books/new"
    className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
  >
    Thêm truyện mới
  </Link>

  <Link
    href="/admin/import"
    className="rounded-xl border border-zinc-700 px-5 py-3 font-medium text-zinc-100 transition hover:bg-zinc-800"
  >
    Import EPUB
  </Link>

  <Link
    href="/library"
    className="rounded-xl border border-zinc-700 px-5 py-3 font-medium text-zinc-100 transition hover:bg-zinc-800"
  >
    Về thư viện
  </Link>
</div>
        </div>

        {books.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-xl font-semibold">Chưa có truyện nào</h2>
            <p className="mt-3 text-zinc-400">
              Hãy tạo truyện đầu tiên để bắt đầu quản lý thư viện.
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
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/admin/books/${book.id}`}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700 hover:bg-zinc-800"
              >
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
                  <h2 className="line-clamp-2 text-lg font-semibold">
                    {book.title}
                  </h2>

                  <p className="text-sm text-zinc-500">
                    {book.chapters.length} chương
                  </p>

                  <p className="line-clamp-2 text-sm text-zinc-400">
                    {book.description || "Chưa có mô tả."}
                  </p>

                  <div className="pt-1 text-sm text-amber-400">
                    Mở trang quản lý →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}