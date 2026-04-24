"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") || "");

  if (password !== process.env.ADMIN_PASSWORD) {
    throw new Error("Sai mật khẩu admin.");
  }

  const cookieStore = await cookies();

  cookieStore.set("admin-token", process.env.ADMIN_COOKIE_SECRET || "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}