import { X } from "lucide-react";
import BetterReactMD from "./BetterReactMD";

export interface FullscreenReaderProps {
  onClose: () => void;
  title: string;
  content: string;
  isInput?: boolean;
  onInputChange?: (newContent: string) => void;
}

export default function FullscreenReader({
  onClose,
  title,
  content,
  isInput = false,
  onInputChange,
}: FullscreenReaderProps) {
  return (
    <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex h-full w-full max-w-[90vw] flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="cursor-pointer">
            <X />
          </button>
        </div>
        <hr className="border-neutral-800" />
        <div className="h-full overflow-y-auto">
          {!isInput ? (
            <BetterReactMD content={content} />
          ) : (
            // else, render as input
            <textarea
              className={`h-full w-full resize-none rounded-md bg-zinc-300 p-2 focus:border focus:border-neutral-600 focus:outline-none dark:bg-neutral-800`}
              placeholder={"Add your notes here..."}
              value={content}
              onChange={(e) => onInputChange?.(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
