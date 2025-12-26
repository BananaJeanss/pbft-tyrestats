import { Calendar, Clock } from "lucide-react";
import Image from "next/image";

export interface DashSidebarSessionThings {
  name: string;
  date: string;
  lastModified: string;
  icon: string;
  iconUrl?: string;
  isActive: boolean;
  onClick: () => void;
}

const IconsMap: { [key: string]: string } = {
  default: "/placeholder.png",
  kubica: "/icons/kubica.webp",
  petgear: "/icons/petgear.webp",
  harju: "/icons/harju.webp",
  panther: "/icons/panther.webp",
};

export default function DashSidebarSession({
  name,
  date,
  lastModified,
  isActive,
  icon,
  iconUrl,
  onClick,
}: DashSidebarSessionThings) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-24 rounded-md p-2 flex flex-row gap-4 cursor-pointer transition-colors text-left border ${
        isActive
          ? "bg-blue-100 border-blue-500 dark:bg-blue-950/30 dark:border-blue-700/80"
          : "bg-white hover:bg-zinc-200 border-transparent dark:bg-neutral-900 dark:hover:bg-neutral-950 dark:border-transparent"
      }`}
    >
      {iconUrl && icon === "custom" ? (
        /* eslint-disable-next-line @next/next/no-img-element*/
        <img
          src={iconUrl}
          alt="Track Logo"
          className="w-20 aspect-square min-w-20 shrink-0 rounded-md object-cover bg-zinc-100 dark:bg-neutral-800"
        />
      ) : (
        <Image
          src={IconsMap[icon] || IconsMap["default"]}
          alt="Track Logo"
          width={256}
          height={256}
          className="w-20 aspect-square min-w-20 shrink-0 rounded-md object-cover bg-zinc-100 dark:bg-neutral-800"
        />
      )}

      <div className="flex flex-col justify-center w-full overflow-hidden">
        <h2 className="text-neutral-900 dark:text-neutral-100 text-md font-semibold truncate w-full">
          {name}
        </h2>
        <hr className="my-1 border-gray-200 dark:border-neutral-700 w-full" />
        <span className="flex flex-col gap-1">
          <div className="flex flex-row items-center text-zinc-600 dark:text-neutral-400 text-xs">
            <Calendar className="inline h-3 w-3 mr-1" />
            {date}
          </div>
          <div className="flex flex-row items-center text-zinc-500 dark:text-neutral-400 text-xs">
            <Clock className="inline h-3 w-3 mr-1" />
            {lastModified.split("T")[0]}
          </div>
        </span>
      </div>
    </button>
  );
}
