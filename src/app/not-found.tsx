"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const randomMessages = [
  "I am stupid, I am stupid, I switch off everything.",
  "Trophy for the hero of race!",
  "All the time you have to leave a space!",
  "I cannot believe it. I cannot believe it. I cannot believe it. Is it safe to drive with no brakes?",
  "Must be the water",
  "Ricky, these are not new inters. Which inter is this? Hello?",
  "GP2 engine. GP2. ARGH!",
  "Karma!",
  "Five seconds is a yoke! A yoke!",
  "Leave me alone, I know what I'm doing.",
  "No Kimi, you will not have the drink. Sorry.",
  "Gloves! Gloves and steering wheel! Hey! Hey!",
  "FOR WHAT?!",
  "We are checking.",
  "Stop inventing.",
  "If you stay ahead, you will be P1.",
  "NOOOOOOOOO!",
  "Michael I just sent you an email, with diagrams with where the car should be, did you receive that?",
];

export default function NotFound() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMessage(
        randomMessages[Math.floor(Math.random() * randomMessages.length)],
      );
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Image src="/tslogow.png" alt="Tyrestats Logo" width={256} height={256} />
      <h1 className="mb-2 text-4xl font-bold">404</h1>

      <p>{message || "Looking for the apex..."}</p>

      <Link href="/" className="mt-4 text-(--tyrestats-blue) underline">
        Go back to Home Page
      </Link>
    </div>
  );
}
