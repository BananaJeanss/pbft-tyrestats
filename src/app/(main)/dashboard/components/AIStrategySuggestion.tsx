import { ExpectedRequest } from "@/app/api/ai/route";
import { useState } from "react";

export interface AIStrategySuggestionProps {
  onSave: (suggestion: string) => void;
  existingSuggestion: string | null;
}

export default function AIStrategySuggestion({
  tyreData,
  raceConfig,
  tyrePreferences,
  onSave,
  existingSuggestion,
}: ExpectedRequest & AIStrategySuggestionProps) {
  const [ratelimitCount, setRatelimitCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientcallHCAI = async () => {
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
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 500
            ? "Service unavailable. Try Again Later"
            : `Server responded with status: ${response.status}`
        );
      }

      const data = await response.json();
      setRatelimitCount(data.ratelimitCount);
      setGeneratedSuggestion(data.suggestion);
      onSave(data.suggestion);
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [generatedSuggestion, setGeneratedSuggestion] =
    useState(existingSuggestion);

  return (
    <div className="bg-neutral-900 rounded-lg p-4 w-5/7 h-full flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <h3 className="text-lg font-bold">AI Strategy Overview</h3>
        <p className="text-neutral-500">|</p>
        {!isLoading ? (
          <button
            className="text-white font-light cursor-pointer underline rounded"
            onClick={clientcallHCAI}
          >
            Generate Analysis{" "}
            {ratelimitCount !== null
              ? `(${ratelimitCount}/5 requests (24 hours))`
              : ""}
          </button>
        ) : (
          <button
            className="text-neutral-500 font-light cursor-not-allowed"
            disabled
          >
            Generating...
          </button>
        )}
      </div>

      {isLoading && (
        <p className="text-neutral-500 font-extralight ">
          Generating suggestion...
        </p>
      )}
      {error && !isLoading && (
        <p className="text-red-400 font-light text-sm">{error}</p>
      )}
      {!generatedSuggestion && !isLoading && !error && (
        <p className="text-neutral-500 font-extralight ">
          No suggestion generated yet.
        </p>
      )}
      {generatedSuggestion && !isLoading && (
        <p className="text-neutral-300 font-light whitespace-pre-wrap">
          {generatedSuggestion}
        </p>
      )}
    </div>
  );
}
