import { Info } from "lucide-react";

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
  return (
    <div className="bg-zinc-200 dark:bg-neutral-900 rounded-lg p-4 w-2/7 max-h-2/5 grow flex flex-col gap-2">
      <h3 className="font-semibold">
        Notes
        {!readOnly && (
          <span className="relative group inline-block cursor-pointer">
            <Info className="inline-block ml-2 h-4 w-4" />
            <span className="absolute left-8 top-1/2 -translate-y-1/2 bg-zinc-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              Notes are included in the AI Strategy input.
            </span>
          </span>
        )}
      </h3>
      <textarea
        className={`w-full h-full bg-zinc-300 dark:bg-neutral-800 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-600 ${
          readOnly ? "cursor-not-allowed opacity-70" : ""
        }`}
        placeholder={readOnly ? "No notes added." : "Add your notes here..."}
        value={notes}
        readOnly={readOnly}
        onChange={(e) => !readOnly && onChange?.(e.target.value)}
      />
    </div>
  );
}
