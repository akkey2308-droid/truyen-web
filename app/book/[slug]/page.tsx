import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const browserId = cookieStore.get("browserId")?.value || "";

  const book = await prisma.book.findUnique({
    where: { slug },
    include: {
      chapters: {
        orderBy: {
          chapterNumber: "asc",
        },
      },
      progress: {
        where: browserId ? { browserId } : { browserId: "__no_browser__" },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!book) {
    notFound();
  }

  await prisma.book.update({
    where: { id: book.id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  const [chapterCommentCount, paragraphCommentCount] = await Promise.all([
    prisma.chapterComment.count({
      where: {
        chapter: {
          bookId: book.id,
        },
      },
    }),

    prisma.paragraphComment.count({
      where: {
        paragraph: {
          chapter: {
            bookId: book.id,
          },
        },
      },
    }),
  ]);

  const totalCommentCount = chapterCommentCount + paragraphCommentCount;

  const firstChapter = book.chapters[0] ?? null;
  const latestChapter = book.chapters[book.chapters.length - 1] ?? null;
  const continueReading = book.progress[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/library"
            className="text-sm text-stone-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← Sọt khoai tây
          </Link>

          <span className="text-stone-400 dark:text-zinc-700">•</span>
        </div>

        <section className="grid items-start gap-8 lg:grid-cols-[260px_1fr]">
          <div className="overflow-hidden rounded-2xl border border-stone-300 bg-[#faf7f0] shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="aspect-[3/4] bg-stone-200 dark:bg-zinc-800">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-stone-500 dark:text-zinc-500">
                  No Cover
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-amber-500 dark:text-amber-400">
                Dờ Thiếu Hiệp
              </p>

              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                {book.title}
              </h1>

              <div className="mt-4 flex items-center justify-between gap-4">
                {book.status ? (
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${
                      book.status === "Hoàn thành"
                        ? "border-green-500/30 bg-green-500/10 text-green-500 dark:text-green-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {book.status}
                  </span>
                ) : (
                  <span />
                )}

                <div className="flex flex-wrap justify-end gap-2">
                  <span className="rounded-full border border-stone-300 bg-[#faf7f0] px-3 py-1 text-sm text-stone-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                    👁 {book.viewCount ?? 0} lượt xem
                  </span>

                  <span className="rounded-full border border-stone-300 bg-[#faf7f0] px-3 py-1 text-sm text-stone-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                    💬 {totalCommentCount} bình luận
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-300 bg-[#faf7f0] p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold">Mô tả</h2>

              <p className="mt-3 whitespace-pre-wrap leading-7 text-stone-600 dark:text-zinc-400">
                {book.description || "Chưa có mô tả cho truyện này."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {firstChapter ? (
                <Link
                  href={`/chapter/${firstChapter.id}`}
                  className="rounded-xl border border-stone-300 px-5 py-3 text-center font-medium transition hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Đọc từ đầu
                </Link>
              ) : (
                <span className="rounded-xl border border-stone-300 px-5 py-3 text-center text-stone-500 dark:border-zinc-800 dark:text-zinc-500">
                  Chưa có chương
                </span>
              )}

              {latestChapter ? (
                <Link
                  href={`/chapter/${latestChapter.id}`}
                  className="rounded-xl border border-stone-300 px-5 py-3 text-center font-medium transition hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Đọc mới nhất
                </Link>
              ) : null}

              {continueReading ? (
                <Link
                  href={`/chapter/${continueReading.chapterId}`}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-center font-medium text-amber-600 transition hover:bg-amber-500/15 dark:text-amber-400 sm:col-span-2"
                >
                  Đọc tiếp
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Danh sách chương</h2>

            <p className="text-sm text-stone-500 dark:text-zinc-500">
              {book.chapters.length} chương
            </p>
          </div>

          {book.chapters.length === 0 ? (
            <div className="rounded-2xl border border-stone-300 bg-[#faf7f0] p-6 text-stone-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              Truyện này chưa có chương nào.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-stone-300 bg-[#faf7f0] shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              {book.chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex items-center justify-between gap-4 border-b border-stone-300 px-4 py-4 last:border-b-0 dark:border-zinc-800 sm:px-5"
                >
                  <Link
                    href={`/chapter/${chapter.id}`}
                    className="min-w-0 flex-1"
                  >
                    <p className="text-sm text-stone-500 dark:text-zinc-500">
                      Chương {chapter.chapterNumber}
                    </p>

                    <h3 className="mt-1 truncate font-medium transition hover:text-amber-700 dark:text-zinc-100 dark:hover:text-zinc-300">
                      {chapter.title}
                    </h3>
                  </Link>

                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/chapter/${chapter.id}`}
                      className="rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:bg-stone-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      Đọc
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="mt-20 border-t border-stone-300 bg-[#faf7f0]/80 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-500 dark:text-amber-400">
                Dờ Thiếu Hiệp
              </p>

              <h3 className="mt-2 text-2xl font-semibold">Kết nối & Ủng hộ</h3>

              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-zinc-400">
                Liên hệ với mình nếu con web khoai tây lỏ này có vấn đề
                <br />
                và liên hệ hợp tác.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[620px]">
              {[
                ["Wattpad ↗", "https://www.wattpad.com/user/Calomama111"],
                ["Wordpress ↗", "https://bairacvutru.wordpress.com/"],
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
                  className="rounded-xl border border-stone-300 bg-[#faf7f0] px-4 py-3 text-sm text-zinc-900 transition hover:border-amber-500/40 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {label}
                </a>
              ))}

              <a
                href="mailto:akkey2310@gmail.com"
                className="rounded-xl border border-stone-300 bg-[#faf7f0] px-4 py-3 text-sm text-zinc-900 transition hover:border-amber-500/40 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
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