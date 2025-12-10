import { Calendar, Clock } from "lucide-react";
import Image from "next/image";

export interface DashSidebarSessionThings {
  name: string;
  date: string;
  lastModified: string;
  icon_url: string;
  isActive: boolean;
  onClick: () => void;
}

export default function DashSidebarSession({
  name,
  date,
  lastModified,
  isActive,
  onClick,
}: DashSidebarSessionThings) {
  return (
        <button
      onClick={onClick}
      className={`w-full h-24 rounded-md p-2 flex flex-row gap-4 cursor-pointer transition-colors text-left ${
        isActive
          ? "bg-blue-950/50 border border-blue-800"
          : "bg-neutral-900 hover:bg-neutral-800"
      }`}
    >
      <Image
        src="/placeholder.png"
        alt="Track Logo"
        className="h-full w-24 rounded-md object-cover bg-neutral-800"
        width={256}
        height={256}
      />
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
