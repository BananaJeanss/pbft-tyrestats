import { ClipboardCopyIcon, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export interface ImportMyDataProps {
  onClose: () => void;
}



export default function ImportMyData({ onClose }: ImportMyDataProps) {
  const [importData, setImportData] = useState<string>("");

  interface ExpectedImportData  {
    [key: string]: any;
    

  }

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-150">
      <div className="w-full max-w-2xl bg-neutral-900 rounded-xl p-6 flex flex-col gap-2 border border-neutral-800 shadow-2xl">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Import Data</h2>
            <X onClick={onClose} className="text-neutral-400 cursor-pointer" />
          </div>
          <span className="text-yellow-500 flex flex-row items-center text-sm gap-2">
            <TriangleAlert />
            This will overwrite ALL data you have saved. Proceed with caution.
          </span>
        </div>
        <textarea
          className="w-full max-w-3xl h-96 bg-neutral-900 text-white p-4 rounded-lg border border-neutral-800 resize-none"
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder="Paste your exported data here..."
        />
      </div>
    </div>
  );
}
