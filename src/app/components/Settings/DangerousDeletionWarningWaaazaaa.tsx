import { TySession } from "@/app/types/TyTypes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { X } from "lucide-react";

export default function DangerousDeletionWarningWaaazaaa({
  onClose,
}: {
  onClose: () => void;
}) {
  const [, setSessions] = useLocalStorage<TySession[]>(
    "tyrestats_sessions",
    [],
  );
  const handleClearData = () => {
    if (window.prompt("Type DELETE to confirm data clearance.") === "DELETE") {
      setSessions([]);
      window.location.reload();
    }
  };
  return (
    <div className="absolute top-0 left-0 z-150 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border-2 border-red-500 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Confirm Data Clearance</h2>
          <button onClick={onClose} className="cursor-pointer">
            <X />
          </button>
        </div>
        <hr className="border-neutral-800" />
        <p className="font-light text-red-500">
          This action will permanently delete all your data. This cannot be
          undone. Are you sure you want to proceed?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-zinc-300 px-4 py-2 font-semibold transition hover:bg-zinc-400 dark:bg-neutral-700 dark:hover:bg-neutral-600"
          >
            Cancel
          </button>
          <button
            onClick={handleClearData}
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 font-semibold transition hover:bg-red-500"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
