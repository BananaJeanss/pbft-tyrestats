import type { Metadata } from "next";
import SharedSessionPage from "./ShareClient";
import { TySession } from "@/app/types/TyTypes";

async function fetchSession(shortCode: string): Promise<TySession | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/short?${shortCode}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const json = await res.json();
    return json.sessionData ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string>;
}): Promise<Metadata> {
  const shortCode = Object.keys(searchParams)[0];

  if (!shortCode) {
    return {
      title: "Shared Session - TyreStats",
      description: "View a shared TyreStats session",
    };
  }

  const session = await fetchSession(shortCode);

  return {
    title: `${session?.meta?.name ?? "Shared Session"} - TyreStats`,
    description: "View a shared TyreStats session",
    openGraph: {
      title: `${session?.meta?.name ?? "Shared Session"} - TyreStats`,
      description: "View a shared TyreStats session",
      type: "website",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/share?${shortCode}`,
      images: `${process.env.NEXT_PUBLIC_SITE_URL}/tslogow.png`,
    },
  };
}

export default function Page() {
  return <SharedSessionPage />;
}
