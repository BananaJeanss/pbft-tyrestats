import { Trash2, TriangleAlert, X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useEffect } from "react";
import DangerousDeletionWarningWaaazaaa from "./DangerousDeletionWarningWaaazaaa";
import ExportMyData from "./ExportMyData";
import ImportMyData from "./ImportMyData";
import { useTheme } from "next-themes";

export interface SettingsMenuProps {
  onClose: () => void;
}

export default function SettingsPage({ onClose }: SettingsMenuProps) {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // atuo save
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useLocalStorage<boolean>(
    "tyrestats_autosave_enabled",
    true,
  );
  const [autoSaveInterval, setAutoSaveInterval] = useLocalStorage<number>(
    "tyrestats_autosave_interval",
    0.5,
  );

  const { theme, setTheme } = useTheme();
  const [nextBuildId, setNextBuildId] = useState("dev");

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    fetch("/api/build-id")
      .then((res) => res.json())
      .then((data) => setNextBuildId(data.buildId))
      .catch(() => setNextBuildId("dev"));
  }, []);

  if (!mounted) return null;

  return (
    <>
      {isWarningOpen && (
        <DangerousDeletionWarningWaaazaaa
          onClose={() => setIsWarningOpen(false)}
        />
      )}
      {isExportOpen && <ExportMyData onClose={() => setIsExportOpen(false)} />}
      {isImportOpen && <ImportMyData onClose={() => setIsImportOpen(false)} />}
      <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
        <div className="w-full max-w-md bg-zinc-100 dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold ">Settings</h2>
            <button onClick={onClose} className=" cursor-pointer">
              <X />
            </button>
          </div>

          <hr className="border-neutral-800" />
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold ">Theme</label>
            <select
              className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <hr className="border-neutral-800" />
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold ">Auto-Save</label>
            <div className="flex flex-row">
              <input
                type="checkbox"
                checked={isAutosaveEnabled}
                onChange={(e) => setIsAutosaveEnabled(e.target.checked)}
              />
              <span className="ml-2 ">Enable Auto-Save</span>
            </div>
            <div className="flex flex-row items-center">
              <input
                type="number"
                className="w-1/4 bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2  focus:outline-none focus:ring-2 focus:ring-neutral-600"
                placeholder="0.5"
                min={0.1}
                value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
              />
              <span className="ml-2  text-sm">
                Auto-save Interval (in seconds)
              </span>
            </div>
            {!isAutosaveEnabled && (
              <span className="text-xs text-yellow-500">
                <TriangleAlert className="inline w-4 h-4 mr-1" />
                Auto-Save is disabled. Press CTRL+S to manually save your data.
              </span>
            )}
          </div>
          <hr className="border-neutral-800" />
          <label className="text-md font-semibold ">Your Data</label>
          <div className="flex flex-row items-center gap-2">
            <button
              className="bg-zinc-300 dark:bg-neutral-700  text-sm font-semibold py-2 px-4 rounded-lg hover:bg-zinc-400 dark:hover:bg-neutral-600 transition cursor-pointer w-fit"
              onClick={() => {
                setIsExportOpen(true);
              }}
            >
              Export Data
            </button>
            <div className="h-8 w-px bg-neutral-800 mx-2" />
            <button
              className="bg-zinc-300 dark:bg-neutral-700  text-sm font-semibold py-2 px-4 rounded-lg hover:bg-zinc-400 dark:hover:bg-neutral-600 transition cursor-pointer w-fit"
              onClick={() => {
                setIsImportOpen(true);
              }}
            >
              Import & Overwrite Data
            </button>
          </div>
          <button
            className="bg-red-600  font-semibold py-2 px-4 rounded-lg hover:bg-red-500 transition cursor-pointer w-fit"
            onClick={() => {
              setIsWarningOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Clear All Data</span>
            </div>
          </button>
          <hr className="border-neutral-800" />
          <span className="text-xs  text-center">
            TyreStats |{" "}
            <a
              href="https://github.com/BananaJeanss/pbft-tyrestats"
              className="underline"
            >
              {"View Source"}
            </a>{" "}
            | Build{" "}
            <a
              href={`https://github.com/BananaJeanss/pbft-tyrestats/commit/${nextBuildId}`}
              className="underline"
            >
              {nextBuildId}
            </a>
          </span>
        </div>
      </div>
    </>
  );
}
