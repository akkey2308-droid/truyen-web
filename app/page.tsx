import ThemeToggle from "@/components/theme-toggle";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import HomeSearch from "@/components/home-search";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const browserId = cookieStore.get("browserId")?.value || "";

  const [latestBooks, recentProgress] = await Promise.all([
    prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        chapters: {
          orderBy: { chapterNumber: "asc" },
        },
      },
    }),

    prisma.readingProgress.findMany({
      where: browserId ? { browserId } : { browserId: "__no_browser__" },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: {
        book: true,
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-5 flex justify-end">
          <ThemeToggle />
        </div>

        <section className="rounded-3xl border border-stone-300 bg-[#faf7f0] px-6 py-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.25em] text-amber-500 dark:text-amber-400">
                Dirty Tiger
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
                Bãi Rác Vũ Trụ
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-600 dark:text-zinc-400 sm:text-lg">
                循此苦旅，终抵繁星
              </p>

              <div className="mt-8 max-w-xl">
                <HomeSearch />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-300 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Bắt đầu đọc
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Vào thư viện ngay
                </h2>

                <p className="mt-2 text-sm leading-7 text-zinc-500 dark:text-zinc-500">
                  Mở thư viện để xem danh sách, tiếp tục đọc.
                </p>

                <div className="mt-5">
                  <Link
                    href="/library"
                    className="inline-flex w-full justify-center rounded-xl bg-zinc-950 px-5 py-3 font-medium text-white transition hover:bg-zinc-800 dark:bg-[#faf7f0] dark:text-black dark:hover:bg-zinc-200"
                  >
                    Vào thư viện
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Đọc gần đây</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {recentProgress.length === 0 ? (
              <div className="rounded-2xl border border-stone-300 bg-[#faf7f0] p-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                Chưa có lịch sử đọc gần đây.
              </div>
            ) : (
              recentProgress.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-stone-300 bg-[#faf7f0] p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex gap-3">
                    <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                      {item.book.cover ? (
                        <img
                          src={item.book.cover}
                          alt={item.book.title}
                          className="block h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                          No Cover
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-zinc-500">Đang đọc</p>

                      <h3 className="mt-1 line-clamp-2 text-lg font-semibold">
                        {item.book.title}
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/chapter/${item.chapterId}`}
                          className="rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white dark:bg-[#faf7f0] dark:text-black"
                        >
                          Đọc tiếp
                        </Link>

                        <Link
                          href={`/book/${item.book.slug}`}
                          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Truyện mới thêm</h2>

            <Link
              href="/library"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latestBooks.map((book) => (
              <Link
                key={book.id}
                href={`/book/${book.slug}`}
                className="overflow-hidden rounded-2xl border border-stone-300 bg-[#faf7f0] shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <div className="aspect-[3/4] w-full bg-zinc-200 dark:bg-zinc-800">
                  {book.cover ? (
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="block h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
                      No Cover
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold">{book.title}</h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    {book.chapters.length} chương
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-20 border-t border-stone-300 bg-[#faf7f0]/80 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-500 dark:text-amber-400">
                Bãi Rác Vũ Trụ
              </p>

              <h3 className="mt-2 text-2xl font-semibold">Kết nối & Ủng hộ</h3>

              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-zinc-400">
                Theo dõi các nền tảng của mình để cập nhật nội dung mới
                <br />
                và liên hệ hợp tác.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[620px]">
              {[
                ["Inkitt ↗", "https://www.inkitt.com/calomama111"],
                ["Facebook ↗", "https://www.facebook.com/kitazmizuki"],
                [
                  "YouTube ↗",
                  "https://www.youtube.com/channel/UCiwCL4XR-P-zwg0VwddgrHg",
                ],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-stone-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 transition hover:border-amber-500/40 hover:bg-[#f5f1e8] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {label}
                </a>
              ))}

              <a
                href="mailto:akkey2310@gmail.com"
                className="rounded-xl border border-stone-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 transition hover:border-amber-500/40 hover:bg-[#f5f1e8] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Email: akkey2310@gmail.com ✉
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}