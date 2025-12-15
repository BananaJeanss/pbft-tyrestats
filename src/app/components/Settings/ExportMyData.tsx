import { ClipboardCopyIcon, X } from "lucide-react";
import { toast } from "react-toastify";

export interface ExportMyDataProps {
  onClose: () => void;
}

export default function ExportMyData({ onClose }: ExportMyDataProps) {
  const exportData = JSON.stringify(
    Object.fromEntries(Object.entries(localStorage)),
    null,
    2
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
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-150">
      <div className="w-full max-w-2xl bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Your LocalStorage Data Export
          </h2>
          <X onClick={onClose} className="text-neutral-400 cursor-pointer" />
        </div>
        <textarea
          className="w-full max-w-3xl h-96 bg-neutral-900 text-white p-4 rounded-lg border border-neutral-800 resize-none"
          readOnly
          value={exportData}
        />
        <button
          className="bg-white text-black rounded-lg p-2 font-semibold hover:bg-gray-200 transition w-fit flex flex-row items-center gap-2 text-md cursor-pointer"
          onClick={handleCopy}
        >
          <ClipboardCopyIcon />
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
