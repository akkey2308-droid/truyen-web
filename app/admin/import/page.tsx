import Link from "next/link";
import { importEpub } from "./actions";

export default function ImportEpubPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/admin"
          className="text-sm text-zinc-400 transition hover:text-zinc-200"
        >
          ← Quay lại Admin
        </Link>

        <div className="mt-6">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-400">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Import EPUB</h1>
          <p className="mt-3 text-zinc-400">
            Tải lên file EPUB để tự động tạo truyện và chương.
          </p>
        </div>

        <form
          action={importEpub}
          className="mt-8 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">
              File EPUB
            </label>

            <input
              type="file"
              name="epub"
              accept=".epub"
              required
              className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            Import truyện
          </button>
        </form>
      </div>
    </main>
  );
}