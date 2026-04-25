import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateBook } from "./actions";
import { deleteBook } from "./delete-action";

type Props = {
  params: Promise<{ bookId: string }>;
};

export default async function EditBookPage({ params }: Props) {
  const { bookId } = await params;
  const id = Number(bookId);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const book = await prisma.book.findUnique({
    where: { id },
  });

  if (!book) {
    notFound();
  }

  const action = updateBook.bind(null, id);
  const deleteAction = deleteBook.bind(null, id);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
  href={`/admin/books/${book.id}`}
  className="text-sm text-zinc-400 transition hover:text-zinc-200"
>
  ← Quay lại truyện
</Link>
        <div className="mt-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Sửa truyện</h1>
          <p className="mt-2 text-zinc-400">{book.title}</p>
        </div>

        <form
  action={action}
  className="mt-8 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6"
>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">
              Tên truyện
            </label>
            <input
              name="title"
              defaultValue={book.title}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Slug</label>
            <input
              name="slug"
              defaultValue={book.slug}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500"
              required
            />
          </div>

          <div className="space-y-3">
  <label className="text-sm font-medium text-zinc-200">
    Cover
  </label>

  {book.cover ? (
    <div className="w-32 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <img
        src={book.cover}
        alt={book.title}
        className="block h-44 w-full object-cover"
      />
    </div>
  ) : (
    <div className="flex h-44 w-32 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-zinc-500">
      No Cover
    </div>
  )}

  <input
    type="file"
    name="cover"
    accept="image/*"
    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
  />

  <label className="flex items-center gap-2 text-sm text-zinc-400">
    <input type="checkbox" name="removeCover" />
    Xóa cover hiện tại
  </label>
</div>

          <div className="space-y-2">
  <label
    htmlFor="status"
    className="text-sm font-medium text-zinc-200"
  >
    Trạng thái
  </label>
  <select
    id="status"
    name="status"
    defaultValue={book.status || "Đang cập nhật"}
    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500"
  >
    <option value="Đang cập nhật">Đang cập nhật</option>
    <option value="Hoàn thành">Hoàn thành</option>
  </select>
</div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Mô tả</label>
            <textarea
              name="description"
              rows={6}
              defaultValue={book.description || ""}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base leading-7 text-zinc-100 outline-none transition focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
            >
              Lưu thay đổi
            </button>

            <Link
  href={`/admin/books/${book.id}`}
  className="rounded-xl border border-zinc-700 px-5 py-3 text-center font-medium text-zinc-100 transition hover:bg-zinc-800"
>
  Hủy
</Link>
          </div>
        </form>

        <form action={deleteAction} className="mt-4">
          <button
            type="submit"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-medium text-red-400 transition hover:bg-red-500/15"
          >
            Xóa truyện
          </button>
        </form>
      </div>
    </main>
  );
}