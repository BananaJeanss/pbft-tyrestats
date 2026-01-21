"use client";

import { Database, Settings } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SettingsPage from "./Settings/SettingsMenu";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Set mounted on client only to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const logoSrc = resolvedTheme === "light" ? "/tslogo.png" : "/tslogow.png";

  const isOnDashboard = pathname === "/dashboard" || pathname === "/dashboard/";

  const { data: session, isPending } = authClient.useSession();

  if (!mounted) return null;

  return (
    <>
      {settingsMenuOpen && (
        <SettingsPage onClose={() => setSettingsMenuOpen(false)} />
      )}
      <nav className="flex max-h-20 w-full flex-row items-center justify-between bg-zinc-200 p-8 dark:bg-neutral-900">
        <div className="flex items-center gap-4 text-2xl font-bold">
          <Image src={logoSrc} alt="TyreStats Logo" width={64} height={64} />
          <p className="underline">TyreStats</p>
          {!isOnDashboard && (
            <>
              <div className="h-12 w-0.5 bg-neutral-700 dark:bg-neutral-200" />
              <Link
                href="/dashboard"
                className="text-sm font-light opacity-70 transition hover:underline"
              >
                Return to Dashboard
              </Link>
            </>
          )}
        </div>
        <div className="flex flex-row items-center justify-end gap-4 text-2xl font-bold">
          {isPending ? (
            <div className="h-10 w-24 animate-pulse rounded bg-neutral-300 dark:bg-neutral-800" />
          ) : session ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={session?.user?.image || "/default-avatar.png"}
                alt={session?.user?.name || "User Avatar"}
                className="h-10 w-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <p className="text-sm font-light opacity-70">
                {session?.user?.name}
              </p>
            </>
          ) : (
            <>
              <Database />
              <p className="text-sm font-light opacity-70">LocalStorage</p>
            </>
          )}

          <div className="h-8 w-px bg-neutral-700 dark:bg-neutral-200" />

          <button
            className="cursor-pointer transition hover:opacity-80"
            onClick={() => setSettingsMenuOpen(true)}
          >
            <Settings />
          </button>
        </div>
      </nav>
    </>
  );
}
