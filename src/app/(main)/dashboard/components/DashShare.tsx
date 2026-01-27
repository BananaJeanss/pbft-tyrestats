import { TySession } from "@/app/types/TyTypes";
import {
  X,
  Copy,
  Send,
  Check,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getEffectiveTyreData } from "../TyreMath";
import { DEFAULT_PREFERENCES } from "./TyreSettings";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { WebhookEntry } from "@/app/components/Settings/tabs/Webhooks/WebhooksTab";

export interface DashShareProps {
  onClose: () => void;
  SessionData: TySession;
  onShortUrlUpdate: (url: string) => void;
}

// Map tyre IDs to Discord-friendly Emojis and Colors
const TYRE_DISPLAY_MAP: Record<string, { emoji: string; label: string }> = {
  soft: { emoji: "🟥", label: "Soft" },
  medium: { emoji: "🟨", label: "Medium" },
  hard: { emoji: "⬜", label: "Hard" },
  wet: { emoji: "🟦", label: "Wet" },
};

const TYRE_ORDER = ["soft", "medium", "hard", "wet"];

export default function DashShare({
  onClose,
  SessionData,
  onShortUrlUpdate,
}: DashShareProps) {
  const [copiedType, setCopiedType] = useState<"static" | "short" | null>(null);
  const [selectedWebhookId, setSelectedWebhookId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [shortUrl, setShortUrl] = useState<string>(SessionData.shortUrl || "");
  const [includeShortLink, setIncludeShortLink] = useState<boolean>(false);

  const [webhooks, _setWebhooks] = useLocalStorage<string[]>(
    "tyrestats_discord_webhooks",
    [],
  );

  useEffect(() => {
    if (webhooks.length > 0 && !selectedWebhookId) {
      const parsedWebhooks = webhooks.map(
        (webhookStr) => JSON.parse(webhookStr) as WebhookEntry,
      );
      const defaultWebhook =
        parsedWebhooks.find((w) => w.isDefault) || parsedWebhooks[0];
      if (defaultWebhook) {
        setSelectedWebhookId(defaultWebhook.id);
      }
    }
  }, [webhooks, selectedWebhookId]);

  const handleCopy = (text: string, type: "static" | "short") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleSendToDiscord = async () => {
    // Find the selected webhook to get its data
    const selectedWebhook = webhooks
      .map((webhookStr) => JSON.parse(webhookStr) as WebhookEntry)
      .find((w) => w.id === selectedWebhookId);

    if (!selectedWebhook || !selectedWebhook.url) return;

    setIsSending(true);
    setSendStatus("idle");

    try {
      // Build Tyre Fields dynamically
      const tyreFields: { name: string; value: string; inline: boolean }[] = [];

      // Merge with defaults to ensure ratios exist for estimation, being extra careful with types/missing values
      const mergedPrefs = {
        preferredSwitchoverPoint:
          Number(SessionData.tyrePreferences?.preferredSwitchoverPoint) ||
          DEFAULT_PREFERENCES.preferredSwitchoverPoint,
        softToMediumRatio:
          Number(SessionData.tyrePreferences?.softToMediumRatio) ||
          DEFAULT_PREFERENCES.softToMediumRatio,
        mediumToHardRatio:
          Number(SessionData.tyrePreferences?.mediumToHardRatio) ||
          DEFAULT_PREFERENCES.mediumToHardRatio,
      };

      TYRE_ORDER.forEach((tyreId) => {
        const effectiveData = getEffectiveTyreData(
          tyreId,
          SessionData.tyreData ?? {},
          mergedPrefs,
        );

        const display = TYRE_DISPLAY_MAP[tyreId] || {
          emoji: "⚫",
          label: tyreId,
        };

        // If effectiveData exists and has valid wear, show it
        if (effectiveData && effectiveData.wearPerLap > 0) {
          const { wearPerLap, isEstimated } = effectiveData;
          const pref = mergedPrefs.preferredSwitchoverPoint;
          const recLaps = Math.floor((100 - pref) / wearPerLap);
          const remainingLifeAtRec = (100 - wearPerLap * recLaps).toFixed(2);
          const estLabel = isEstimated ? " (Est)" : "";

          tyreFields.push({
            name: `${display.emoji} ${display.label}`,
            value: `**Wear:** ${wearPerLap.toFixed(
              2,
            )}%/lap${estLabel}\n**Rec:** ${recLaps} Laps (~${remainingLifeAtRec}%)`,
            inline: true,
          });
        } else if (tyreId !== "wet") {
          // For dry tyres, if no data AND no estimate, show fallback
          tyreFields.push({
            name: `${display.emoji} ${display.label}`,
            value: "No data/estimation available.",
            inline: true,
          });
        }
      });

      // Fallback if somehow no fields were added (shouldn't happen now)
      if (tyreFields.length === 1) {
        tyreFields.push({
          name: "Tyre Data",
          value: "No tyre wear data recorded yet.",
          inline: false,
        });
      }

      const payload = {
        username: selectedWebhook?.displayName || "TyreStats",
        avatar_url:
          selectedWebhook?.iconUrl ||
          "https://github.com/BananaJeanss/pbft-tyrestats/blob/main/public/tslogow.png?raw=true",
        embeds: [
          {
            title: `Strategy: ${SessionData.meta.name}`,
            url: includeShortLink && shortUrl ? shortUrl : undefined,
            description: `**Track:** ${SessionData.meta.selectedIcon}\n**Date:** ${SessionData.meta.date}\n**Race Length:** ${SessionData.raceConfig.RaceLaps} Laps`,
            color: 23039,
            fields: tyreFields,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const response = await fetch(selectedWebhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 204) {
        setSendStatus("success");
        setTimeout(() => setSendStatus("idle"), 3000);
      } else {
        const errText = await response.text();
        console.error("Discord API Error:", errText);
        setSendStatus("error");
      }
    } catch (error) {
      console.error("Webhook network error:", error);
      setSendStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  const [DataToInclude, setDataToInclude] = useState({
    tyreData: true,
    tyrePreferences: true,
    weather: true,
    miscStats: true,
    manualStints: true,
    aiConfigSettings: true,
    currentNotes: true,
    currentSuggestion: true,
  });

  const handleShortUrlGenerated = (newShortUrl: string) => {
    setShortUrl(newShortUrl);
    onShortUrlUpdate(newShortUrl);
    handleCopy(newShortUrl, "short");
  };

  const handleShortUrlGeneration = async () => {
    setIsSending(true);

    const sessionDataToSend: TySession = {
      id: SessionData.id,
      folder: null,
      meta: SessionData.meta,
      raceConfig: SessionData.raceConfig,

      tyreData: DataToInclude.tyreData ? SessionData.tyreData : {},

      manualStints: DataToInclude.manualStints ? SessionData.manualStints : [],

      tyrePreferences: DataToInclude.tyrePreferences
        ? SessionData.tyrePreferences
        : DEFAULT_PREFERENCES,

      aiConfigSettings: DataToInclude.aiConfigSettings
        ? SessionData.aiConfigSettings
        : {
            model: "google/gemini-3-pro-preview",
            temperature: 0.7,
            top_p: 1,
            useExperimentalPrompt: false,
          },

      weather: DataToInclude.weather ? SessionData.weather : undefined,

      miscStats: DataToInclude.miscStats ? SessionData.miscStats : undefined,

      currentNotes: DataToInclude.currentNotes
        ? SessionData.currentNotes
        : undefined,

      currentSuggestion: DataToInclude.currentSuggestion
        ? SessionData.currentSuggestion
        : undefined,
    };

    try {
      const response = await fetch("/api/short", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send the constructed object, do not reassign the prop
        body: JSON.stringify({ sessionData: sessionDataToSend }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.finalizedUrl) {
        handleShortUrlGenerated(data.finalizedUrl);
      } else {
        console.error("Error generating short link: No URL returned");
      }
    } catch (err) {
      console.error("Error generating short link:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="animate-in fade-in zoom-in-95 flex w-full max-w-lg flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl duration-200 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <LinkIcon size={20} /> Share Session
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            <X size={20} />
          </button>
        </div>

        <hr className="border-neutral-800" />

        {/* i waas gonna add an option to generate a static link but its too long */}

        {/* Short URL Section */}
        <div className="flex flex-col gap-2">
          <label className="flex justify-between text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <span>Short Link</span>
          </label>
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shortUrl || "Shortened URL not generated"}
              className={`grow rounded-lg border border-neutral-300 bg-zinc-50 p-2.5 pr-10 text-sm text-neutral-600 focus:ring-2 focus:ring-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 ${
                !shortUrl &&
                "cursor-not-allowed text-neutral-400 italic opacity-60"
              }`}
            />
            <button
              disabled={isSending}
              onClick={() => {
                if (!shortUrl) {
                  handleShortUrlGeneration();
                } else {
                  handleCopy(shortUrl, "short");
                }
              }}
              className={`flex h-10.5 min-w-25 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white ${
                isSending
                  ? "cursor-not-allowed bg-neutral-400 opacity-70 dark:bg-neutral-700"
                  : shortUrl
                    ? "cursor-pointer bg-(--tyrestats-blue) hover:bg-(--tyrestats-blue)/90"
                    : "cursor-pointer bg-(--tyrestats-blue) hover:bg-(--tyrestats-blue)/90"
              } `}
            >
              {isSending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : shortUrl ? (
                <>
                  <span>{copiedType === "short" ? "Copied!" : "Copy"}</span>
                  <Copy size={16} />
                </>
              ) : (
                <>
                  <span>Generate</span>
                  <LinkIcon size={16} />
                </>
              )}
            </button>
          </div>
          {shortUrl && (
            <div className="flex flex-row items-center gap-2">
              <button
                className="cursor-pointer text-left text-sm underline opacity-70"
                onClick={() => {
                  // regenerate a new one
                  handleShortUrlGeneration();
                }}
              >
                Regenerate
              </button>
              <span
                className="cursor-help"
                title="Generates a new short link. If you have the same data, it'll be the same URL."
              >
                <Info size={14} />
              </span>
            </div>
          )}
          <details className="cursor-pointer text-sm text-neutral-500 dark:text-neutral-400">
            <summary>Include</summary>
            <div className="flex flex-wrap gap-2 py-2">
              {[
                { key: "tyreData", label: "Tyre Data" },
                { key: "tyrePreferences", label: "Tyre Preferences" },
                { key: "weather", label: "Weather" },
                { key: "miscStats", label: "Misc Stats" },
                { key: "manualStints", label: "Manual Stints" },
                { key: "aiConfigSettings", label: "AI Config" },
                { key: "currentNotes", label: "Notes" },
                { key: "currentSuggestion", label: "AI Suggestion" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`cursor-pointer rounded border px-2 py-1 text-xs font-medium ${
                    DataToInclude[item.key as keyof typeof DataToInclude]
                      ? "border-(--tyrestats-blue) text-white"
                      : ""
                  }`}
                  onClick={() =>
                    setDataToInclude((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof prev],
                    }))
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </details>
        </div>

        <hr className="border-neutral-800/50" />

        {/* Discord Section */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Send to Discord
            {sendStatus === "error" && (
              <span className="flex items-center gap-1 text-xs font-normal text-red-500">
                <AlertCircle size={12} /> Failed (Check URL)
              </span>
            )}
            {sendStatus === "success" && (
              <span className="flex items-center gap-1 text-xs font-normal text-green-500">
                <Check size={12} /> Sent!
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <select
              value={selectedWebhookId}
              onChange={(e) => setSelectedWebhookId(e.target.value)}
              className="grow rounded-lg border border-neutral-300 bg-zinc-50 p-2.5 text-sm text-neutral-600 focus:ring-2 focus:ring-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {webhooks.length === 0 && (
                <option value="" disabled>
                  No webhooks saved (add in Settings)
                </option>
              )}
              {webhooks
                .map((webhookStr) => JSON.parse(webhookStr) as WebhookEntry)
                .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
                .map((webhook) => (
                  <option key={webhook.id} value={webhook.id}>
                    {webhook.name}
                    {webhook.isDefault ? " • Default" : ""}
                  </option>
                ))}
            </select>
            <button
              disabled={
                isSending ||
                !selectedWebhookId ||
                (() => {
                  const selectedWebhook = webhooks
                    .map((webhookStr) => JSON.parse(webhookStr) as WebhookEntry)
                    .find((w) => w.id === selectedWebhookId);
                  return !(selectedWebhook && selectedWebhook.url);
                })()
              }
              onClick={handleSendToDiscord}
              className={`flex h-10.5 min-w-25 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white ${
                isSending ||
                !selectedWebhookId ||
                (() => {
                  const selectedWebhook = webhooks
                    .map((webhookStr) => JSON.parse(webhookStr) as WebhookEntry)
                    .find((w) => w.id === selectedWebhookId);
                  return !(selectedWebhook && selectedWebhook.url);
                })()
                  ? "cursor-not-allowed bg-neutral-400 opacity-70 dark:bg-neutral-700"
                  : "cursor-pointer bg-(--tyrestats-blue) hover:bg-(--tyrestats-blue)/90"
              } `}
            >
              {isSending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
          {/* Show warning if selected webhook has no URL */}
          {(() => {
            const selectedWebhook = webhooks
              .map((webhookStr) => JSON.parse(webhookStr) as WebhookEntry)
              .find((w) => w.id === selectedWebhookId);
            if (selectedWebhook && !selectedWebhook.url) {
              return (
                <div className="flex items-center gap-1 pl-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  <span>Selected webhook has no URL configured.</span>
                </div>
              );
            }
            return null;
          })()}
          <p className="pl-1 text-xs text-neutral-500">
            Posts a summary of tyre wear and race strategy to your Discord
            channel. Add webhooks in the Settings & Webhooks tab.
          </p>
          <label className="flex cursor-pointer items-center gap-2 pl-1">
            <input
              type="checkbox"
              checked={includeShortLink}
              onChange={() => setIncludeShortLink(!includeShortLink)}
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Include Short Link
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
