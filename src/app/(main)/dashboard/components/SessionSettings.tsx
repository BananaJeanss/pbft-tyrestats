import { X } from "lucide-react";
import { useState } from "react";

export interface SessionSettings {
  name: string;
  date: string;
  tags: string[];
  lastModified: string;
  icon_url: string;
}

export const DEFAULT_SESSIONCONFIGURATION: SessionSettings = {
  name: "Session/Race name",
  date: new Date().toISOString().split("T")[0],
  tags: ["tag1", "tag2"],
  lastModified: new Date().toISOString().split("T")[0],
  icon_url: "",
};

interface SessionSettingsProps {
  currentConfig?: SessionSettings;
  onClose: () => void;
  onSave: (prefs: SessionSettings) => void;
}

export default function SessionSettingsPage({
  currentConfig = DEFAULT_SESSIONCONFIGURATION,
  onClose,
  onSave,
}: SessionSettingsProps) {
  const [config, setConfig] = useState<SessionSettings>(currentConfig);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
      <div className="w-full max-w-md bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Session Settings</h2>
          <button onClick={onClose} className="text-neutral-400 cursor-pointer">
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />

        <div className="flex flex-col gap-6">
          {/* session name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-300">
              Session Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={config.name}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    name: e.target.value,
                  })
                }
                className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />
            </div>
          </div>
          {/* date selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-300">
              Session Date
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={config.date}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    date: e.target.value,
                  })
                }
                className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-neutral-300 text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition mt-2 cursor-pointer"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
