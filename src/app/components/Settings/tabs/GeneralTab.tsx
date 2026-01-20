import { authClient } from "@/lib/auth-client";
import { useTheme } from "next-themes";

export default function GeneralTab() {
  const { theme, setTheme } = useTheme();

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
      <div className="grow" />
      <div className="flex w-1/4 flex-col gap-2">
        <button
          className="cursor-pointer rounded-md border border-red-700 p-2 text-sm text-white"
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.reload();
                },
              },
            });
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
