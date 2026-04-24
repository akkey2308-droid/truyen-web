import { createBook } from "./actions";
import Link from "next/link";

export default function NewBookPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
  href="/admin"
  className="text-sm text-zinc-400 transition hover:text-zinc-200"
>
  ← Admin
</Link>
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold">Thêm truyện mới</h1>
          <p className="mt-3 text-zinc-400">
            Tạo một truyện mới cho thư viện cá nhân của bạn.
          </p>
        </div>

        <form
  action={createBook}
  className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-zinc-200">
              Tên truyện
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Ví dụ: Nhà giả kim"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium text-zinc-200">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="vi-du-nha-gia-kim"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500"
            />
            <p className="text-sm text-zinc-500">
              Có thể bỏ trống, hệ thống sẽ tự tạo từ tên truyện.
            </p>
          </div>

          <div className="space-y-2">
  <label className="text-sm text-zinc-400">
    Cover
  </label>

  <input
    type="file"
    name="cover"
    accept="image/*"
    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
  />
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
    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500"
    defaultValue="Đang cập nhật"
  >
    <option value="Đang cập nhật">Đang cập nhật</option>
    <option value="Hoàn thành">Hoàn thành</option>
  </select>
</div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-zinc-200"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              placeholder="Nhập mô tả ngắn về truyện..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
            >
              Lưu truyện
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}