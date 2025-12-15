import { Database, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const loginButtonStyles =
  "border p-2 m-2 rounded-4xl transition hover:bg-gray-900 flex flex-row gap-2";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black text-white">
      <Image
        src="/tslogow.png"
        alt="Tyrestats Logo which is very cool and awesome"
        width={256}
        height={256}
      />
      <h1 className="text-4xl font-bold underline mb-2">TyreStats</h1>
      <p>PB Formula Truck raceday statistics dashboard & analyzer</p>
      <hr className="my-4 w-1/2 border-zinc-300" />
      <div className="flex flex-row items-center w-full justify-center">
        <button
          className={`cursor-not-allowed ${loginButtonStyles} relative`}
          disabled
          style={{ opacity: 0.5 }}
        >
          <Github />
          Login with GitHub (not implemented yet)
        </button>
        <div className="h-12 w-px bg-zinc-300 mx-2" />
        <Link href="/dashboard" passHref>
          <button className={`cursor-pointer ${loginButtonStyles}`}>
            <Database />
            LocalStorage (No Login)
          </button>
        </Link>
      </div>
    </div>
  );
}
