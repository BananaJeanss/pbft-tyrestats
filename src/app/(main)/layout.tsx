import type { Metadata } from "next";
import "../globals.css";
import Navbar from "../components/navbar";

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
