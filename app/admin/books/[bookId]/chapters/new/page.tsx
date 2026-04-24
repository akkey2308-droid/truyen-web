import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createChapter } from "./actions";

type Props = {
  params: Promise<{ bookId: string }>;
};

export default async function NewChapterPage({ params }: Props) {
  const { bookId } = await params;
  const parsedBookId = Number(bookId);

  if (!Number.isInteger(parsedBookId)) {
    notFound();
  }

  const book = await prisma.book.findUnique({
    where: { id: parsedBookId },
    include: {
      chapters: {
        orderBy: {
          chapterNumber: "desc",
        },
        take: 1,
      },
    },
  });

  if (!book) {
    notFound();
  }

  const nextChapterNumber =
    book.chapters.length > 0 ? book.chapters[0].chapterNumber + 1 : 1;

  const createChapterWithBookId = createChapter.bind(null, book.id);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8">
          <Link
  href={`/admin/books/${book.id}`}
  className="text-sm text-zinc-400 transition hover:text-zinc-200"
>
  ← Quay lại truyện
</Link>

          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-zinc-500">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Thêm chương mới
          </h1>
          <p className="mt-3 text-zinc-400">
            Truyện: <span className="text-zinc-200">{book.title}</span>
          </p>
        </div>

        <form
          action={createChapterWithBookId}
          className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="chapterNumber"
                className="text-sm font-medium text-zinc-200"
              >
                Số chương
              </label>
              <input
  name="chapterNumber"
  type="text"
  inputMode="decimal"
  placeholder="Ví dụ: 1.5"
  defaultValue={String(nextChapterNumber)}
  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500"
/>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-zinc-200"
              >
                Tên chương
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Ví dụ: Cánh cửa mở ra"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="content"
              className="text-sm font-medium text-zinc-200"
            >
              Nội dung chương
            </label>
            <textarea
              id="content"
              name="content"
              rows={18}
              placeholder={`Dán nội dung chương vào đây...

Mỗi đoạn nên cách nhau một dòng trống để hệ thống tự tách paragraph.

Ví dụ đoạn 1...

[trống 1 dòng]

Ví dụ đoạn 2...`}
              className="min-h-[360px] w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base leading-7 text-zinc-100 outline-none transition focus:border-amber-500"
              required
            />
            <p className="text-sm leading-6 text-zinc-500">
              Hệ thống sẽ tự tách paragraph theo các dòng trống. Đây là nền cho
              tính năng comment theo từng đoạn ở phase sau.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
            >
              Lưu chương
            </button>

            <Link
              href={`/book/${book.slug}`}
              className="rounded-xl border border-zinc-700 px-5 py-3 text-center font-medium text-zinc-100 transition hover:bg-zinc-800"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}