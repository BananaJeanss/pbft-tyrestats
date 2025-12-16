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
      className={`w-full h-24 rounded-md p-2 flex flex-row gap-4 cursor-pointer transition-colors text-left ${
        isActive
          ? "bg-blue-950/30 border border-blue-700/80"
          : "bg-neutral-900 hover:bg-neutral-950"
      }`}
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt="Track Logo"
          className="w-20 aspect-square min-w-20 shrink-0 rounded-md object-cover bg-neutral-800"
        />
      ) : (
        <Image
          src={IconsMap[icon] || IconsMap["default"]}
          alt="Track Logo"
          width={256}
          height={256}
          className="w-20 aspect-square min-w-20 shrink-0 rounded-md object-cover bg-neutral-800"
        />
      )}

      <div className="flex flex-col justify-center w-full overflow-hidden">
        <h2 className="text-white text-md font-semibold truncate w-full">
          {name}
        </h2>
        <hr className="my-1 border-neutral-700 w-full" />
        <span className="flex flex-col gap-1">
          <div className="flex flex-row items-center text-neutral-400 text-xs">
            <Calendar className="inline h-3 w-3 mr-1" />
            {date}
          </div>
          <div className="flex flex-row items-center text-neutral-400 text-xs">
            <Clock className="inline h-3 w-3 mr-1" />
            {lastModified.split("T")[0]}
          </div>
        </span>
      </div>
    </button>
  );
}
