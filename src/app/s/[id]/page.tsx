// src/app/s/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { expandLocalUrl } from "@/lib/url-shortener";

export default function ShortUrlRedirect({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the long URL from the short ID
    const longUrl = expandLocalUrl(params.id);

    if (longUrl) {
      // If it's an internal URL, use router.push
      if (longUrl.startsWith(window.location.origin)) {
        router.push(longUrl.replace(window.location.origin, ""));
      } else {
        // Otherwise redirect to the external URL
        window.location.href = longUrl;
      }
    } else {
      setError("Link tidak valid atau sudah kedaluwarsa.");
    }
  }, [params.id, router]);

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.push("/")}
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-xl font-bold mb-4">Mengalihkan...</h1>
      <p>Mohon tunggu sebentar, Anda sedang dialihkan ke tujuan.</p>
    </div>
  );
}
