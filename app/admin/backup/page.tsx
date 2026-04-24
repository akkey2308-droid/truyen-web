import Link from "next/link";
import { restoreBackup } from "./actions";

export default function BackupPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/admin" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Quay lại Admin
        </Link>

        <h1 className="mt-6 text-4xl font-bold">Backup / Restore</h1>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Backup dữ liệu</h2>
          <p className="mt-2 text-zinc-400">
            Tải toàn bộ truyện, chương, bình luận, tiến độ đọc và ảnh cover.
          </p>

          <a
            href="/api/backup"
            className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            Tải backup
          </a>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold text-red-400">Restore dữ liệu</h2>
          <p className="mt-2 text-zinc-400">
            Restore sẽ xóa dữ liệu hiện tại và thay bằng dữ liệu trong file backup.
          </p>

          <form action={restoreBackup} className="mt-5 space-y-4">
            <input
              type="file"
              name="backup"
              accept=".zip"
              required
              className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
            />

            <button
              type="submit"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-medium text-red-400 transition hover:bg-red-500/15"
            >
              Restore backup
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}