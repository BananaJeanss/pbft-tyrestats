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
    <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">New Folder</h2>
          <button
            onClick={onClose}
            className="cursor-pointer transition-colors hover:text-neutral-500"
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
              className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 transition-all focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
            />
          </div>

          <div className="flex max-w-full gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                Icon
              </label>
              <IconSelector value={icon} onChange={setIcon} />
            </div>

            <div className="flex max-w-full shrink-0 flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                Color
              </label>
              <div
                className="relative h-10.5 w-15 cursor-pointer overflow-hidden rounded border border-neutral-700 transition-colors hover:border-neutral-500"
                style={{ backgroundColor: color }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  title="Choose folder color"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={HandleCreate}
          className="mt-2 w-full cursor-pointer rounded-lg bg-neutral-300 py-3 font-bold text-black transition hover:bg-neutral-200"
        >
          Create Folder
        </button>
      </div>
    </div>
  );
}
