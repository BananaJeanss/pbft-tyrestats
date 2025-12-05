import { Settings } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="w-full max-h-20 p-8 bg-neutral-900 text-white flex flex-row items-center">
      <div className="min-w-1/2 flex items-center font-bold text-2xl">
        <Image
          src="/tslogow.png"
          alt="TyreStats Logo"
          width={64}
          height={64}
          className="mr-4"
        />
        | TyreStats
      </div>
      <div className="min-w-1/2 flex flex-row-reverse items-center font-bold text-2xl">
      <Settings />
      </div>
    </nav>
  );
}
