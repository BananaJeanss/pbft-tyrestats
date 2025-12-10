export interface DashNotesProps {
  notes?: string;
  onChange?: (newNotes: string) => void;
}

export default function DashNotes({ notes = "", onChange }: DashNotesProps) {
  return (
    <div className="bg-neutral-900 rounded-lg p-4 w-2/7 h-2/5 flex flex-col gap-2">
      <h3 className="font-semibold">Notes</h3>
      <textarea
        className="w-full h-full bg-neutral-800 rounded-md p-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-neutral-600"
        placeholder="Add your notes here..."
        value={notes}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
