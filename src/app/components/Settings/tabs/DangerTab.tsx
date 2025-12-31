import { useState } from "react";
import DangerousDeletionWarningWaaazaaa from "../DangerousDeletionWarningWaaazaaa";
import ExportMyData from "../ExportMyData";
import ImportMyData from "../ImportMyData";
import { Download,
Trash2,
Upload } from "lucide-react";

export default function DangerTab() {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {isWarningOpen && (
        <DangerousDeletionWarningWaaazaaa
          onClose={() => setIsWarningOpen(false)}
        />
      )}
      {isExportOpen && <ExportMyData onClose={() => setIsExportOpen(false)} />}
      {isImportOpen && <ImportMyData onClose={() => setIsImportOpen(false)} />}

      <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
      <p className="text-sm text-neutral-500">
        Sensitive actions that can delete or modify your data permanently.
      </p>
      <hr className="border-neutral-800" />

      <div className="flex flex-col gap-2">
        <button
          onClick={() => setIsExportOpen(true)}
          className="cursor-pointer rounded-md bg-neutral-200 p-2 text-sm font-medium transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <Upload className="inline-block mr-2 h-4 w-4" />
          Export My Data
        </button>
        <button
          onClick={() => setIsImportOpen(true)}
          className="cursor-pointer rounded-md bg-neutral-200 p-2 text-sm font-medium transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <Download className="inline-block mr-2 h-4 w-4" />
          Import My Data
        </button>
        <button
          onClick={() => setIsWarningOpen(true)}
          className="cursor-pointer rounded-md bg-red-600 p-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          <Trash2 className="inline-block mr-2 h-4 w-4" />
          Delete All Data
        </button>
      </div>
    </div>
  );
}