import { TyreWearData } from "@/app/types/TyTypes";
import { Upload, X, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect } from "react";

interface TyreWearManagerProps {
  tyreType: "soft" | "medium" | "hard" | "wet";
  onClose: () => void;
  onSave: (data: TyreWearData) => void;
}

export default function TyreWearManager({
  tyreType,
  onClose,
  onSave,
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
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-10">
      {/* options page */}
      {currentPage == "options" && (
        <div className="w-3/5 h-3/4 p-4 rounded-xl bg-neutral-900 flex flex-col gap-2">
          <div className="flex flex-row-reverse items-center w-full h-1/20">
            <button onClick={onClose}>
              <X className="cursor-pointer" />
            </button>
          </div>
          <hr className="border-neutral-700" />
          <h4 className=" font-semibold text-2xl text-center">
            Add Tyre Data for {readableTyreType[tyreType]} Tyres
          </h4>
          <div className="flex flex-row items-center justify-center gap-4 h-8/10">
            <button onClick={() => setCurrentPage("screenshot")}>
              <div className="border rounded-4xl p-2 px-4 border-neutral-700 cursor-pointer hover:bg-neutral-800 transition">
                Extract from Screenshot
              </div>
            </button>
            or
            <button onClick={() => setCurrentPage("manual")}>
              <div className="border rounded-4xl p-2 px-4 border-neutral-700 cursor-pointer hover:bg-neutral-800 transition">
                Add Percentage Manually
              </div>
            </button>
          </div>
        </div>
      )}
      {/* screenshot extraction page */}
      {currentPage == "screenshot" && (
        <div className="w-3/5 h-3/4 p-4 rounded-xl bg-neutral-900 flex flex-col gap-2">
          <div className="flex flex-row-reverse items-center w-full h-1/20">
            <button onClick={onClose}>
              <X className="cursor-pointer" />
            </button>
          </div>
          <hr className="border-neutral-700" />
          <label
            htmlFor="file-upload"
            className="border-3 border-dashed w-full h-19/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-800/50 transition"
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
            <p className="text-center mt-2 ">
              or drag and drop, or ctrl+v to paste an image
            </p>
            <p className="text-center mt-2 ">
              Supported formats: PNG, JPG
            </p>
          </label>
        </div>
      )}

      {/* analysis page */}
      {currentPage == "analysis" && imageSrc && (
        <div className="w-4/5 h-5/6 p-4 rounded-xl bg-neutral-900 flex flex-col gap-2">
          <div className="flex flex-row justify-between items-center w-full h-1/20">
            <h3 className=" font-semibold text-lg">
              {points.length === 0 && "Step 1: Click the TOP of the tyre bar"}
              {points.length === 1 &&
                "Step 2: Click the BOTTOM of the tyre bar"}
              {points.length === 2 &&
                "Step 3: Click the TOP EDGE of the green zone"}
              {points.length === 3 && "Step 4: Enter Laps Driven"}
            </h3>
            <button onClick={onClose}>
              <X className="cursor-pointer" />
            </button>
          </div>
          <hr className="border-neutral-700" />

          <div className="flex flex-row h-full gap-4 min-h-0">
            {/* Image Area */}
            <div className="flex-1 bg-neutral-950 rounded-lg overflow-auto flex items-center justify-center p-4 border border-neutral-800 relative">
              <div
                className="relative inline-block cursor-crosshair"
                onClick={handleImageClick}
              >
                {/* eslint-disable-next-line @next/next/no-img-element*/}
                <img
                  src={imageSrc}
                  alt="Analysis"
                  className="object-contain block transition-all duration-200 ease-in-out"
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
                    className="absolute w-4 h-4 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 shadow-lg pointer-events-none"
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
              <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-neutral-900/90 p-2 rounded-lg border border-neutral-700 shadow-xl backdrop-blur-sm z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom((z) => Math.max(1, z - 0.5));
                  }}
                  className="p-1 hover:bg-neutral-700 rounded  disabled:opacity-50"
                  title="Zoom Out"
                  disabled={zoom <= 1}
                >
                  <ZoomOut size={20} />
                </button>
                <span className=" text-sm font-mono min-w-[3ch] text-center">
                  {zoom}x
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom((z) => Math.min(5, z + 0.5));
                  }}
                  className="p-1 hover:bg-neutral-700 rounded  disabled:opacity-50"
                  title="Zoom In"
                  disabled={zoom >= 5}
                >
                  <ZoomIn size={20} />
                </button>
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="w-64 flex flex-col gap-4 shrink-0">
              <div className="bg-neutral-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 ">Points</h4>
                <ul className="text-sm space-y-2 ">
                  <li
                    className={
                      points.length > 0 ? "text-red-400 font-bold" : ""
                    }
                  >
                    1. Top (Red): {points[0] ? "Set" : "Waiting..."}
                  </li>
                  <li
                    className={
                      points.length > 1 ? "text-blue-400 font-bold" : ""
                    }
                  >
                    2. Bottom (Blue): {points[1] ? "Set" : "Waiting..."}
                  </li>
                  <li
                    className={
                      points.length > 2 ? "text-green-400 font-bold" : ""
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
                  className="mt-4 text-xs  underline hover:"
                >
                  Reset Points
                </button>
              </div>

              {points.length === 3 && (
                <div className="bg-neutral-800 p-4 rounded-lg flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4">
                  <label className="text-sm ">Laps Driven</label>
                  <input
                    type="number"
                    value={laps}
                    onChange={(e) => setLaps(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 rounded p-2  focus:outline-none focus:border-white"
                    placeholder="e.g. 12"
                  />

                  {calculatedWear !== null && (
                    <>
                      <div className="mt-4 p-3 bg-neutral-900 rounded border border-neutral-700">
                        <p className="text-xs  uppercase tracking-wider">
                          Remaining Life
                        </p>
                        <p className="text-3xl font-bold ">
                          {calculatedWear.toFixed(1)}%
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-neutral-900 rounded border border-neutral-700">
                        <p className="text-xs  uppercase tracking-wider">
                          wear per lap
                        </p>
                        <p className="text-3xl font-bold ">
                          {CalculateAverageWearPerLap(
                            100 - calculatedWear,
                            parseFloat(laps) || 0,
                          ).toFixed(2)}
                          %
                        </p>
                      </div>
                    </>
                  )}
                  <button
                    onClick={handleSave}
                    className="mt-4 bg-white text-black font-bold py-2 rounded cursor-pointer hover:bg-neutral-200 transition"
                  >
                    Save Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* manual percentage & laps page */}
      {currentPage == "manual" && (
        <div className="w-3/5 h-3/4 p-4 rounded-xl bg-neutral-900 flex flex-col gap-2">
          <div className="flex flex-row-reverse items-center w-full h-1/20">
            <button onClick={onClose}>
              <X className="cursor-pointer" />
            </button>
          </div>
          <hr className="border-neutral-700" />
          <h4 className=" font-semibold text-2xl text-center">
            Manual Tyre Data
          </h4>
          <div className="flex flex-row items-center justify-center gap-4 h-8/10">
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
              className="w-48 bg-neutral-800 rounded-md p-2 px-4  focus:outline-none focus:ring-2 focus:ring-neutral-600"
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
              className="w-48 bg-neutral-800 rounded-md p-2 px-4  focus:outline-none focus:ring-2 focus:ring-neutral-600"
            />
          </div>
          {calculatedWear !== null && (
            <div className="w-1/2 flex flex-col mx-auto mt-4 mb-6">
              <div className="mt-4 p-3 bg-neutral-900 rounded border border-neutral-700">
                <p className="text-xs  uppercase tracking-wider">
                  Remaining Life
                </p>
                <p className="text-3xl font-bold ">
                  {calculatedWear.toFixed(1)}%
                </p>
              </div>
              <div className="mt-4 p-3 bg-neutral-900 rounded border border-neutral-700">
                <p className="text-xs  uppercase tracking-wider">
                  wear per lap
                </p>
                <p className="text-3xl font-bold ">
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
            <button
              onClick={handleSave}
              className="bg-white text-black font-bold py-2 px-4 rounded cursor-pointer hover:bg-neutral-200 transition"
            >
              Save Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
