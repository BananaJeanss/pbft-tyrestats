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
      <nav className="flex max-h-20 w-full flex-row items-center bg-zinc-200 p-8 dark:bg-neutral-900">
        <div className="flex min-w-1/2 items-center gap-4 text-2xl font-bold">
          <Image src={logoSrc} alt="TyreStats Logo" width={64} height={64} />
          <div className="h-12 w-0.5 bg-neutral-400 dark:bg-white" />
          <p className="underline">TyreStats</p>
        </div>
        <div className="flex min-w-1/2 flex-row items-center justify-end gap-4 text-2xl font-bold">
          <button
            className="mr-4 cursor-pointer transition"
            onClick={() => setSettingsMenuOpen(true)}
          >
            <Settings />
          </button>
        </div>
      </nav>
    </>
  );
}
