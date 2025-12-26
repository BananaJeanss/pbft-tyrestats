"use client";

import { Settings } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import SettingsPage from "./Settings/SettingsMenu";

export default function Navbar() {
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set mounted on client only to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && resolvedTheme === "light" ? "/tslogo.png" : "/tslogow.png";

  return (
    <>
      {settingsMenuOpen && (
        <SettingsPage onClose={() => setSettingsMenuOpen(false)} />
      )}
      <nav className="w-full max-h-20 p-8 bg-zinc-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex flex-row items-center">
        <div className="min-w-1/2 flex items-center font-bold text-2xl gap-4">
          <Image src={logoSrc} alt="TyreStats Logo" width={64} height={64} />
          <div className="h-12 w-0.5 bg-neutral-400 dark:bg-white" />
          <p className="underline">TyreStats</p>
        </div>
        <div className="min-w-1/2 flex flex-row justify-end items-center font-bold text-2xl gap-4">
          <button
            className="mr-4 hover:text-neutral-400 transition cursor-pointer"
            onClick={() => setSettingsMenuOpen(true)}
          >
            <Settings />
          </button>
        </div>
      </nav>
    </>
  );
}
