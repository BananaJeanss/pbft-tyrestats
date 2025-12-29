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
import { useState } from "react";
import { getEffectiveTyreData } from "../TyreMath";
import { DEFAULT_PREFERENCES } from "./TyreSettings";

export interface DashShareProps {
  onClose: () => void;
  SessionData: TySession;
}

// Map tyre IDs to Discord-friendly Emojis and Colors
const TYRE_DISPLAY_MAP: Record<string, { emoji: string; label: string }> = {
  soft: { emoji: "🟥", label: "Soft" },
  medium: { emoji: "🟨", label: "Medium" },
  hard: { emoji: "⬜", label: "Hard" },
  wet: { emoji: "🟦", label: "Wet" },
};

const TYRE_ORDER = ["soft", "medium", "hard", "wet"];

export default function DashShare({ onClose, SessionData }: DashShareProps) {
  const [copiedType, setCopiedType] = useState<"static" | "short" | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [shortUrl, setShortUrl] = useState<string>(SessionData.shortUrl || "");
  const [includeShortLink, setIncludeShortLink] = useState<boolean>(false);

  const handleCopy = (text: string, type: "static" | "short") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // 3. SEND TO DISCORD (Formatted like TyresView)
  const handleSendToDiscord = async () => {
    if (!webhookUrl) return;
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
          SessionData.tyreData,
          mergedPrefs
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
              2
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
        username: "TyreStats",
        avatar_url:
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

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 204) {
        setSendStatus("success");
        setWebhookUrl("");
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

  const handleShortUrlGenerated = (newShortUrl: string) => {
    setShortUrl(newShortUrl);
    handleCopy(newShortUrl, "short");
  };

  const handleShortUrlGeneration = async () => {
    setIsSending(true);
    // send data to api to generate short link
    fetch("/api/short", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        sessionData: JSON.stringify(SessionData),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.finalizedUrl) {
          handleShortUrlGenerated(data.finalizedUrl);
        } else {
          console.error("Error generating short link: No URL returned");
        }
      })
      .catch((err) => {
        console.error("Error generating short link:", err);
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
      <div className="w-full max-w-lg bg-zinc-100 dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <LinkIcon size={20} /> Share Session
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            <X size={20} />
          </button>
        </div>

        <hr className="border-neutral-800" />

        {/* i waas gonna add an option to generate a static link but its too long */}

        {/* Short URL Section */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex justify-between">
            <span>Short Link</span>
          </label>
          <div className="flex items-center gap-2 relative">
            <input
              type="text"
              readOnly
              value={shortUrl || "Shortened URL not generated"}
              className={`flex-grow p-2.5 pr-10 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-zinc-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 ${
                !shortUrl &&
                "italic text-neutral-400 opacity-60 cursor-not-allowed"
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
              className={`
                h-[42px] px-4 rounded-lg flex items-center justify-center gap-2 font-medium text-sm text-white min-w-[100px]
                ${
                  isSending
                    ? "bg-neutral-400 dark:bg-neutral-700 cursor-not-allowed opacity-70"
                    : shortUrl
                      ? "bg-[var(--tyrestats-blue)] hover:bg-[var(--tyrestats-blue)]/90 cursor-pointer"
                      : "bg-[var(--tyrestats-blue)] hover:bg-[var(--tyrestats-blue)]/90 cursor-pointer"
                }
              `}
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
                className="underline cursor-pointer text-sm opacity-70 text-left"
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
        </div>

        <hr className="border-neutral-800/50" />

        {/* Discord Section */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
            Send to Discord
            {sendStatus === "error" && (
              <span className="text-xs text-red-500 font-normal flex items-center gap-1">
                <AlertCircle size={12} /> Failed (Check URL)
              </span>
            )}
            {sendStatus === "success" && (
              <span className="text-xs text-green-500 font-normal flex items-center gap-1">
                <Check size={12} /> Sent!
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => {
                setWebhookUrl(e.target.value);
                setSendStatus("idle");
              }}
              className="flex-grow p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            />
            <button
              disabled={isSending || !webhookUrl}
              onClick={handleSendToDiscord}
              className={`
                h-[42px] px-4 rounded-lg flex items-center justify-center gap-2 font-medium text-sm text-white min-w-[100px]
                ${
                  isSending || !webhookUrl
                    ? "bg-neutral-400 dark:bg-neutral-700 cursor-not-allowed opacity-70"
                    : "bg-[var(--tyrestats-blue)] hover:bg-[var(--tyrestats-blue)]/90 cursor-pointer"
                }
              `}
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
          <p className="text-[10px] text-neutral-500 pl-1">
            Posts a summary of tyre wear and race strategy to your Discord
            channel.
          </p>
          <label className="flex items-center gap-2 pl-1 cursor-pointer">
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
