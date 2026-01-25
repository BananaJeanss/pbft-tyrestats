"use client";

import BetterReactMD from "@/app/(main)/dashboard/components/BetterReactMD";
import Link from "next/link";

const privacyPolicy = `
# Privacy Policy

**Last Updated:** January 25, 2026

## 1. The Basics

**TyreStats** is a hobby tool. We respect your privacy and only collect what is strictly necessary to make the app work.

## 2. What We Collect & Why

### A. Your Account (Roblox)
-   **What**: We store your **Roblox User ID**, **Username**, and **Avatar**.
-   **Why**: To verify who you are and let you save your data.
-   **Note**: We **never** see or store your passwords. Authentication is handled securely by Roblox.

### B. Your Game Data
-   **What**: The strategies, folders, tyre wear numbers, and notes you create.
-   **Why**: This is the core function of the app—saving your work so you can access it later.
-   **AI Usage**: If you use the "AI Strategy" feature, we send this game data (context only, no personal info) to our AI provider to generate the text response.

### C. Technical Stuff
-   **Cookies**: We use a single cookie to keep you logged in.
-   **Analytics**: We use privacy-friendly analytics (Vercel) to see basic stats like "how many people visited today."
-   **Logs**: For security, we may log IP addresses to prevent spam or abuse of the AI API.

## 3. Who Sees Your Data?

We do not sell your data. We only share it with the infrastructure providers that help run the site:
1.  **Roblox**: For logging you in.
2.  **Vercel**: Hosts the website.
3.  **Hack Club AI**: Generates the strategy text (only receives game context).
4.  **Database Cloud**: Securely stores your saved sessions.

## 4. Your Control (Delete Everything)

You own your data. You can delete your entire account and all saved strategies instantly by clicking **"Delete Account"** in the Settings menu. This action is permanent and wipes your data from our database.

## 5. Contact

If you have concerns, please open an issue in our [GitHub Repository](https://github.com/BananaJeanss/pbft-tyrestats).
`;

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <Link
        href="/"
        className="mb-4 inline-block text-blue-600 hover:underline"
      >
        &#8617; Back to Home
      </Link>
      <BetterReactMD content={privacyPolicy} />
    </div>
  );
}