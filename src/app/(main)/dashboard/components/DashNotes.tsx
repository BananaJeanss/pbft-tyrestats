import { FullscreenIcon, Info } from "lucide-react";
import { useState } from "react";
import FullscreenReader from "./FullscreenReader";

export interface DashNotesProps {
  notes?: string;
  onChange?: (newNotes: string) => void;
  readOnly?: boolean;
}

export default function DashNotes({
  notes = "",
  onChange,
  readOnly = false,
}: DashNotesProps) {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  return (
    <>
      {fullscreenOpen && (
        <FullscreenReader
          onClose={() => setFullscreenOpen(false)}
          title="Notes"
          content={notes}
          isInput={!readOnly}
          onInputChange={(newContent: string) => {
            onChange?.(newContent);
          }}
        />
      )}
      <div className="flex w-2/7 grow flex-col gap-2 rounded-lg bg-zinc-200 p-4 dark:bg-neutral-900">
        <div className="flex flex-row items-center">
          <h3 className="font-semibold">
            Notes
            {!readOnly && (
              <span className="relative inline-block">
                <Info className="peer ml-2 inline-block h-4 w-4 cursor-pointer" />
                <span className="pointer-events-none absolute top-1/2 left-8 z-10 -translate-y-1/2 rounded bg-zinc-700 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity peer-hover:opacity-100">
                  Notes are included in the AI Strategy input.
                </span>
              </span>
            )}
          </h3>
          {/* seperator */}
          <div className="grow"></div>
          <FullscreenIcon
            className="cursor-pointer"
            onClick={() => setFullscreenOpen(true)}
          />
        </div>
        <textarea
          className={`h-full w-full resize-none rounded-md bg-zinc-300 p-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800 ${
            readOnly ? "cursor-not-allowed opacity-70" : ""
          }`}
          placeholder={readOnly ? "No notes added." : "Add your notes here..."}
          value={notes}
          readOnly={readOnly}
          onChange={(e) => !readOnly && onChange?.(e.target.value)}
        />
      </div>
    </>
  );
}
