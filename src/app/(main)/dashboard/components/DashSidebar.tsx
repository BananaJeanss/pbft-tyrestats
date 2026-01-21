import { useState } from "react";
import DashSidebarSession from "./DashSidebarSession";
import NewSession from "./NewSession";
import { useLocalStorage } from "../../../../hooks/useLocalStorage";
import { useMounted } from "@/hooks/useMounted";
import { Folder, TySession } from "@/app/types/TyTypes";
import {
  FolderPlus,
  ChevronRight,
  Database,
  Pencil,
  Loader2,
  Cloud,
} from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import NewFolder from "./NewFolder";
import EditFolder from "./EditFolder";
import { authClient } from "@/lib/auth-client";

interface DashSidebarProps {
  currentSessionId: string;
  onSelectSession: (session: TySession) => void;
}

export default function DashSidebar({
  currentSessionId,
  onSelectSession,
}: DashSidebarProps) {
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [rawSessions] = useLocalStorage<
    TySession[] | Record<string, TySession>
  >("tyrestats_sessions", []);
  const sessions: TySession[] = Array.isArray(rawSessions)
    ? rawSessions
    : typeof rawSessions === "object" && rawSessions
      ? Object.values(rawSessions)
      : [];

  const mounted = useMounted();
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [folders] = useLocalStorage<Folder[]>("tyrestats_folders", []);
  const [editFolderOpen, setEditFolderOpen] = useState<[boolean, string?]>([
    false,
    "",
  ]);

  const {
    data: session,
    isPending, // loading state
  } = authClient.useSession();

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
        <NewSession onClose={() => setNewSessionOpen(false)} />
      )}
      {newFolderOpen && <NewFolder onClose={() => setNewFolderOpen(false)} />}
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
        <div className="flex flex-row gap-2">
          <button
            className="mb-4 grow cursor-pointer rounded border border-blue-800 bg-transparent px-4 py-2 transition-colors hover:bg-blue-100 dark:hover:bg-blue-950"
            onClick={() => setNewSessionOpen(true)}
          >
            + New Session
          </button>
          <button
            className="mb-4 cursor-pointer rounded border border-blue-900 bg-transparent px-4 py-2 transition-colors hover:bg-blue-100 dark:hover:bg-blue-950"
            onClick={() => setNewFolderOpen(true)}
          >
            <FolderPlus size={16} />
          </button>
        </div>

        {/* ts is for the postgres stuff */}
        {session && (
          <details className="group/main mb-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 border-b px-2 py-2 font-semibold transition hover:bg-zinc-200 dark:hover:bg-neutral-700 [&::-webkit-details-marker]:hidden">
              <ChevronRight
                size={16}
                className="shrink-0 transition-transform group-open/main:rotate-90"
              />
              <Cloud size={16} /> Sessions
            </summary>
            <div className="mt-2 flex flex-col gap-2">
              {isPending ? (
                <Loader2 className="mx-auto my-4 animate-spin" />
              ) : (
                <p className="p-2 text-sm">
                  No cloud sessions found. Try creating one!
                </p>
              )}
            </div>
          </details>
        )}

        {/* ts is for the localstorage stuff */}
        <details open className="group/main mb-2">
          <summary className="flex cursor-pointer list-none items-center gap-2 border-b px-2 py-2 font-semibold transition hover:bg-zinc-200 dark:hover:bg-neutral-700 [&::-webkit-details-marker]:hidden">
            <ChevronRight
              size={16}
              className="shrink-0 transition-transform group-open/main:rotate-90"
            />
            <Database size={16} /> Sessions (LocalStorage)
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            {sessions.length === 0 && (
              <p className="p-2 text-sm">
                No sessions found. Maybe create one?
              </p>
            )}
            {/* render folders first, then sessions not in folders */}
            {folders.map((folder) => (
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
                      sessions.filter((session) => session.folder === folder.id)
                        .length
                    }
                    )
                  </span>
                </summary>
                <div className="mt-2 flex flex-col gap-2">
                  {sessions.filter((session) => session.folder === folder.id)
                    .length === 0 ? (
                    <p className="p-2 text-center text-sm font-extralight opacity-50">
                      No sessions in this folder. Add some!
                    </p>
                  ) : (
                    sessions
                      .filter((session) => session.folder === folder.id)
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
            {sessions.map(
              (session) =>
                !session.folder && (
                  <DashSidebarSession
                    key={session.id}
                    sessionData={session}
                    isActive={currentSessionId === session.id}
                    onClick={() => onSelectSession(session)}
                  />
                ),
            )}
          </div>
        </details>
      </div>
    </>
  );
}
