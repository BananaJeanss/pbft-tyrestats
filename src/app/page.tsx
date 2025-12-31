"use client";

import { Database, Github } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const loginButtonStyles =
  "border p-2 m-2 rounded-4xl transition hover:bg-gray-300 dark:hover:bg-gray-900 flex flex-row gap-2";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && resolvedTheme === "light" ? "/tslogo.png" : "/tslogow.png";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Image
        src={logoSrc}
        alt="Tyrestats Logo which is very cool and awesome"
        width={256}
        height={256}
      />
      <h1 className="mb-2 text-4xl font-bold underline">TyreStats</h1>
      <p>PB Formula Truck raceday statistics dashboard & analyzer</p>
      <hr className="my-4 w-1/2 border-zinc-300" />
      <div className="flex w-full flex-row items-center justify-center">
        <button
          className={`cursor-not-allowed ${loginButtonStyles} relative`}
          disabled
          style={{ opacity: 0.5 }}
        >
          <Github />
          Login with GitHub (not implemented yet)
        </button>
        <div className="mx-2 h-12 w-px bg-zinc-300" />
        <Link href="/dashboard" passHref>
          <button className={`cursor-pointer ${loginButtonStyles}`}>
            <Database />
            LocalStorage (No Login)
          </button>
        </Link>
      </div>
    </div>
  );
}
