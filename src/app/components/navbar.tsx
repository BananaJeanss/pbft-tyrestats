"use client";

import {
  Calculator,
  ChevronRight,
  Database,
  Gamepad,
  LucideFileText,
  LucideIcon,
  LucidePaperclip,
  Settings,
  ToolCase,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import SettingsPage from "./Settings/SettingsMenu";
import { authClient } from "@/lib/auth-client";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PlaceIconsMap } from "../types/PlaceIconsMap";
import TyreWearManager from "../(main)/dashboard/components/TyreWearManager";

const RacePlaces = [
  { key: "harju", id: 92094305951214 },
  { key: "kubica", id: 117979390006737 },
  { key: "petgear", id: 15633295036 },
  { key: "panther", id: 18688750517 },
  { key: "The 411 Ring", id: 16883765114 },
  { key: "Autodromo La Fusilli", id: 113936050853805 },
  { key: "Saharan Port Town Street Circuit", id: 17102423081 },
];

function ToolMenuEntry({
  label,
  onClick,
  icon: Icon,
  imageSrc,
}: {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  imageSrc?: string;
}) {
  return (
    <button
      className="flex w-full cursor-pointer flex-row items-center px-4 py-2 text-left text-sm transition hover:bg-neutral-300 dark:hover:bg-neutral-600"
      onClick={onClick}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={label}
          width={16}
          height={16}
          className="mr-2 inline-block h-4 w-4 object-contain"
        />
      ) : (
        Icon && <Icon className="mr-2 inline-block h-4 w-4" />
      )}
      <span className="flex-1">{label}</span>
    </button>
  );
}

function ToolMenuSubMenu({
  label,
  children,
  icon: Icon,
  isOpen,
  onToggle,
}: {
  label: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        className="flex w-full cursor-pointer flex-row items-center gap-2 px-4 py-2 text-sm transition hover:bg-neutral-300 dark:hover:bg-neutral-600"
        onClick={onToggle}
      >
        <ChevronRight
          className={`h-4 w-4 transition ${isOpen ? "rotate-90" : ""}`}
        />
        <div className="flex items-center">
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {label}
        </div>
      </button>
      {isOpen && (
        <div className="absolute top-0 right-full mr-1 min-w-40 rounded-md border border-neutral-300 bg-neutral-200 py-2 shadow-lg dark:border-neutral-600 dark:bg-neutral-700">
          {children}
        </div>
      )}
    </div>
  );
}

type NavClockProps = {
  TimezoneLabel: string;
  UTCTime: string;
};

function NavClock({ TimezoneLabel, UTCTime }: NavClockProps) {
  return (
    <>
      <p
        className="cursor-help font-mono text-sm font-extralight opacity-70"
        title={TimezoneLabel}
      >
        {UTCTime}
      </p>
      <div className="h-8 w-px bg-neutral-700 dark:bg-neutral-200" />
    </>
  );
}

export default function Navbar() {
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [DoesThisPersonNotHateClocks] = useLocalStorage<boolean>(
    "tyrestats_navbar_clock",
    false,
  );
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [UTCTime, setUTCTime] = useState("");
  const offsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = -offsetMinutes / 60;
  const TimezoneLabel =
    offsetHours === 0
      ? `You are in UTC!`
      : `You are ${Math.abs(offsetHours)} hour${Math.abs(offsetHours) !== 1 ? "s" : ""} ${offsetHours > 0 ? "ahead" : "behind"} of UTC!`;
  const [tyreWearManOpen, setTyreWearManOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcHours = now.getUTCHours().toString().padStart(2, "0");
      const utcMinutes = now.getUTCMinutes().toString().padStart(2, "0");
      const utcSeconds = now.getUTCSeconds().toString().padStart(2, "0");
      setUTCTime(`${utcHours}:${utcMinutes}:${utcSeconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    function handleClickOutside(event: MouseEvent) {
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target as Node)
      ) {
        setToolsMenuOpen(false);
        setOpenSubmenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [konamiDebounce, setKonamiDebounce] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // applies spin animation to every child of navbar
  function makeitspin() {
    const navbar = document.querySelector("nav");
    if (navbar) {
      const children = navbar.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        child.classList.add("animate-spin");
      }
    }
  }

  function makeitunspin() {
    const navbar = document.querySelector("nav");
    if (navbar) {
      const children = navbar.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        child.classList.remove("animate-spin");
      }
    }
  }

  const lelelelelelemans = useCallback(() => {
    if (konamiDebounce) return;

    setKonamiDebounce(true);
    makeitspin();

    if (!audioRef.current) {
      audioRef.current = new Audio("/lelelelemans.webm");
      audioRef.current.onended = () => {
        makeitunspin();
        setKonamiDebounce(false);
      };
    }
    audioRef.current.currentTime = 0;
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        makeitunspin();
        setKonamiDebounce(false);
      });
    }
  }, [konamiDebounce]);

  // im running out of ideas so konami code
  useEffect(() => {
    let konamiCodePosition = 0;
    const konamiCode = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === konamiCode[konamiCodePosition]) {
        konamiCodePosition += 1;
        if (konamiCodePosition === konamiCode.length) {
          // Activate the easter egg
          lelelelelelemans();
          konamiCodePosition = 0;
        }
      } else {
        konamiCodePosition = 0;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lelelelelelemans]);

  const logoSrc = resolvedTheme === "light" ? "/tslogo.png" : "/tslogow.png";

  const isOnDashboard = pathname === "/dashboard" || pathname === "/dashboard/";

  const { data: session, isPending } = authClient.useSession();

  const DocsList = [
    {
      name: "FIT PBFT Regulations",
      url: "https://docs.google.com/document/d/1uLh0xcgRuEMCAaXMSiSEx5yXOf8zrkud1ncNx4gYYXc",
    },
    {
      name: "FIT Track Grading Regulations",
      url: "https://docs.google.com/document/d/1viSOh8YdQFCm8VYWoHPz7sWKdy_rnpja-XOTB307lMg",
    },
    {
      name: "FT1 Season 9 Standings",
      url: "https://docs.google.com/spreadsheets/d/1-znNNvsa85ulLN4H9YYQ2X72EdygEnNWM66elyHt45k",
    },
  ];

  if (!mounted) return null;

  return (
    <>
      {settingsMenuOpen && (
        <SettingsPage onClose={() => setSettingsMenuOpen(false)} />
      )}
      {tyreWearManOpen && (
        <TyreWearManager
          calculatorMode={true}
          doesAlreadyHaveData={false}
          onClose={() => setTyreWearManOpen(false)}
        />
      )}
      <nav className="flex max-h-20 w-full flex-row items-center justify-between bg-zinc-200 p-8 dark:bg-neutral-900">
        <div className="flex items-center gap-4 text-2xl font-bold">
          <Image
            src={logoSrc}
            alt="TyreStats Logo"
            width={64}
            height={64}
            className={`${konamiDebounce ? "animate-spin" : ""}`}
          />
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
            <NavClock TimezoneLabel={TimezoneLabel} UTCTime={UTCTime} />
          )}

          <div className="relative" ref={toolsMenuRef}>
            <button
              className="cursor-pointer transition hover:opacity-80"
              onClick={() => {
                setToolsMenuOpen((prev) => {
                  if (prev) {
                    setOpenSubmenu(null);
                  }
                  return !prev;
                });
              }}
              aria-haspopup="true"
              aria-expanded={toolsMenuOpen ? "true" : "false"}
            >
              <ToolCase />
            </button>
            {toolsMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 min-w-48 rounded-md border border-neutral-300 bg-neutral-200 py-2 shadow-xl dark:border-neutral-600 dark:bg-neutral-700">
                <ToolMenuEntry
                  icon={Calculator}
                  label="Tyre Wear Calculator"
                  onClick={() => {
                    setTyreWearManOpen(true);
                    setToolsMenuOpen(false);
                  }}
                />
                <ToolMenuSubMenu
                  label="Quick-Join"
                  icon={Gamepad}
                  isOpen={openSubmenu === "quick-join"}
                  onToggle={() =>
                    setOpenSubmenu(
                      openSubmenu === "quick-join" ? null : "quick-join",
                    )
                  }
                >
                  {RacePlaces.map((place) => (
                    <ToolMenuEntry
                      key={place.key}
                      icon={!PlaceIconsMap[place.key] ? Gamepad : undefined}
                      imageSrc={PlaceIconsMap[place.key]?.path}
                      label={PlaceIconsMap[place.key]?.displayName || place.key}
                      onClick={() => {
                        if (place.id !== 0) {
                          window.location.assign(
                            `roblox://placeId=${place.id}`,
                          );
                        } else {
                          alert("Place ID not set properly in navbar.tsx!");
                        }
                        setToolsMenuOpen(false);
                      }}
                    />
                  ))}
                </ToolMenuSubMenu>
                <ToolMenuSubMenu
                  label="Regs & Docs"
                  icon={LucidePaperclip}
                  isOpen={openSubmenu === "regs-docs"}
                  onToggle={() =>
                    setOpenSubmenu(
                      openSubmenu === "regs-docs" ? null : "regs-docs",
                    )
                  }
                >
                  {DocsList.map((doc) => (
                    <ToolMenuEntry
                      key={doc.name}
                      icon={LucideFileText}
                      label={doc.name}
                      onClick={() => {
                        window.open(doc.url, "_blank");
                        setToolsMenuOpen(false);
                      }}
                    />
                  ))}
                </ToolMenuSubMenu>
              </div>
            )}
          </div>
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
