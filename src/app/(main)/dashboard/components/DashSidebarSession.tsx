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
      className={`flex h-24 w-full cursor-pointer flex-row gap-4 rounded-md border p-2 text-left transition-colors ${
        isActive
          ? "border-blue-500 bg-blue-100 dark:border-blue-700/80 dark:bg-blue-950/30"
          : "border-transparent bg-white hover:bg-zinc-200 dark:border-transparent dark:bg-neutral-900 dark:hover:bg-neutral-950"
      }`}
    >
      {iconUrl && icon === "custom" ? (
        /* eslint-disable-next-line @next/next/no-img-element*/
        <img
          src={iconUrl}
          alt="Track Logo"
          className="aspect-square w-20 min-w-20 shrink-0 rounded-md bg-zinc-100 object-cover dark:bg-neutral-800"
        />
      ) : (
        <Image
          src={IconsMap[icon] || IconsMap["default"]}
          alt="Track Logo"
          width={256}
          height={256}
          className="aspect-square w-20 min-w-20 shrink-0 rounded-md bg-zinc-100 object-cover dark:bg-neutral-800"
        />
      )}

      <div className="flex w-full flex-col justify-center overflow-hidden">
        <h2 className="text-md w-full truncate font-semibold">{name}</h2>
        <hr className="my-1 w-full border-gray-200 dark:border-neutral-700" />
        <span className="flex flex-col gap-1">
          <div className="flex flex-row items-center text-xs text-zinc-500">
            <Calendar className="mr-1 inline h-3 w-3" />
            {date}
          </div>
          <div className="flex flex-row items-center text-xs text-zinc-500">
            <Clock className="mr-1 inline h-3 w-3" />
            {lastModified.split("T")[0]}
          </div>
        </span>
      </div>
    </button>
  );
}
