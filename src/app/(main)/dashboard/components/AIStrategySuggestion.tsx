import { ExpectedRequest } from "@/app/types/AIRequest";
import { FullscreenIcon, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import AIStrategySettings from "./AIStrategySettings";
import { AIStrategySettingsS } from "./AIStrategySettings";
import FullscreenReader from "./FullscreenReader";
import BetterReactMD from "./BetterReactMD";

export interface AIStrategySuggestionProps {
  onSave: (suggestion: string) => void;
  onSaveConfig: (settings: AIStrategySettingsS) => void;
  existingSuggestion: string | null;
  notes?: string;
  readOnly?: boolean;
}

interface CombinedProps extends ExpectedRequest, AIStrategySuggestionProps {}

export default function AIStrategySuggestion({
  tyreData,
  raceConfig,
  tyrePreferences,
  onSave,
  existingSuggestion,
  notes,
  onSaveConfig,
  aiConfig,
  readOnly = false,
}: CombinedProps) {
  const [ratelimitCount, setRatelimitCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [AISettingsOpen, setAISettingsOpen] = useState(false);
  const [AISettings, setAISettings] = useState<AIStrategySettingsS>(
    aiConfig || {
      model: "qwen/qwen3-32b",
      temperature: 0.7,
      top_p: 1,
      useExperimentalPrompt: false,
    },
  );

  const [FullscreenReaderOpen, setFullscreenReaderOpen] = useState(false);

  const clientcallHCAI = async () => {
    if (readOnly) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tyreData,
          raceConfig,
          tyrePreferences,
          notes,
          aiConfig: AISettings,
        }),
      });

      if (!response.ok) {
        console.error("Error response:", response);
        throw new Error(
          response.status === 500
            ? "Service unavailable. Try Again Later"
            : `Server responded with status: ${response.status}`,
        );
      }

      const data = await response.json();
      setRatelimitCount(data.ratelimitCount);

      const cleanSuggestion = data.suggestion
        .replace(/\$\\to\$/g, "→")
        .replace(/\$\\times\$/g, "×")
        .replace(/\$\\rightarrow\$/g, "→")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?strong>/gi, "**")
        .replace(/•/g, "-");

      setGeneratedSuggestion(cleanSuggestion);
      onSave(cleanSuggestion);
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [generatedSuggestion, setGeneratedSuggestion] =
    useState(existingSuggestion);

  useEffect(() => {
    setGeneratedSuggestion(existingSuggestion);
  }, [existingSuggestion]);

  return (
    <>
      {AISettingsOpen && (
        <AIStrategySettings
          currentSettings={AISettings}
          onClose={(newSettings) => {
            setAISettingsOpen(false);
            setAISettings(newSettings);
            onSaveConfig(newSettings);
          }}
        />
      )}
      {FullscreenReaderOpen && (
        <FullscreenReader
          onClose={() => setFullscreenReaderOpen(false)}
          title="AI Strategy Suggestion"
          content={generatedSuggestion || "No suggestion generated yet."}
        />
      )}
      <div className="flex h-full w-5/7 flex-col gap-2 rounded-lg bg-zinc-200 p-4 dark:bg-neutral-900">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex flex-row items-center gap-2">
            <h3 className="text-lg font-bold">AI Strategy Overview</h3>
            {!isLoading ? (
              <div
                className={`${readOnly ? "hidden" : "flex flex-row items-center gap-2"}`}
              >
                <p>|</p>
                <button
                  disabled={readOnly}
                  className={`rounded font-light ${
                    readOnly ? "hidden" : "cursor-pointer underline"
                  }`}
                  onClick={clientcallHCAI}
                >
                  Generate Analysis{" "}
                  {ratelimitCount !== null
                    ? `(${ratelimitCount}/5 requests (24 hours))`
                    : ""}
                </button>
              </div>
            ) : (
              <button className="cursor-not-allowed font-light" disabled>
                Generating...
              </button>
            )}
          </div>
          <div className="flex flex-row items-center gap-4">
            <FullscreenIcon
              className="cursor-pointer"
              onClick={() => setFullscreenReaderOpen(true)}
            />
            {!readOnly && (
              <Settings
                className="cursor-pointer"
                onClick={() => {
                  setAISettingsOpen(true);
                }}
              />
            )}
          </div>
        </div>
        <hr className="border-neutral-700" />

        {isLoading && (
          <p className="font-extralight">Generating suggestion...</p>
        )}
        {error && !isLoading && (
          <p className="text-sm font-light text-red-400">{error}</p>
        )}
        {!generatedSuggestion && !isLoading && !error && (
          <p className="font-extralight">No suggestion generated yet.</p>
        )}
        {generatedSuggestion && !isLoading && (
          <div className="wrap-break-words flex-1 overflow-y-auto pr-2 text-sm leading-relaxed">
            <BetterReactMD content={generatedSuggestion} />
          </div>
        )}
      </div>
    </>
  );
}
