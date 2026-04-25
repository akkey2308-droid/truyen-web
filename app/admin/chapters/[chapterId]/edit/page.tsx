import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateChapter } from "./actions";
import { deleteChapter } from "./delete-action";
import ChapterContentEditor from "@/components/chapter-content-editor";


type Props = {
  params: Promise<{ chapterId: string }>;
};

export default async function EditChapterPage({ params }: Props) {
  const { chapterId } = await params;
  const id = Number(chapterId);

  if (!Number.isInteger(id)) notFound();

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      book: true,
      paragraphs: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!chapter) notFound();

  const action = updateChapter.bind(null, id);
  const deleteAction = deleteChapter.bind(null, id);

  const content = chapter.paragraphs.map((p) => p.content).join("\n\n");

  const imageLines = chapter.paragraphs
    .map((p) => p.content)
    .filter((text) => text.startsWith("[[IMAGE:"));

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          href={`/admin/books/${chapter.bookId}`}
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← Quay lại truyện
        </Link>

        <div className="mt-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold">Sửa chương</h1>
          <p className="mt-2 text-zinc-400">{chapter.book.title}</p>
        </div>

        <form
          action={action}
          className="mt-8 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm">Số chương</label>
              <input
                name="chapterNumber"
                defaultValue={String(chapter.chapterNumber)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">Tên chương</label>
              <input
                name="title"
                defaultValue={chapter.title}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm">Nội dung</label>

            <ChapterContentEditor defaultValue={content} />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-3 text-black"
            >
              Lưu thay đổi
            </button>

            <Link
              href={`/admin/books/${chapter.bookId}`}
              className="rounded-xl border border-zinc-700 px-5 py-3"
            >
              Hủy
            </Link>
          </div>
        </form>

        <form action={deleteAction} className="mt-4">
          <button
            type="submit"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-red-400"
          >
            Xóa chương
          </button>
        </form>
      </div>
    </main>
  );
}