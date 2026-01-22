import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://localhost:3000",
});

export const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: "roblox",
    callbackURL: "/dashboard",
  });
  return data;
};
