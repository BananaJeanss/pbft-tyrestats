import { useLocalStorage } from "@/hooks/useLocalStorage";

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
        <label className="text-sm font-medium">Auto-Save Interval</label>
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
