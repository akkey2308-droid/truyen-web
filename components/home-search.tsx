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
        className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-zinc-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
      />

      {books.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/book/${book.slug}`}
              className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3 transition hover:bg-zinc-800 last:border-0"
            >
              <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="block h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <span className="line-clamp-1">
                {book.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}