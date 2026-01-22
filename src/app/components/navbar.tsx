"use client";

import { Database, Settings } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SettingsPage from "./Settings/SettingsMenu";
import { authClient } from "@/lib/auth-client";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function Navbar() {
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [DoesThisPersonNotHateClocks] = useLocalStorage<boolean>(
    "tyrestats_navbar_clock",
    false,
  );
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [UTCTime, setUTCTime] = useState("");
  const offsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = -offsetMinutes / 60;
  const TimezoneLabel =
    offsetHours === 0
      ? `You are in UTC!`
      : `You are ${Math.abs(offsetHours)} hour${Math.abs(offsetHours) !== 1 ? "s" : ""} ${offsetHours > 0 ? "ahead" : "behind"} of UTC!`;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcHours = now.getUTCHours().toString().padStart(2, "0");
      const utcMinutes = now.getUTCMinutes().toString().padStart(2, "0");
      const utcSeconds = now.getUTCSeconds().toString().padStart(2, "0");
      setUTCTime(`${utcHours}:${utcMinutes}:${utcSeconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

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

          {DoesThisPersonNotHateClocks && (
            <>
              <p
                className="cursor-help font-mono text-sm font-extralight opacity-70"
                title={TimezoneLabel}
              >
                {UTCTime}
              </p>
              <div className="h-8 w-px bg-neutral-700 dark:bg-neutral-200" />
            </>
          )}

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
