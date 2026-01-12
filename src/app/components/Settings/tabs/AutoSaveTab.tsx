import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CircleQuestionMark, Info } from "lucide-react";

export default function AutoSaveTab() {
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useLocalStorage<boolean>(
    "tyrestats_autosave_enabled",
    true,
  );
  const [autoSaveInterval, setAutoSaveInterval] = useLocalStorage<number>(
    "tyrestats_autosave_interval",
    0.5,
  );

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Auto-Save Settings</h3>
      <hr className="border-neutral-800" />
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isAutosaveEnabled}
          onChange={(e) => setIsAutosaveEnabled(e.target.checked)}
          id="autosave-enabled"
          className="h-4 w-4"
        />
        <label htmlFor="autosave-enabled" className="text-sm font-medium">
          Enable Auto-Save
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <div className="group relative flex flex-row items-center gap-2">
          <label className="text-sm font-medium">
            Notes Auto-Save Interval
          </label>
          <span className="relative inline-block">
            <Info className="peer ml-2 inline-block h-4 w-4 cursor-pointer" />
            <span className="w-20/2 pointer-events-none absolute top-1/2 left-8 z-10 -translate-y-1/2 rounded bg-zinc-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity peer-hover:opacity-100">
              Interval in seconds to save notes after the last keypress. Everything else is saved instantly.
            </span>
          </span>
        </div>
        <input
          type="number"
          min="0.1"
          max="5"
          step="0.1"
          value={autoSaveInterval}
          onChange={(e) => setAutoSaveInterval(parseFloat(e.target.value))}
          className="w-24 rounded border border-neutral-700 bg-zinc-200 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
        />
      </div>
    </div>
  );
}
