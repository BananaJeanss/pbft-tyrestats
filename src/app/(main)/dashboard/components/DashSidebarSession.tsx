import { PlaceIconsMap } from "@/app/types/PlaceIconsMap";
import { TySession } from "@/app/types/TyTypes";
import { Calendar, Goal } from "lucide-react";
import Image from "next/image";

export interface DashSidebarSessionThings {
  sessionData: TySession;
  isActive: boolean;
  onClick: () => void;
}

export default function DashSidebarSession({
  sessionData,
  isActive,
  onClick,
}: DashSidebarSessionThings) {
  return (
    <button
      onClick={onClick}
      className={`flex h-24 w-full cursor-pointer flex-row gap-4 rounded-md border p-2 text-left transition-colors ${
        isActive
          ? "border-blue-500 bg-blue-100 dark:border-blue-700/80 dark:bg-blue-950/30"
          : "border-transparent bg-white hover:bg-zinc-200 dark:border-transparent dark:bg-neutral-900 dark:hover:bg-neutral-950"
      }`}
    >
      {sessionData.meta.icon_url &&
      sessionData.meta.selectedIcon === "custom" ? (
        /* eslint-disable-next-line @next/next/no-img-element*/
        <img
          src={sessionData.meta.icon_url}
          alt="Track Logo"
          className="aspect-square w-20 min-w-20 shrink-0 rounded-md bg-zinc-100 object-cover dark:bg-neutral-800"
        />
      ) : (
        <Image
          src={
            (PlaceIconsMap[sessionData.meta.selectedIcon]?.path ||
              PlaceIconsMap["default"].path)
          }
          alt="Track Logo"
          width={256}
          height={256}
          className="aspect-square w-20 min-w-20 shrink-0 rounded-md bg-zinc-100 object-cover dark:bg-neutral-800"
        />
      )}

      <div className="flex w-full flex-col justify-center overflow-hidden">
        <h2 className="text-md w-full truncate font-semibold">
          {sessionData.meta.name}
        </h2>
        <hr className="my-1 w-full border-gray-200 dark:border-neutral-700" />
        <span className="flex flex-col gap-1">
          <div className="flex flex-row items-center text-xs text-zinc-500">
            <Calendar className="mr-1 inline h-3 w-3" />
            {new Date(sessionData.meta.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex flex-row items-center text-xs text-zinc-500">
            <Goal className="mr-1 inline h-3 w-3" />
            Laps: {sessionData.raceConfig.RaceLaps || "N/A"}
          </div>
        </span>
      </div>
    </button>
  );
}
