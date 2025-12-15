"use client";

import { Settings } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import SettingsPage from "./Settings/SettingsMenu";

export default function Navbar() {
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  return (
    <>
      {settingsMenuOpen && (
        <SettingsPage onClose={() => setSettingsMenuOpen(false)} />
      )}
      <nav className="w-full max-h-20 p-8 bg-neutral-900 text-white flex flex-row items-center">
        <div className="min-w-1/2 flex items-center font-bold text-2xl gap-4">
          <Image
            src="/tslogow.png"
            alt="TyreStats Logo"
            width={64}
            height={64}
          />
          <div className="h-12 w-0.5 bg-white" /> 
          <p className="underline">TyreStats</p>
        </div>
        <div className="min-w-1/2 flex flex-row-reverse items-center font-bold text-2xl">
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
