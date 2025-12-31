import { ClipboardCopyIcon, X } from "lucide-react";
import { toast } from "react-toastify";

export interface ExportMyDataProps {
  onClose: () => void;
}

export default function ExportMyData({ onClose }: ExportMyDataProps) {
  const exportData = JSON.stringify(
    Object.fromEntries(Object.entries(localStorage)),
    null,
    2,
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      toast.info("Data copied to clipboard!");
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  return (
    <div className="absolute top-0 left-0 z-150 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex w-full max-w-2xl flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your LocalStorage Data Export</h2>
          <X onClick={onClose} className="cursor-pointer" />
        </div>
        <textarea
          className="h-96 w-full max-w-3xl resize-none rounded-lg border border-neutral-800 bg-zinc-200 p-4 dark:bg-neutral-900"
          readOnly
          value={exportData}
        />
        <button
          className="text-md flex w-fit cursor-pointer flex-row items-center gap-2 rounded-lg bg-zinc-300 p-2 font-semibold transition hover:bg-gray-200 dark:bg-white"
          onClick={handleCopy}
        >
          <ClipboardCopyIcon />
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
