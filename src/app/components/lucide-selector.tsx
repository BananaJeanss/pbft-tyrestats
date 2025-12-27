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
        className="w-full flex items-center justify-between bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-neutral-600 transition-colors"
        type="button"
      >
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          {value ? (
            <>
              <div className="shrink-0">
                <DynamicIcon name={value as IconName} size={20} />
              </div>
              <span className="capitalize truncate min-w-0">
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
        <div className="absolute z-50 mt-1 left-0 w-[280px] sm:w-[320px] bg-zinc-100 dark:bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-2 flex flex-col gap-2">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
              autoFocus
            />
          </div>

          {/* Icons Grid */}
          <div className="grid grid-cols-5 md:grid-cols-8 gap-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredIcons.length === 0 ? (
              <div className="col-span-full text-center text-neutral-500 py-4 text-sm">
                No icons found
              </div>
            ) : (
              filteredIcons.map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => handleSelect(iconName)}
                  title={iconName.replace(/-/g, " ")}
                  className={`aspect-square flex items-center justify-center rounded transition-colors hover:bg-zinc-300 dark:hover:bg-neutral-700 ${
                    value === iconName
                      ? "bg-neutral-300 dark:bg-neutral-700 text-black dark:text-white"
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
