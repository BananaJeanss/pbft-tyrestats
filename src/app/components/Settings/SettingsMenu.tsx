import { Trash2, TriangleAlert, X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState } from "react";
import DangerousDeletionWarningWaaazaaa from "./DangerousDeletionWarningWaaazaaa";
import ExportMyData from "./ExportMyData";
import ImportMyData from "./ImportMyData";

export interface SettingsMenuProps {
  onClose: () => void;
}

export default function SettingsPage({ onClose }: SettingsMenuProps) {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // atuo save
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useLocalStorage<boolean>(
    "tyrestats_autosave_enabled",
    true,
  );
  const [autoSaveInterval, setAutoSaveInterval] = useLocalStorage<number>(
    "tyrestats_autosave_interval",
    2.5,
  );

  const [selectedTheme, setSelectedTheme] = useLocalStorage<string>(
    "tyrestats_theme",
    "system",
  );

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
        <div className="w-full max-w-md bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 cursor-pointer"
            >
              <X />
            </button>
          </div>

          <hr className="border-neutral-800" />
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-neutral-300">
              Theme (non functional rn)
            </label>
            <select
              className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
            >
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <hr className="border-neutral-800" />
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-neutral-300">
              Auto-Save
            </label>
            <div className="flex flex-row">
              <input
                type="checkbox"
                checked={isAutosaveEnabled}
                onChange={(e) => setIsAutosaveEnabled(e.target.checked)}
              />
              <span className="ml-2 text-white">Enable Auto-Save</span>
            </div>
            <div className="flex flex-row items-center">
              <input
                type="number"
                className="w-1/4 bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-neutral-600"
                placeholder="2.5"
                value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
              />
              <span className="ml-2 text-white text-sm">
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
          <label className="text-md font-semibold text-neutral-300">
            Your Data
          </label>
          <div className="flex flex-row items-center gap-2">
            <button
              className="bg-neutral-700 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-neutral-600 transition cursor-pointer w-fit"
              onClick={() => {
                setIsExportOpen(true);
              }}
            >
              Export Data
            </button>
            <div className="h-8 w-px bg-neutral-800 mx-2" />
            <button
              className="bg-neutral-700 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-neutral-600 transition cursor-pointer w-fit"
              onClick={() => {
                setIsImportOpen(true);
              }}
            >
              Import & Overwrite Data
            </button>
          </div>
          <button
            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-500 transition cursor-pointer w-fit"
            onClick={() => {
              setIsWarningOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Clear All Data</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
