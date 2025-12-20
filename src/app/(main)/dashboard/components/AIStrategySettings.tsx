import { X } from "lucide-react";
import { useEffect, useState } from "react";

export interface AIStrategySettingsProps {
  onClose: (settings: AIStrategySettingsS) => void;
  currentSettings: AIStrategySettingsS;
}

// great naming i know i know
export interface AIStrategySettingsS {
  model: string;
  temperature: number;
  top_p: number;
}

interface Model {
  id: string;
}

export default function AIStrategySettings({
  onClose,
  currentSettings,
}: AIStrategySettingsProps) {
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    currentSettings.model || "qwen/qwen3-32b"
  );

  const [selTemperature, setTemperature] = useState<number>(
    currentSettings.temperature || 0.7
  );
  const [selTopP, setTopP] = useState<number>(currentSettings.top_p || 1);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/ai/models")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.models) {
          setAvailableModels(data.models);
        }
      })
      .catch(() => isMounted && setAvailableModels([]));

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
      <div className="w-full max-w-md bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">AI Configuratiobn</h2>
          <button
            onClick={() =>
              onClose({
                model: selectedModel,
                temperature: selTemperature,
                top_p: selTopP,
              })
            }
            className="text-neutral-400 cursor-pointer"
          >
            <X />
          </button>
        </div>
        <hr className="border-neutral-800" />
        <div className="flex flex-col gap-4">
          <label className="text-md font-semibold text-neutral-300">
            Model
          </label>
          <select
            className="w-full bg-neutral-800 text-white p-2 rounded"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {availableModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id}
              </option>
            ))}
          </select>
          <label className="text-md font-semibold text-neutral-300">
            Temperature
          </label>
          <input
            type="number"
            className="w-full bg-neutral-800 text-white p-2 rounded"
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
          <label className="text-md font-semibold text-neutral-300">
            Top_P
          </label>
          <input
            type="number"
            className="w-full bg-neutral-800 text-white p-2 rounded"
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
        </div>
      </div>
    </div>
  );
}
