import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import DashSidebarSession from "./DashSidebarSession";
import NewSession from "./NewSession";
import { useMounted } from "@/hooks/useMounted";
import { TySession } from "@/app/types/TyTypes";
import {
  FolderPlus,
  ChevronRight,
  Database,
  Pencil,
  Loader2,
  Cloud,
  Filter,
} from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import NewFolder from "./NewFolder";
import EditFolder from "./EditFolder";
import { authClient } from "@/lib/auth-client";
import Fuse from "fuse.js";
import { Folder } from "@/app/types/TyTypes";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface DashSidebarProps {
  currentSessionId: string;
  onSelectSession: (session: TySession) => void;
  sessions: TySession[];
  isCloudLoading: boolean;
  onCreateSession: (session: TySession) => void;
  folders: (Folder & { source: "local" | "cloud" })[];
  onCreateFolder: (folder: Folder) => void;
}

export interface DashSidebarRef {
  openNewSessionAnyways: () => void;
  openNewFolderAnyways: () => void;
}

export type NewSessionNewFolderProps = {
  onCreateSessionClick: () => void;
  onCreateFolderClick: () => void;
};

export function NewSessionNewFolder({
  onCreateSessionClick,
  onCreateFolderClick,
}: NewSessionNewFolderProps) {
  return (
    <div className="flex flex-row gap-2">
      <button
        className="mb-4 grow cursor-pointer rounded border border-blue-800 bg-transparent px-4 py-2 transition-colors hover:bg-blue-100 dark:hover:bg-blue-950"
        onClick={onCreateSessionClick}
      >
        + New Session
      </button>
      <button
        className="mb-4 cursor-pointer rounded border border-blue-900 bg-transparent px-4 py-2 transition-colors hover:bg-blue-100 dark:hover:bg-blue-950"
        onClick={onCreateFolderClick}
      >
        <FolderPlus size={16} />
      </button>
    </div>
  );
}

const DashSidebar = forwardRef<DashSidebarRef, DashSidebarProps>(
  (
    {
      currentSessionId,
      onSelectSession,
      sessions,
      isCloudLoading,
      onCreateSession,
      folders,
      onCreateFolder,
    },
    ref,
  ) => {
    const [newSessionOpen, setNewSessionOpen] = useState(false);

    const mounted = useMounted();
    const [newFolderOpen, setNewFolderOpen] = useState(false);
    const [editFolderOpen, setEditFolderOpen] = useState<[boolean, string?]>([
      false,
      "",
    ]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState<{
      dateFrom: string;
      dateTo: string;
      name: string;
      lapsMin: number | undefined;
      lapsMax: number | undefined;
    }>({
      dateFrom: "",
      dateTo: "",
      name: "",
      lapsMin: undefined,
      lapsMax: undefined,
    });

    const [showSearchAnyways] = useLocalStorage<"always" | "never" | "auto">(
      "tyrestats-show-search-anyways",
      "auto",
    );

    const {
      data: session,
      isPending, // loading state
    } = authClient.useSession();

    useImperativeHandle(ref, () => ({
      openNewSessionAnyways: () => setNewSessionOpen(true),
      openNewFolderAnyways: () => setNewFolderOpen(true),
    }));

    // Derived state for convenience
    const localFolders = folders.filter((f) => f.source === "local");
    const cloudFolders = folders.filter((f) => f.source === "cloud");

    const fuse = useMemo(() => {
      return new Fuse(sessions, {
        keys: ["meta.name"],
        threshold: 0.3,
      });
    }, [sessions]);

    // sort by filterOptions
    // ts could prolly have better O complexity but i honestly cba good enough for now problem for another day
    const filterfarter = useMemo(() => {
      let baseSessions = sessions;
      if (filterOptions.name) {
        baseSessions = fuse.search(filterOptions.name).map((res) => res.item);
      }

      return baseSessions.filter((session) => {
        const { dateFrom, dateTo, lapsMin, lapsMax } = filterOptions;

        if (dateFrom && session.meta.date < dateFrom) return false;
        if (dateTo && session.meta.date > dateTo) return false;

        const laps = session.raceConfig.RaceLaps || 0;
        if (lapsMin !== undefined && laps < lapsMin) return false;
        if (lapsMax !== undefined && laps > lapsMax) return false;

        return true;
      });
    }, [sessions, filterOptions, fuse]);

    const activeFolderIds = useMemo(() => {
      const ids = new Set<string>();
      filterfarter.forEach((s) => {
        if (s.folder) ids.add(`${s.folder}-${s.source}`); // unique key approach
      });
      return ids;
    }, [filterfarter]);

    const checkIfFolderHasFilterMatchingSessions = (
      folderId: string,
      source: "local" | "cloud",
    ) => {
      const hasActiveFilters =
        filterOptions.dateFrom ||
        filterOptions.dateTo ||
        filterOptions.lapsMin !== undefined ||
        filterOptions.lapsMax !== undefined ||
        filterOptions.name;

      if (!hasActiveFilters) return true;

      return activeFolderIds.has(`${folderId}-${source}`);
    };

    if (!mounted) {
      return (
        <div className="flex h-full w-1/4 items-center justify-center overflow-y-auto rounded-lg bg-zinc-100 p-4 dark:bg-neutral-800">
          <Loader2 className="animate-spin" />
        </div>
      );
    }

    return (
      <>
        {newSessionOpen && (
          <NewSession
            onClose={() => setNewSessionOpen(false)}
            onCreate={onCreateSession}
            folders={folders}
          />
        )}
        {newFolderOpen && (
          <NewFolder
            onClose={() => setNewFolderOpen(false)}
            onCreate={onCreateFolder}
          />
        )}
        {editFolderOpen[0] && (
          <EditFolder
            onClose={() => setEditFolderOpen([false, ""])}
            folderId={editFolderOpen[1] || ""}
          />
        )}
        <div
          className="h-full w-1/4 overflow-y-auto rounded-lg bg-zinc-100 p-4 dark:bg-neutral-800"
          style={{
            scrollbarGutter: "stable",
            scrollbarColor: "rgba(100, 116, 139) transparent",
          }}
        >
          {/* if more than 10 sessions the user prolly needs a searchbar */}
          {((showSearchAnyways === "auto" && sessions.length > 10) ||
            showSearchAnyways === "always") && (
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search sessions..."
                className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 pr-10 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                value={filterOptions.name ?? ""}
                onChange={(e) =>
                  setFilterOptions((opts) => ({
                    ...opts,
                    name: e.target.value,
                  }))
                }
              />
              <span
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-neutral-500"
                onClick={() => setFilterOpen((v) => !v)}
                tabIndex={0}
              >
                <Filter />
              </span>
              {filterOpen && (
                <div
                  className="fixed inset-0 z-0 bg-transparent"
                  onClick={() => setFilterOpen(false)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              )}
              {filterOpen && (
                <div className="absolute right-0 z-10 mt-2 w-56 rounded border border-neutral-300 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    Filter Sessions
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-neutral-600 dark:text-neutral-400">
                      From:
                      <input
                        type="date"
                        value={filterOptions.dateFrom}
                        onChange={(e) =>
                          setFilterOptions((opts) => ({
                            ...opts,
                            dateFrom: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded border border-neutral-700 bg-zinc-200 p-1 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                      />
                    </label>
                    <label className="text-xs text-neutral-600 dark:text-neutral-400">
                      To:
                      <input
                        type="date"
                        value={filterOptions.dateTo}
                        onChange={(e) =>
                          setFilterOptions((opts) => ({
                            ...opts,
                            dateTo: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded border border-neutral-700 bg-zinc-200 p-1 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                      />
                    </label>
                    <label className="text-xs text-neutral-600 dark:text-neutral-400">
                      Min Laps:
                      <input
                        type="number"
                        value={
                          filterOptions.lapsMin !== undefined
                            ? filterOptions.lapsMin
                            : ""
                        }
                        placeholder="0"
                        onChange={(e) =>
                          setFilterOptions((opts) => ({
                            ...opts,
                            lapsMin:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded border border-neutral-700 bg-zinc-200 p-1 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                      />
                    </label>
                    <label className="text-xs text-neutral-600 dark:text-neutral-400">
                      Max Laps:
                      <input
                        type="number"
                        placeholder="1000"
                        value={
                          filterOptions.lapsMax !== undefined
                            ? filterOptions.lapsMax
                            : ""
                        }
                        onChange={(e) =>
                          setFilterOptions((opts) => ({
                            ...opts,
                            lapsMax:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded border border-neutral-700 bg-zinc-200 p-1 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
                      />
                    </label>
                    <button
                      className="flex cursor-pointer items-center justify-center text-xs hover:underline"
                      onClick={() => {
                        setFilterOptions({
                          dateFrom: "",
                          dateTo: "",
                          name: "",
                          lapsMin: undefined,
                          lapsMax: undefined,
                        });
                        setFilterOpen(false);
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <NewSessionNewFolder
            onCreateSessionClick={() => setNewSessionOpen(true)}
            onCreateFolderClick={() => setNewFolderOpen(true)}
          />

          {/* ts is for the postgres stuff */}
          {session && (
            <details open className="group/main mb-4">
              <summary className="flex cursor-pointer list-none items-center gap-2 border-b px-2 py-2 font-semibold transition hover:bg-zinc-200 dark:hover:bg-neutral-700 [&::-webkit-details-marker]:hidden">
                <ChevronRight
                  size={16}
                  className="shrink-0 transition-transform group-open/main:rotate-90"
                />
                <Cloud size={16} /> Sessions
              </summary>
              <div className="mt-2 flex flex-col gap-2">
                {isPending || isCloudLoading ? (
                  <Loader2 className="mx-auto my-4 animate-spin" />
                ) : (
                  <>
                    {sessions.filter((s) => s.source === "cloud").length ===
                    0 ? (
                      <p className="p-2 text-sm">
                        No cloud sessions found. Maybe create one?
                      </p>
                    ) : (
                      cloudFolders
                        .filter((folder) =>
                          checkIfFolderHasFilterMatchingSessions(
                            folder.id,
                            "cloud",
                          ),
                        )
                        .map((folder) => (
                          <details key={folder.id} className="group ml-4">
                            <summary
                              className={`flex cursor-pointer list-none items-center gap-2 border-b px-2 py-2 font-semibold transition hover:bg-zinc-200 dark:hover:bg-neutral-700 [&::-webkit-details-marker]:hidden`}
                              style={{
                                borderColor: folder.color,
                              }}
                            >
                              <DynamicIcon
                                name={folder.icon}
                                size={16}
                                className="shrink-0"
                                style={{
                                  color: folder.color,
                                }}
                              />
                              <ChevronRight
                                size={14}
                                className="shrink-0 transition-transform group-open:rotate-90"
                              />
                              <span className="grow overflow-hidden overflow-ellipsis whitespace-nowrap">
                                {folder.name}
                              </span>
                              <span
                                className="text-xs font-extralight opacity-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditFolderOpen([true, folder.id]);
                                }}
                              >
                                <Pencil size={14} />
                              </span>
                              <span className="text-xs font-extralight opacity-50">
                                (
                                {
                                  filterfarter.filter(
                                    (session) =>
                                      session.folder === folder.id &&
                                      session.source === "cloud",
                                  ).length
                                }
                                )
                              </span>
                            </summary>
                            <div className="mt-2 flex flex-col gap-2">
                              {sessions.filter(
                                (session) =>
                                  session.folder === folder.id &&
                                  session.source === "cloud",
                              ).length === 0 ? (
                                <p className="p-2 text-center text-sm font-extralight opacity-50">
                                  No sessions in this folder. Add some!
                                </p>
                              ) : (
                                filterfarter
                                  .filter(
                                    (session) =>
                                      session.folder === folder.id &&
                                      session.source === "cloud",
                                  )
                                  .map((session) => (
                                    <DashSidebarSession
                                      key={session.id}
                                      sessionData={session}
                                      isActive={currentSessionId === session.id}
                                      onClick={() => onSelectSession(session)}
                                    />
                                  ))
                              )}
                            </div>
                          </details>
                        ))
                    )}
                    {filterfarter
                      .filter(
                        (session) =>
                          !session.folder && session.source === "cloud",
                      )
                      .map((session) => (
                        <DashSidebarSession
                          key={session.id}
                          sessionData={session}
                          isActive={currentSessionId === session.id}
                          onClick={() => onSelectSession(session)}
                        />
                      ))}
                  </>
                )}
              </div>
            </details>
          )}

          {/* ts is for the localstorage stuff */}
          {(!session || sessions.some((s) => s.source === "local")) && (
            <details open className="group/main mb-2">
              <summary className="flex cursor-pointer list-none items-center gap-2 border-b px-2 py-2 font-semibold transition hover:bg-zinc-200 dark:hover:bg-neutral-700 [&::-webkit-details-marker]:hidden">
                <ChevronRight
                  size={16}
                  className="shrink-0 transition-transform group-open/main:rotate-90"
                />
                <Database size={16} /> Sessions (LocalStorage)
              </summary>
              <div className="mt-2 flex flex-col gap-2">
                {sessions.filter((s) => s.source === "local").length === 0 && (
                  <p className="p-2 text-sm">
                    No sessions found. Maybe create one?
                  </p>
                )}
                {/* render folders first, then sessions not in folders */}
                {localFolders
                  .filter((folder) =>
                    checkIfFolderHasFilterMatchingSessions(folder.id, "local"),
                  )
                  .map((folder) => (
                    <details key={folder.id} className="group ml-4">
                      <summary
                        className={`flex cursor-pointer list-none items-center gap-2 border-b px-2 py-2 font-semibold transition hover:bg-zinc-200 dark:hover:bg-neutral-700 [&::-webkit-details-marker]:hidden`}
                        style={{
                          borderColor: folder.color,
                        }}
                      >
                        <DynamicIcon
                          name={folder.icon}
                          size={16}
                          className="shrink-0"
                          style={{
                            color: folder.color,
                          }}
                        />
                        <ChevronRight
                          size={14}
                          className="shrink-0 transition-transform group-open:rotate-90"
                        />
                        <span className="grow overflow-hidden overflow-ellipsis whitespace-nowrap">
                          {folder.name}
                        </span>
                        <span
                          className="text-xs font-extralight opacity-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditFolderOpen([true, folder.id]);
                          }}
                        >
                          <Pencil size={14} />
                        </span>
                        <span className="text-xs font-extralight opacity-50">
                          (
                          {
                            filterfarter.filter(
                              (session) =>
                                session.folder === folder.id &&
                                session.source === "local",
                            ).length
                          }
                          )
                        </span>
                      </summary>
                      <div className="mt-2 flex flex-col gap-2">
                        {filterfarter.filter(
                          (session) =>
                            session.folder === folder.id &&
                            session.source === "local",
                        ).length === 0 ? (
                          <p className="p-2 text-center text-sm font-extralight opacity-50">
                            No sessions in this folder. Add some!
                          </p>
                        ) : (
                          filterfarter
                            .filter(
                              (session) =>
                                session.folder === folder.id &&
                                session.source === "local",
                            )
                            .map((session) => (
                              <DashSidebarSession
                                key={session.id}
                                sessionData={session}
                                isActive={currentSessionId === session.id}
                                onClick={() => onSelectSession(session)}
                              />
                            ))
                        )}
                      </div>
                    </details>
                  ))}
                {filterfarter
                  .filter(
                    (session) => !session.folder && session.source === "local",
                  )
                  .map((session) => (
                    <DashSidebarSession
                      key={session.id}
                      sessionData={session}
                      isActive={currentSessionId === session.id}
                      onClick={() => onSelectSession(session)}
                    />
                  ))}
              </div>
            </details>
          )}
        </div>
      </>
    );
  },
);

DashSidebar.displayName = "DashSidebar";

export default DashSidebar;
