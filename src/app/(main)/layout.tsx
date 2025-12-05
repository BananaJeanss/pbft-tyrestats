import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "../components/navbar";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "tyrestats Dashboard",
  description: "PBFT Tyre Stats Viewer & Analyzer",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
