import { X } from "lucide-react";
import { useState } from "react";
import IconSelector, { IconName } from "../../../components/lucide-selector";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Folder } from "@/app/types/TyTypes";

interface NewFolderProps {
  onClose: () => void;
}

export default function NewFolder({ onClose }: NewFolderProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconName>("folder");
  const getDefaultColor = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "#000000"
        : "#ffffff";
    }
    return "#000000";
  };
  const [color, setColor] = useState<string>(getDefaultColor);
  const [folders, setFolders] = useLocalStorage<Folder[]>(
    "tyrestats_folders",
    [],
  );

  const HandleCreate = () => {
    // validate
    if (!name || name.trim() === "" || !icon || !color) return;
    const newFolder = {
      id: crypto.randomUUID(),
      name: name.trim(),
      icon,
      color,
    };

    // Save to LocalStorage
    setFolders([...folders, newFolder]);
    onClose();
  };

// Removed useEffect for setting color

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
      <div className="w-full max-w-md bg-zinc-100 dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">New Folder</h2>
          <button
            onClick={onClose}
            className="cursor-pointer hover:text-neutral-500 transition-colors"
          >
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. FT1 Season 9 2025"
              className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-neutral-600 transition-all"
            />
          </div>

          <div className="flex gap-4 max-w-full">
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                Icon
              </label>
              <IconSelector value={icon} onChange={setIcon} />
            </div>

            <div className="flex flex-col gap-2 shrink-0 max-w-full">
              <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                Color
              </label>
              <div
                className="h-[42px] w-[60px] rounded border border-neutral-700 overflow-hidden relative cursor-pointer hover:border-neutral-500 transition-colors"
                style={{ backgroundColor: color }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  title="Choose folder color"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={HandleCreate}
          className="w-full bg-neutral-300 text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition mt-2 cursor-pointer"
        >
          Create Folder
        </button>
      </div>
    </div>
  );
}
