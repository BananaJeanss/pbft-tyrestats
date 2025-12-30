import { ExpectedRequest } from "@/app/api/ai/route";
import { Settings } from "lucide-react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import AIStrategySettings from "./AIStrategySettings";
import { AIStrategySettingsS } from "./AIStrategySettings";

export interface AIStrategySuggestionProps {
  onSave: (suggestion: string) => void;
  onSaveConfig: (settings: AIStrategySettingsS) => void;
  existingSuggestion: string | null;
  notes?: string;
  readOnly?: boolean;
}

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
}: ExpectedRequest & AIStrategySuggestionProps) {
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
      <div className="bg-zinc-200 dark:bg-neutral-900 rounded-lg p-4 w-5/7 h-full flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2 justify-between">
          <div className="flex flex-row items-center gap-2">
            <h3 className="text-lg font-bold">AI Strategy Overview</h3>
            {!isLoading ? (
              <div
                className={`${readOnly ? "hidden" : "flex flex-row gap-2 items-center"}`}
              >
                <p>|</p>
                <button
                  disabled={readOnly}
                  className={`font-light rounded ${
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
              <button className=" font-light cursor-not-allowed" disabled>
                Generating...
              </button>
            )}
          </div>
          {!readOnly && (
            <Settings
              className="cursor-pointer"
              onClick={() => {
                setAISettingsOpen(true);
              }}
            />
          )}
        </div>
        <hr className="border-neutral-700" />

        {isLoading && (
          <p className=" font-extralight ">Generating suggestion...</p>
        )}
        {error && !isLoading && (
          <p className="text-red-400 font-light text-sm">{error}</p>
        )}
        {!generatedSuggestion && !isLoading && !error && (
          <p className=" font-extralight ">No suggestion generated yet.</p>
        )}
        {generatedSuggestion && !isLoading && (
          <div className=" leading-relaxed overflow-y-auto flex-1 text-sm wrap-break-words pr-2">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-xl font-bold  mt-4 mb-2" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-lg font-bold  mt-4 mb-2" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-base font-bold  mt-3 mb-1" {...props} />
                ),
                p: ({ ...props }) => <p className="mb-2" {...props} />,
                ul: ({ ...props }) => (
                  <ul
                    className="list-disc list-inside mb-2 ml-2 space-y-1"
                    {...props}
                  />
                ),
                li: ({ ...props }) => <li className="pl-1" {...props} />,
                hr: ({ ...props }) => (
                  <hr className="border-neutral-700 my-4" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-semibold " {...props} />
                ),
              }}
            >
              {generatedSuggestion}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </>
  );
}
