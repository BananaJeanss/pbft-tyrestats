import { Home, LucideIcon, Save, TriangleAlert, Webhook, X } from "lucide-react";
import { useState, useEffect } from "react";
import GeneralTab from "./tabs/GeneralTab";
import AutoSaveTab from "./tabs/AutoSaveTab";
import WebhooksTab from "./tabs/Webhooks/WebhooksTab";
import DangerTab from "./tabs/DangerTab";

export interface SettingsMenuProps {
  onClose: () => void;
}

interface SettingsTab {
  id: string;
  label: string;
  lucideIcon: LucideIcon;
  Component: React.ComponentType;
}

export default function SettingsPage({ onClose }: SettingsMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [nextBuildId, setNextBuildId] = useState("dev");

  const settingsTabs: SettingsTab[] = [
    { id: "general", label: "General", lucideIcon: Home, Component: GeneralTab },
    {
      id: "autosave",
      label: "Auto-Save",
      lucideIcon: Save,
      Component: AutoSaveTab,
    },
    {
      id: "webhooks",
      label: "Webhooks",
      lucideIcon: Webhook,
      Component: WebhooksTab,
    },
    {
      id: "danger",
      label: "Danger Zone",
      lucideIcon: TriangleAlert,
      Component: DangerTab,
    },
  ];

  const [currentTab, setCurrentTab] = useState("general");

  const ActiveTab =
    settingsTabs.find((t) => t.id === currentTab)?.Component || GeneralTab;

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    fetch("/api/build-id")
      .then((res) => res.json())
      .then((data) => setNextBuildId(data.buildId))
      .catch(() => setNextBuildId("dev"));
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex h-[65vh] w-full max-w-[65vw] flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose} className="cursor-pointer">
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />
        <div className="flex grow flex-row gap-2">
          {/* Tabs */}
          <div className="flex w-1/4 flex-col gap-2">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-md p-2 text-left transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 ${
                  currentTab === tab.id
                    ? "bg-neutral-300 font-bold dark:bg-neutral-700"
                    : ""
                }`}
                onClick={() => setCurrentTab(tab.id)}
              >
                <tab.lucideIcon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
          {/* very awesome and cool vertical divider */}
          <div className="w-px bg-neutral-800" />
          {/* Tab Contents */}
          <div className="w-3/4 p-2 overflow-y-auto">
            <ActiveTab />
          </div>
        </div>

        <hr className="border-neutral-800" />
        <span className="text-center text-xs">
          TyreStats |{" "}
          <a
            href="https://github.com/BananaJeanss/pbft-tyrestats"
            className="underline"
          >
            {"View Source"}
          </a>{" "}
          | Build{" "}
          <a
            href={`https://github.com/BananaJeanss/pbft-tyrestats/commit/${nextBuildId}`}
            className="underline"
          >
            {nextBuildId}
          </a>
        </span>
      </div>
    </div>
  );
}