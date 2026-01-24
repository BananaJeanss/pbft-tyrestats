"use client";

import { Search, ChevronDown } from "lucide-react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type IconName = (typeof iconNames)[number];

interface IconSelectorProps {
  value: IconName | string;
  onChange: (iconName: IconName) => void;
  placeholder?: string;
  className?: string;
  maxIcons?: number;
}

export default function IconSelector({
  value,
  onChange,
  placeholder = "Search icons...",
  className = "",
  maxIcons = 50,
}: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter and prepare icons
  const filteredIcons = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();

    const icons = searchLower
      ? iconNames.filter(
          (name) =>
            name.toLowerCase().includes(searchLower) ||
            name.replace(/-/g, " ").includes(searchLower) ||
            name.replace(/-/g, "").includes(searchLower),
        )
      : iconNames;

    return icons.slice(0, maxIcons);
  }, [searchTerm, maxIcons]);

  // Get selected icon display name
  const selectedIconDisplay = useMemo(() => {
    if (!value || !iconNames.includes(value as IconName)) return null;
    return (value as string).replace(/-/g, " ");
  }, [value]);

  const handleSelect = useCallback(
    (iconName: IconName) => {
      onChange(iconName);
      setIsOpen(false);
      setSearchTerm("");
    },
    [onChange],
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded border border-neutral-700 bg-zinc-200 p-2 transition-colors focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
        type="button"
      >
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          {value ? (
            <>
              <div className="shrink-0">
                <DynamicIcon name={value as IconName} size={20} />
              </div>
              <span className="min-w-0 truncate capitalize">
                {selectedIconDisplay}
              </span>
            </>
          ) : (
            <span className="text-neutral-500">Select an icon</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-neutral-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 flex w-70 flex-col gap-2 rounded-xl border border-neutral-700 bg-zinc-100 p-2 shadow-2xl sm:w-[320px] dark:bg-neutral-900">
          {/* Search */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 pl-9 text-sm focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              autoFocus
            />
          </div>

          {/* Icons Grid */}
          <div className="custom-scrollbar grid max-h-75 grid-cols-5 gap-1 overflow-y-auto pr-1 md:grid-cols-8">
            {filteredIcons.length === 0 ? (
              <div className="col-span-full py-4 text-center text-sm text-neutral-500">
                No icons found
              </div>
            ) : (
              filteredIcons.map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => handleSelect(iconName)}
                  title={iconName.replace(/-/g, " ")}
                  className={`flex aspect-square items-center justify-center rounded transition-colors hover:bg-zinc-300 dark:hover:bg-neutral-700 ${
                    value === iconName
                      ? "bg-neutral-300 text-black dark:bg-neutral-700 dark:text-white"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                  type="button"
                >
                  <DynamicIcon name={iconName} size={20} />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
