import { useLocalStorage } from "@/hooks/useLocalStorage";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useTheme } from "next-themes";

export default function GeneralTab() {
  const { theme, setTheme } = useTheme();
  // clock strikes 12 midnight arrives (navbar toggle)
  const [iHateClocks, setIHateClocks] = useLocalStorage<boolean>(
    "tyrestats_navbar_clock",
    false,
  );
  const [showSearchAnyways, setShowSearchAnyways] = useLocalStorage<
    "always" | "never" | "auto"
  >("tyrestats-show-search-anyways", "auto");

  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <div className="flex w-full flex-col gap-4">
      <h3 className="text-lg font-semibold">General Settings</h3>
      <hr className="border-neutral-800" />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="rounded-md border border-neutral-700 bg-transparent p-2 text-sm"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      {/* seperator */}
      <hr className="border-neutral-800" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={iHateClocks}
            onChange={(e) => setIHateClocks(e.target.checked)}
          />
          <span className="text-sm">Enable Navbar UTC Clock</span>
        </div>
        <div className="text-sm text-neutral-500">
          Show/Hide UTC Clock in the Navbar
        </div>
      </div>
      <hr className="border-neutral-800" />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Session Search Bar</label>
        <select
          value={showSearchAnyways}
          onChange={(e) =>
            setShowSearchAnyways(
              e.target.value as "always" | "never" | "auto",
            )
          }
          className="rounded-md border border-neutral-700 bg-transparent p-2 text-sm"
        >
          <option value="auto">Auto</option>
          <option value="always">Always Show</option>
          <option value="never">Never Show</option>
        </select>
      </div>
      <div className="text-sm text-neutral-500">
        Control when the session search bar appears in the dashboard sidebar.
      </div>
      <hr className="border-neutral-800" />
      <div className="flex w-1/4 flex-col gap-2">
        {user && (
          <button
            className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-md border border-red-700 p-2 text-sm"
            onClick={async () => {
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = "/";
                  },
                },
              });
            }}
          >
            <LogOut />
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}
