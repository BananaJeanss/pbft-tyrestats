import { PlaceIconsMap } from "@/app/types/PlaceIconsMap";
import { TySession } from "@/app/types/TyTypes";
import { Goal } from "lucide-react";
import Image from "next/image";

export interface SuggestedSessionCardProps {
  session: TySession;
  onClick: () => void;
}

export default function SuggestedSessionCard({
  session,
  onClick,
}: SuggestedSessionCardProps) {
  const currentDate = new Date();
  const sessionDate = new Date(session.meta.date);
  const diffTime = sessionDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return (
    <div
      className="flex min-w-32 w-48 cursor-pointer flex-col items-center rounded-lg border border-zinc-300 bg-neutral-100 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
      onClick={onClick}
    >
      {session.meta.icon_url && session.meta.selectedIcon === "custom" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.meta.icon_url}
          alt="Session Icon"
          className="mb-2 h-24 w-24 rounded-lg object-contain"
        />
      ) : (
        <Image
          src={PlaceIconsMap[session.meta.selectedIcon || "default"].path}
          alt="Session Icon"
          className="mb-2 h-24 w-24 rounded-lg object-contain"
          width={128}
          height={128}
        />
      )}
      <h3
        className="max-w-full truncate text-lg font-semibold"
        title={session.meta.name}
      >
        {session.meta.name.length > 32
          ? session.meta.name.slice(0, 32) + "…"
          : session.meta.name}
      </h3>
      <hr className="my-2 w-full border-neutral-300 dark:border-neutral-700" />
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {diffDays > 1
          ? `in ${diffDays} days`
          : diffDays === 1
            ? "tomorrow"
            : "today"}
      </p>
      <div className="flex flex-row items-center gap-1">
        <Goal className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        <p className="text-sm font-light text-neutral-600 dark:text-neutral-400">
          {session.raceConfig.RaceLaps || 0} Laps
        </p>
      </div>
    </div>
  );
}
