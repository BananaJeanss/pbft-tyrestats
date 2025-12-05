import { Database, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const loginButtonStyles =
  "border cursor-pointer p-2 m-2 rounded-4xl transition hover:bg-gray-900 flex flex-row gap-2";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black text-white">
      <h1 className="text-4xl font-bold underline mb-2">tyrestats</h1>
      <p>PB Formula Truck raceday statistics dashboard & analyzer</p>
      <hr className="my-4 w-1/2 border-zinc-300" />
      <div className="flex flex-row">
        <button className={loginButtonStyles}>
          <Github />
          Login with GitHub
        </button>
        <Link href="/dashboard" passHref>
          <button className={loginButtonStyles}>
            <Database />
            LocalStorage (No Login)
          </button>
        </Link>
      </div>
    </div>
  );
}
