"use client";

import { Loader2 } from "lucide-react";
import Navbar from "../components/navbar";
import { useEffect, useState } from "react";

export default function ClientsMainLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
    </div>
  )

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}