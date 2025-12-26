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
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-150">
      <div className="w-full max-w-md bg-zinc-100 dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-red-500 border-2 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold ">Confirm Data Clearance</h2>
          <button onClick={onClose} className=" cursor-pointer">
            <X />
          </button>
        </div>
        <hr className="border-neutral-800" />
        <p className="text-red-500 font-light">
          This action will permanently delete all your data. This cannot be
          undone. Are you sure you want to proceed?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-zinc-300 dark:bg-neutral-700  font-semibold py-2 px-4 rounded-lg hover:bg-zinc-400 dark:hover:bg-neutral-600 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleClearData}
            className="bg-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-500 transition cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
