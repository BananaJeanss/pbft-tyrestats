import { Calendar, Clock, Tag } from "lucide-react";
import Image from "next/image";


export default function DashSidebar() {
  return (
    <div className="w-1/4 h-full bg-neutral-800 rounded-lg p-4 overflow-y-auto" style={{
        scrollbarGutter: 'stable', 
        scrollbarColor: 'rgba(100, 116, 139) transparent',
     }}>
      <div className="w-full h-2/12 bg-neutral-900 rounded-md p-2 flex flex-row gap-4">
        <Image
          src="/placeholder.png"
          alt="Track Logo"
          className="h-full w-2/8 rounded-md"
          width={256}
          height={256}
        />
        <div className="flex flex-col">
          <h2 className="text-white text-lg font-semibold">
            Track Name/Session Name
          </h2>
          <hr className="my-2 border-neutral-700" />
          <span className="flex flex-col justify-between">
            <div className="flex flex-row items-center text-neutral-400 text-sm">
              <Calendar className="inline h-4 w-4 mr-2 text-neutral-400" />
              Date
            </div>
            <div className="flex flex-row items-center text-neutral-400 text-sm">
              <Clock className="inline h-4 w-4 mr-2 text-neutral-400" />
              Edited on 12/12/2025
            </div>
          </span>
        </div>
      </div>
    </div>
  );
}
