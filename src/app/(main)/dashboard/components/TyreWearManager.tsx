import { TyreWearData } from "@/app/types/TyTypes";
import {
  Edit3Icon,
  LucideImage,
  Trash2,
  Undo2Icon,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState, useEffect } from "react";

interface TyreWearManagerProps {
  tyreType?: "soft" | "medium" | "hard" | "wet";
  ClearTyreData?: () => void;
  doesAlreadyHaveData: boolean;
  onClose: () => void;
  onSave?: (data: TyreWearData) => void;
  calculatorMode?: boolean; // just for quick tools
}

interface ConfirmClearTyreDataProps {
  whichTyre: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function confirmClearTyreData({
  whichTyre,
  onConfirm,
  onCancel,
}: ConfirmClearTyreDataProps) {
  return (
    <div className="absolute top-0 left-0 z-100 flex h-full w-full items-center justify-center bg-neutral-950/95">
      <div className="flex w-96 flex-col gap-4 rounded-xl bg-zinc-100 p-6 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Confirm Clear Tyre Data</h3>
        <hr className="border-neutral-700" />
        <p>
          Are you sure you want to clear the tyre data for the {whichTyre} tyre?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-md bg-neutral-300 px-4 py-2 font-bold text-black transition hover:bg-neutral-400 dark:bg-neutral-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer rounded-md bg-red-500 px-4 py-2 font-bold text-white transition hover:bg-red-800"
          >
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TyreWearManager({
  tyreType = "soft",
  ClearTyreData = () => {},
  doesAlreadyHaveData,
  onClose,
  onSave = () => {},
  calculatorMode = false,
}: TyreWearManagerProps) {
  const [currentPage, setCurrentPage] = useState<
    "options" | "screenshot" | "manual" | "analysis"
  >("options");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [laps, setLaps] = useState<string>("");
  const [calculatedWear, setCalculatedWear] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  const [manualWear, setManualWear] = useState<string>("");
  const [manualLaps, setManualLaps] = useState<string>("");

  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const readableTyreType = {
    soft: "Soft",
    medium: "Medium",
    hard: "Hard",
    wet: "Wet",
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImageSrc(ev.target.result as string);
          setCurrentPage("analysis");
          setPoints([]);
          setCalculatedWear(null);
          setLaps("");
          setZoom(1);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (points.length >= 3) return;

    // Get coordinates relative to the image container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Store normalized coordinates (0 to 1) so they work at any zoom level
    const newPoints = [...points, { x: x / rect.width, y: y / rect.height }];
    setPoints(newPoints);

    if (newPoints.length === 3) {
      calculateWear(newPoints);
    }
  };

  const calculateWear = (currentPoints: { x: number; y: number }[]) => {
    const topY = currentPoints[0].y;
    const bottomY = currentPoints[1].y;
    const currentY = currentPoints[2].y;

    // Calculate total height (Bottom - Top)
    // Works with normalized coordinates just as well (ratios are preserved)
    const totalHeight = Math.abs(bottomY - topY);

    // Calculate remaining/green height (Bottom - Current Level)
    const greenHeight = Math.abs(bottomY - currentY);

    let percentage = (greenHeight / totalHeight) * 100;

    // Clamp percentage between 0 and 100
    percentage = Math.min(100, Math.max(0, percentage));

    setCalculatedWear(percentage);
  };

  const CalculateAverageWearPerLap = (wear: number, lapsDriven: number) => {
    if (lapsDriven === 0) return 0;
    return parseFloat((wear / lapsDriven).toFixed(2));
  };

  const handleSave = () => {
    if (calculatedWear === null) return;

    const lapsValue =
      currentPage === "manual" ? parseFloat(manualLaps) : parseFloat(laps);
    const validLaps = isNaN(lapsValue) ? 0 : lapsValue;
    const wearPerLap = CalculateAverageWearPerLap(
      100 - calculatedWear,
      validLaps,
    );

    onSave({
      remainingLife: calculatedWear,
      lapsDriven: validLaps,
      wearPerLap: wearPerLap,
    });
  };

  // ctrl-v detector for image paste
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        navigator.clipboard.read().then((items) => {
          items.forEach((item) => {
            // Try common image formats
            const imageTypes = item.types.filter((type) =>
              type.startsWith("image/"),
            );
            if (imageTypes.length > 0) {
              item
                .getType(imageTypes[0])
                .then((blob) => {
                  if (blob) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        setImageSrc(ev.target.result as string);
                        setCurrentPage("analysis");
                        setPoints([]);
                        setCalculatedWear(null);
                        setLaps("");
                        setZoom(1);
                      }
                    };
                    reader.readAsDataURL(blob);
                  }
                })
                .catch(() => {
                  // Not an image, ignore
                  return;
                });
            }
          });
        });
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <>
      {showClearConfirm &&
        confirmClearTyreData({
          whichTyre: readableTyreType[tyreType],
          onConfirm: () => {
            ClearTyreData();
            setShowClearConfirm(false);
            onClose();
          },
          onCancel: () => {
            setShowClearConfirm(false);
          },
        })}
      <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
        {/* options page */}
        {currentPage == "options" && (
          <div className="flex h-3/4 w-3/5 flex-col gap-2 rounded-xl bg-zinc-100 p-4 dark:bg-neutral-900">
            <div className="flex h-1/20 w-full flex-row items-center">
              <h4 className="grow text-2xl font-semibold">
                {calculatorMode
                  ? "Tyre Wear Calculator"
                  : `Add Tyre Data for ${readableTyreType[tyreType]} Tyres`}
              </h4>
              <button onClick={onClose}>
                <X className="cursor-pointer" />
              </button>
            </div>
            <hr className="border-neutral-700" />
            <div className="flex grow flex-row items-center justify-center gap-4">
              <button
                className="flex aspect-square max-h-1/2 cursor-pointer flex-col items-center rounded-4xl border border-neutral-700 p-4 px-4 transition hover:bg-zinc-300 dark:hover:bg-neutral-800"
                onClick={() => setCurrentPage("screenshot")}
              >
                <LucideImage className="p-1/4 h-1/2 w-1/2" />
                <hr className="my-2 w-full border-neutral-700" />
                <span>Extract from Screenshot</span>
                <p className="text-sm font-extralight opacity-80">
                  Upload an screenshot, click to set the 3 points, and enter
                  laps driven.
                </p>
              </button>
              <p className="text-bold text-xl">or</p>
              <button
                className="flex aspect-square max-h-1/2 cursor-pointer flex-col items-center rounded-4xl border border-neutral-700 p-4 px-4 transition hover:bg-zinc-300 dark:hover:bg-neutral-800"
                onClick={() => setCurrentPage("manual")}
              >
                <Edit3Icon className="p-1/4 h-1/2 w-1/2" />
                <hr className="my-2 w-full border-neutral-700" />
                <span>Add Percentage Manually</span>
                <p className="text-sm font-extralight opacity-80">
                  Add the remaining tyre life percentage and laps driven
                  manually.
                </p>
              </button>
            </div>
            {doesAlreadyHaveData && (
              <div className="flex h-1/10 w-full items-center justify-start">
                <button
                  className="flex cursor-pointer items-center rounded-md px-4 py-2 font-bold text-red-500 transition hover:bg-red-500/10"
                  onClick={() => setShowClearConfirm(true)}
                >
                  <Trash2 className="mr-2 inline" /> Clear Tyre Data
                </button>
              </div>
            )}
          </div>
        )}
        {/* screenshot extraction page */}
        {currentPage == "screenshot" && (
          <div className="flex h-3/4 w-3/5 flex-col gap-2 rounded-xl bg-zinc-100 p-4 dark:bg-neutral-900">
            <div className="flex h-1/20 w-full flex-row-reverse items-center">
              <button onClick={onClose}>
                <X className="cursor-pointer" />
              </button>
              <button onClick={() => setCurrentPage("options")}>
                <Undo2Icon className="mr-2 cursor-pointer" />
              </button>
            </div>
            <hr className="border-neutral-700" />
            <label
              htmlFor="file-upload"
              className="flex h-19/20 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-3 border-dashed transition hover:bg-neutral-800/50"
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Upload className="mb-4" />
              <p className="text-center">Click to upload a screenshot</p>
              <p className="mt-2 text-center">
                or drag and drop, or ctrl+v to paste an image
              </p>
              <p className="mt-2 text-center">Supported formats: PNG, JPG</p>
            </label>
          </div>
        )}

        {/* analysis page */}
        {currentPage == "analysis" && imageSrc && (
          <div className="flex h-5/6 w-4/5 flex-col gap-2 rounded-xl bg-zinc-100 p-4 dark:bg-neutral-900">
            <div className="flex h-1/20 w-full flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">
                {points.length === 0 && "Step 1: Click the TOP of the tyre bar"}
                {points.length === 1 &&
                  "Step 2: Click the BOTTOM of the tyre bar"}
                {points.length === 2 &&
                  "Step 3: Click the TOP EDGE of the green zone"}
                {points.length === 3 && "Step 4: Enter Laps Driven"}
              </h3>
              <div>
                <button onClick={() => setCurrentPage("options")}>
                  <Undo2Icon className="mr-2 cursor-pointer" />
                </button>
                <button onClick={onClose}>
                  <X className="cursor-pointer" />
                </button>
              </div>
            </div>
            <hr className="border-neutral-700" />

            <div className="flex h-full min-h-0 flex-row gap-4">
              {/* Image Area */}
              <div className="relative flex flex-1 items-center justify-center overflow-auto rounded-lg border border-neutral-800 bg-zinc-100 p-4 dark:bg-neutral-950">
                <div
                  className="relative inline-block cursor-crosshair"
                  onClick={handleImageClick}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element*/}
                  <img
                    src={imageSrc}
                    alt="Analysis"
                    className="block object-contain transition-all duration-200 ease-in-out"
                    draggable={false}
                    style={{
                      width: zoom === 1 ? "auto" : `${zoom * 100}%`,
                      maxHeight: zoom === 1 ? "60vh" : "none",
                      maxWidth: "none",
                    }}
                  />
                  {points.map((p, i) => (
                    <div
                      key={i}
                      className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-white shadow-lg"
                      style={{
                        // Use percentages for positioning so points stay correct when zooming
                        left: `${p.x * 100}%`,
                        top: `${p.y * 100}%`,
                        backgroundColor:
                          i === 0 ? "#ef4444" : i === 1 ? "#3b82f6" : "#22c55e",
                      }}
                    />
                  ))}
                </div>

                {/* Zoom Controls Overlay */}
                <div className="absolute right-6 bottom-6 z-20 flex items-center gap-2 rounded-lg border border-neutral-700 bg-zinc-100/90 p-2 shadow-xl backdrop-blur-sm dark:bg-neutral-900/90">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoom((z) => Math.max(1, z - 0.5));
                    }}
                    className="rounded p-1 hover:bg-neutral-700 disabled:opacity-50"
                    title="Zoom Out"
                    disabled={zoom <= 1}
                  >
                    <ZoomOut size={20} />
                  </button>
                  <span className="min-w-[3ch] text-center font-mono text-sm">
                    {zoom}x
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoom((z) => Math.min(5, z + 0.5));
                    }}
                    className="rounded p-1 hover:bg-neutral-700 disabled:opacity-50"
                    title="Zoom In"
                    disabled={zoom >= 5}
                  >
                    <ZoomIn size={20} />
                  </button>
                </div>
              </div>

              {/* Sidebar Controls */}
              <div className="flex w-64 shrink-0 flex-col gap-4">
                <div className="rounded-lg bg-zinc-200 p-4 dark:bg-neutral-800">
                  <h4 className="mb-2 font-semibold">Points</h4>
                  <ul className="space-y-2 text-sm">
                    <li
                      className={
                        points.length > 0 ? "font-bold text-red-400" : ""
                      }
                    >
                      1. Top (Red): {points[0] ? "Set" : "Waiting..."}
                    </li>
                    <li
                      className={
                        points.length > 1 ? "font-bold text-blue-400" : ""
                      }
                    >
                      2. Bottom (Blue): {points[1] ? "Set" : "Waiting..."}
                    </li>
                    <li
                      className={
                        points.length > 2 ? "font-bold text-green-400" : ""
                      }
                    >
                      3. Current (Green): {points[2] ? "Set" : "Waiting..."}
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      setPoints([]);
                      setCalculatedWear(null);
                    }}
                    className="hover: mt-4 text-xs underline"
                  >
                    Reset Points
                  </button>
                </div>

                {points.length === 3 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-2 rounded-lg bg-zinc-200 p-4 dark:bg-neutral-800">
                    <label className="text-sm">Laps Driven</label>
                    <input
                      type="number"
                      value={laps}
                      onChange={(e) => setLaps(e.target.value)}
                      className="rounded border border-neutral-700 bg-zinc-100 p-2 focus:border-white focus:outline-none dark:bg-neutral-900"
                      placeholder="e.g. 12"
                    />

                    {calculatedWear !== null && (
                      <>
                        <div className="mt-4 rounded border border-neutral-700 bg-zinc-100 p-3 dark:bg-neutral-900">
                          <p className="text-xs tracking-wider uppercase">
                            Remaining Life
                          </p>
                          <p className="text-3xl font-bold">
                            {calculatedWear.toFixed(1)}%
                          </p>
                        </div>
                        <div className="mt-4 rounded border border-neutral-700 bg-zinc-100 p-3 dark:bg-neutral-900">
                          <p className="text-xs tracking-wider uppercase">
                            wear per lap
                          </p>
                          <p className="text-3xl font-bold">
                            {CalculateAverageWearPerLap(
                              100 - calculatedWear,
                              parseFloat(laps) || 0,
                            ).toFixed(2)}
                            %
                          </p>
                        </div>
                      </>
                    )}
                    {!calculatorMode && (
                      <button
                        onClick={handleSave}
                        className="mt-4 cursor-pointer rounded bg-zinc-300 py-2 font-bold transition hover:bg-zinc-400 dark:bg-neutral-700 dark:hover:bg-neutral-200 dark:hover:text-black"
                      >
                        Save Data
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* manual percentage & laps page */}
        {currentPage == "manual" && (
          <div className="flex h-3/4 w-3/5 flex-col gap-2 rounded-xl bg-zinc-100 p-4 dark:bg-neutral-900">
            <div className="flex h-1/20 w-full flex-row items-center">
              <h4 className="grow text-2xl font-semibold">Manual Tyre Data</h4>
              <button onClick={() => setCurrentPage("options")}>
                <Undo2Icon className="mr-2 cursor-pointer" />
              </button>
              <button onClick={onClose}>
                <X className="cursor-pointer" />
              </button>
            </div>
            <hr className="border-neutral-700" />

            <div className="flex h-8/10 flex-row items-center justify-center gap-4">
              <input
                type="number"
                placeholder="Remaining Life (%)"
                min="0"
                max="100"
                value={manualWear}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;

                  if (val === "") {
                    setManualWear("");
                    setCalculatedWear(null);
                    return;
                  }

                  const num = parseFloat(val);
                  let finalVal = val;

                  if (num > 100) {
                    finalVal = "100";
                  } else if (num < 0) {
                    finalVal = "0";
                  }

                  setManualWear(finalVal);

                  setCalculatedWear(parseFloat(finalVal));
                }}
                className="w-48 rounded-md bg-zinc-200 p-2 px-4 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              />
              <p>and</p>
              <input
                type="number"
                placeholder="Laps Driven"
                min="0"
                value={manualLaps}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setManualLaps("");
                    return;
                  }
                  const num = parseFloat(val);
                  if (num < 0 || isNaN(num)) {
                    setManualLaps("0");
                  } else if (num > 200) {
                    setManualLaps("200");
                  } else {
                    setManualLaps(val);
                  }
                }}
                className="w-48 rounded-md bg-zinc-200 p-2 px-4 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              />
            </div>
            {calculatedWear !== null && (
              <div className="mx-auto mt-4 mb-6 flex w-1/2 flex-col">
                <div className="mt-4 rounded border border-neutral-700 bg-zinc-100 p-3 dark:bg-neutral-900">
                  <p className="text-xs tracking-wider uppercase">
                    Remaining Life
                  </p>
                  <p className="text-3xl font-bold">
                    {calculatedWear.toFixed(1)}%
                  </p>
                </div>
                <div className="mt-4 rounded border border-neutral-700 bg-zinc-100 p-3 dark:bg-neutral-900">
                  <p className="text-xs tracking-wider uppercase">
                    wear per lap
                  </p>
                  <p className="text-3xl font-bold">
                    {CalculateAverageWearPerLap(
                      100 - calculatedWear,
                      parseFloat(manualLaps) || 0,
                    ).toFixed(2)}
                    %
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-center">
              {!calculatorMode && (
                <button
                  onClick={handleSave}
                  className="cursor-pointer rounded bg-zinc-300 px-4 py-2 font-bold text-black transition hover:bg-zinc-400 dark:bg-white dark:hover:bg-neutral-200"
                >
                  Save Data
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
