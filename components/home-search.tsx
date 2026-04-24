"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Book = {
  id: number;
  title: string;
  slug: string;
  cover: string | null;
};

export default function HomeSearch() {
  const [q, setQ] = useState("");
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!q.trim()) {
        setBooks([]);
        return;
      }

      const res = await fetch(
        `/api/search-books?q=${encodeURIComponent(q)}`
      );

      const data = await res.json();
      setBooks(data);
    }, 250);

    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="mt-8 max-w-2xl">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm truyện..."
        className="w-full rounded-2xl border border-stone-300 bg-zinc-50 px-5 py-4 text-zinc-950 placeholder:text-stone-500 outline-none transition focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />

      {books.length > 0 && (
  <div className="mt-3 overflow-hidden rounded-2xl border border-stone-300 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    {books.map((book) => (
      <Link
        key={book.id}
        href={`/book/${book.slug}`}
        className="flex items-center gap-3 border-b border-stone-300 px-4 py-3 text-zinc-950 transition last:border-0 hover:bg-stone-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-200 dark:bg-zinc-800">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="block h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[9px] text-stone-500 dark:text-zinc-500">
              No Cover
            </div>
          )}
        </div>

        <span className="line-clamp-1 font-medium">{book.title}</span>
      </Link>
    ))}
  </div>
)}
    </div>
  );
}