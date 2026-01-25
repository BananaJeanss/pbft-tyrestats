"use client";

import BetterReactMD from "@/app/(main)/dashboard/components/BetterReactMD";
import Link from "next/link";

const termsOfService = `
# Terms of Service

**Last Updated:** January 25, 2026

## 1. Quick Summary
TyreStats is a **independent hobby project**. It is **not** created, endorsed, or supported by **Roblox Corporation**. By using this tool, you understand that it is for **video game strategy only**.

## 2. Acceptable Use
You are welcome to use this tool for your racing leagues, provided you:
1.  **Don't Break It**: Do not try to hack, spam, or overload our servers/APIs.
2.  **Be Nice**: Do not type illegal, hateful, or inappropriate text into the "Notes" fields. You are responsible for the content you create.
3.  **Fair Play**: Do not use automated bots to scrape our data.

## 3. The "AI" Disclaimer
The Strategy AI is an experimental feature powered by Large Language Models.
-   **It May Be Wrong**: The AI can "hallucinate" or give bad advice. Always double-check the math.
-   **No Liability**: We are not responsible if the AI's strategy makes you lose a race.

## 4. Intellectual Property
-   **Your Data**: The strategies you calculate are yours.
-   **Our Code**: The website code and design are ours.
-   **Roblox Assets**: Any Roblox logos or icons are the property of Roblox Corporation and used here for reference/fan purposes only.

## 5. Termination
We reserve the right to ban users who abuse the system (e.g., spamming the AI endpoint) without notice.

## 6. Disclaimer of Warranty
**THE SERVICE IS PROVIDED "AS IS".** WE MAKE NO PROMISES THAT IT WILL ALWAYS BE ONLINE, ERROR-FREE, OR PERFECT. USE IT AT YOUR OWN RISK.

## 7. Contact
Questions? Bugs? Please report them on our [GitHub Repository](https://github.com/BananaJeanss/pbft-tyrestats).
`;

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <Link
        href="/"
        className="mb-4 inline-block text-blue-600 hover:underline"
      >
         &#8617; Back to Home
      </Link>
      <BetterReactMD content={termsOfService} />
    </div>
  );
}