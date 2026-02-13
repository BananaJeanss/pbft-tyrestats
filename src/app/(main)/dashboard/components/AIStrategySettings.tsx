import { AIStrategySettingsS } from "@/app/types/TyTypes";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export interface AIStrategySettingsProps {
  onClose: (settings: AIStrategySettingsS) => void;
  currentSettings: AIStrategySettingsS;
}

interface Model {
  id: string;
  displayname: string;
}

export default function AIStrategySettings({
  onClose,
  currentSettings,
}: AIStrategySettingsProps) {
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    currentSettings.model || "qwen/qwen3-32b",
  );

  const [selTemperature, setTemperature] = useState<number>(
    currentSettings.temperature || 0.7,
  );
  const [selTopP, setTopP] = useState<number>(currentSettings.top_p || 1);

  const [experimentalP, setExperimentalP] = useState<boolean>(
    currentSettings.useExperimentalPrompt || false,
  );

  useEffect(() => {
    let isMounted = true;

    fetch("/api/ai/models")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.models) {
          setAvailableModels(data.models);
          const ids = data.models.map((m: Model) => m.id);
          if (!ids.includes(selectedModel)) {
            const defaultModel = ids.find((id: string) => id.includes("google/gemini-3"));
            setSelectedModel(defaultModel || ids[0] || "");
          }
        }
      })
      .catch(() => isMounted && setAvailableModels([]));

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">AI Configuratiobn</h2>
          <button
            onClick={() =>
              onClose({
                model: selectedModel,
                temperature: selTemperature,
                top_p: selTopP,
                useExperimentalPrompt: experimentalP,
              })
            }
            className="cursor-pointer"
          >
            <X />
          </button>
        </div>
        <hr className="border-neutral-800" />
        <div className="flex flex-col gap-4">
          <label className="text-md font-semibold">Model</label>
          <select
            className="w-full rounded bg-zinc-200 p-2 dark:bg-neutral-800"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {availableModels
              .slice()
              .sort((a, b) => a.displayname.localeCompare(b.displayname))
              .map((m: Model) => (
              <option key={m.id} value={m.id}>
                {m.displayname}
              </option>
              ))}
          </select>
          <label className="text-md font-semibold">Temperature</label>
          <input
            type="number"
            className="w-full rounded bg-zinc-200 p-2 dark:bg-neutral-800"
            value={selTemperature}
            min={0}
            max={2}
            step={0.1}
            onChange={(e) => {
              // validate input
              let val = parseFloat(e.target.value);
              if (isNaN(val)) val = 0.7;
              if (val < 0) val = 0;
              if (val > 2) val = 2;
              setTemperature(val);
            }}
          />
          <label className="text-md font-semibold">Top_P</label>
          <input
            type="number"
            className="w-full rounded bg-zinc-200 p-2 dark:bg-neutral-800"
            value={selTopP}
            min={0}
            max={1}
            step={0.01}
            onChange={(e) => {
              // validate input
              let val = parseFloat(e.target.value);
              if (isNaN(val)) val = 1;
              if (val < 0) val = 0;
              if (val > 1) val = 1;
              setTopP(val);
            }}
          />
          <div className="flex flex-row items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={experimentalP}
              onChange={(e) => setExperimentalP(e.target.checked)}
            />
            <span className="text-sm">Use Experimental Prompt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
