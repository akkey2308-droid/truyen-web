import { adminLogin } from "./actions";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <form
          action={adminLogin}
          className="w-full space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
              Scholar Night
            </p>

            <h1 className="mt-3 text-3xl font-bold">Admin Login</h1>

            <p className="mt-2 text-sm text-zinc-400">
              Nhập mật khẩu để vào khu quản trị.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Mật khẩu</label>

            <input
              name="password"
              type="password"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            Vào admin
          </button>
        </form>
      </div>
    </main>
  );
}