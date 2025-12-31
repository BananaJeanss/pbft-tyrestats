"use client";

import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Image
        src="/tslogow.png"
        alt="Tyrestats Logo which is very cool and awesome"
        width={256}
        height={256}
        unoptimized // cause offline
      />
      <h1 className="mb-2 text-4xl font-bold underline">Offline</h1>
      <p>You are currently offline. Please check your internet connection.</p>
    </div>
  );
}
