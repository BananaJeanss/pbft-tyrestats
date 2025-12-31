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
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
      <div className="h-full w-full max-w-[90vw] bg-zinc-100 dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <div className="flex justify-between items-center">
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
              className={`w-full h-full bg-zinc-300 dark:bg-neutral-800 rounded-md p-2 resize-none focus:outline-none focus:border focus:border-neutral-600`}
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
