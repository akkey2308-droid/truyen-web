import AutoLinkText from "@/components/auto-link-text";
import { cookies } from "next/headers";
import ChapterSelect from "@/components/chapter-select";
import ParagraphCommentButton from "@/components/paragraph-comment-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ChapterPage({ params }: Props) {
  const { id } = await params;
  const chapterId = Number(id);

  if (!Number.isInteger(chapterId)) {
    notFound();
  }

  const chapter = await prisma.chapter.findUnique({
  where: { id: chapterId },
  include: {
    book: {
      include: {
        chapters: {
          orderBy: {
            chapterNumber: "asc",
          },
          select: {
            id: true,
            chapterNumber: true,
            title: true,
          },
        },
      },
    },
    paragraphs: {
      orderBy: {
        orderIndex: "asc",
      },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
    },
  },
});

  if (!chapter) {
    notFound();
  }
const cookieStore = await cookies();
const browserId = cookieStore.get("browserId")?.value || "";

if (browserId) {
  await prisma.readingProgress.upsert({
    where: {
      bookId_browserId: {
        bookId: chapter.bookId,
        browserId,
      },
    },
    update: {
      chapterId: chapter.id,
      updatedAt: new Date(),
      scrollPosition: 0,
    },
    create: {
      bookId: chapter.bookId,
      chapterId: chapter.id,
      scrollPosition: 0,
      browserId,
    },
  });
}
  const [prevChapter, nextChapter] = await Promise.all([
    prisma.chapter.findFirst({
      where: {
        bookId: chapter.bookId,
        chapterNumber: {
          lt: chapter.chapterNumber,
        },
      },
      orderBy: {
        chapterNumber: "desc",
      },
    }),
    prisma.chapter.findFirst({
      where: {
        bookId: chapter.bookId,
        chapterNumber: {
          gt: chapter.chapterNumber,
        },
      },
      orderBy: {
        chapterNumber: "asc",
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        <header className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                href={`/book/${chapter.book.slug}`}
                className="text-zinc-400 transition hover:text-zinc-200"
              >
                ← Quay lại truyện
              </Link>

              <span className="text-zinc-700">•</span>

              <Link
                href="/library"
                className="text-zinc-500 transition hover:text-zinc-300"
              >
                Thư viện
              </Link>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                {chapter.book.title}
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:text-4xl">
                Chương {chapter.chapterNumber}: {chapter.title}
              </h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
  <ChapterSelect
    currentChapterId={chapter.id}
    chapters={chapter.book.chapters}
  />

  {prevChapter ? (
    <Link
      href={`/chapter/${prevChapter.id}`}
      className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
    >
      ← Chương trước
    </Link>
  ) : (
    <span className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-500">
      ← Chương trước
    </span>
  )}

  {nextChapter ? (
    <Link
      href={`/chapter/${nextChapter.id}`}
      className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
    >
      Chương sau →
    </Link>
  ) : (
    <span className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-500">
      Chương sau →
    </span>
  )}
</div>
          </div>
        </header>

        <article className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:px-8 sm:py-8">
          {chapter.paragraphs.length > 0 ? (
            <div className="space-y-8 sm:space-y-10">
              {chapter.paragraphs.map((paragraph) => (
                <section
                  key={paragraph.id}
                  className="group rounded-xl transition"
                >
                  <p className="text-[17px] leading-9 text-zinc-200 sm:text-[18px]">
                    <AutoLinkText text={paragraph.content} />
                  </p>

                  <div className="mt-3 flex justify-end">
  <ParagraphCommentButton
    count={paragraph._count.comments}
    paragraphId={paragraph.id}
    chapterId={chapter.id}
  />
</div>
                </section>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500">Chương này chưa có nội dung.</p>
          )}
        </article>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
  <ChapterSelect
  currentChapterId={chapter.id}
  chapters={chapter.book.chapters}
  openUp
/>

  {prevChapter ? (
    <Link
      href={`/chapter/${prevChapter.id}`}
      className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
    >
      ← Chương trước
    </Link>
  ) : (
    <span className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-500">
      ← Chương trước
    </span>
  )}

  {nextChapter ? (
    <Link
      href={`/chapter/${nextChapter.id}`}
      className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
    >
      Chương sau →
    </Link>
  ) : (
    <span className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-500">
      Chương sau →
    </span>
  )}
</div>
      </div>
      <footer className="mt-20 border-t border-zinc-800 bg-zinc-950/80">
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    
    {/* Top */}
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      
      {/* Left */}
      <div className="max-w-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-400">
          Bãi Rác Vũ Trụ
        </p>

        <h3 className="mt-2 text-2xl font-semibold text-zinc-100">
          Kết nối & Ủng hộ
        </h3>

        <p className="mt-2 text-sm leading-7 text-zinc-400">
          Theo dõi các nền tảng của mình để cập nhật nội dung mới <br></br>và liên hệ hợp tác.
        </p>
      </div>

      {/* Right */}
      <div className="grid gap-3 sm:grid-cols-2 lg:w-[620px]">
        <a
          href="https://www.inkitt.com/calomama111"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 transition hover:border-amber-500/40 hover:bg-zinc-800"
        >
          Inkitt ↗
        </a>

        <a
          href="https://www.facebook.com/kitazmizuki"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 transition hover:border-amber-500/40 hover:bg-zinc-800"
        >
          Facebook ↗
        </a>

        <a
          href="https://www.youtube.com/channel/UCiwCL4XR-P-zwg0VwddgrHg"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 transition hover:border-amber-500/40 hover:bg-zinc-800"
        >
          YouTube ↗
        </a>

        <a
          href="mailto:akkey2310@gmail.com"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 transition hover:border-amber-500/40 hover:bg-zinc-800"
        >
          Email: akkey2310@gmail.com ✉
        </a>
      </div>
    </div>

    {/* Bottom */}
    <div className="mt-8 border-t border-zinc-800 pt-5 text-center text-sm text-zinc-500">
      © {new Date().getFullYear()} BRVT. All rights reserved.
    </div>
  </div>
</footer>
    </main>
  );
}