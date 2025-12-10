import { useEffect, useState } from "react";
import DashSidebarSession from "./DashSidebarSession";
import NewSession from "./NewSession";

export default function DashSidebar({ currentSessionId, onSelectSession }: any) {
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
      const storedSessions = localStorage.getItem("tyrestats_sessions"); 
      if (storedSessions) {
          setSessions(JSON.parse(storedSessions));
      }
  }, []);

  return (
    <>
      {newSessionOpen && (
        <NewSession onClose={() => setNewSessionOpen(false)} />
      )}
      <div
        className="w-1/4 h-full bg-neutral-800 rounded-lg p-4 overflow-y-auto"
        style={{
          scrollbarGutter: "stable",
          scrollbarColor: "rgba(100, 116, 139) transparent",
        }}
      >
        <button
          className="w-full mb-4 px-4 py-2 bg-transparent border border-blue-800 text-white rounded hover:bg-blue-950 cursor-pointer transition-colors"
          onClick={() => setNewSessionOpen(true)}
        >
          + New Session
        </button>
        <details open className="mb-2">
          <summary className="cursor-pointer text-white font-semibold py-2 px-2 rounded hover:bg-neutral-700 transition">
            Sessions (LocalStorage)
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            {sessions.length === 0 && (
                <p className="text-neutral-500 text-sm p-2">No sessions found. Maybe create one?</p>
            )}
            {sessions.map((session) => (
              <DashSidebarSession
                key={session.id}
                name={session.meta.name}
                date={session.meta.date}
                lastModified={session.meta.lastModified}
                icon_url={session.meta.icon_url || ""}
                isActive={currentSessionId}
                onClick={() => onSelectSession(session)}
              />
            ))}
          </div>
        </details>
      </div>
    </>
  );
}
