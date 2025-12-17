"use client";

import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black text-white">
      <Image
        src="/tslogow.png"
        alt="Tyrestats Logo which is very cool and awesome"
        width={256}
        height={256}
        unoptimized // cause offline
      />
      <h1 className="text-4xl font-bold underline mb-2">Offline</h1>
      <p>You are currently offline. Please check your internet connection.</p>
    </div>
  );
}
