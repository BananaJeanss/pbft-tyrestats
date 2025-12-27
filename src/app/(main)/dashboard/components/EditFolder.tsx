import IconSelector, { IconName } from "@/app/components/lucide-selector";
import { Folder, TySession } from "@/app/types/TyTypes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Trash, X } from "lucide-react";
import { useState } from "react";

export interface EditFolderProps {
  onClose: () => void;
  folderId: string;
}

interface DeleteScreenProps {
  onClose: () => void;
  onDelete: () => void;
}

function DeleteScreen({ onClose, onDelete }: DeleteScreenProps) {
  return (
    <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-100">
      <div className="w-full max-w-md bg-zinc-100 dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Delete Folder</h2>
          <button
            onClick={onClose}
            className="cursor-pointer hover:text-neutral-500 transition-colors"
          >
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />

        <p className="text-neutral-700 dark:text-neutral-300">
          Are you sure you want to delete this folder? This action cannot be
          undone.
        </p>

        <div className="flex flex-row gap-4 justify-end">
          <button
            onClick={onClose}
            className="bg-neutral-300 text-black font-bold py-2 px-4 rounded-lg hover:bg-neutral-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditFolder({ onClose, folderId }: EditFolderProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconName>("folder");
  const [color, setColor] = useState("#ffffff");
  const [folders, setFolders] = useLocalStorage<Folder[]>(
    "tyrestats_folders",
    [],
  );
  const [_sessions, setSessions] = useLocalStorage<TySession[]>(
    "tyrestats_sessions",
    [],
  );

  const [deleteOpen, setDeleteOpen] = useState(false);

  // load existing folder data
  useState(() => {
    const folderToEdit = folders.find((folder) => folder.id === folderId);
    if (folderToEdit) {
      setName(folderToEdit.name);
      setIcon(folderToEdit.icon);
      setColor(folderToEdit.color);
    }
  });

  function HandleEdit(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    event.preventDefault();
    // Find and update the folder
    setFolders((prevFolders) => {
      return prevFolders.map((folder) => {
        if (folder.id === folderId) {
          return {
            ...folder,
            name: name.trim() || folder.name,
            icon,
            color,
          };
        }
        return folder;
      });
    });
    onClose();
  }

  return (
    <>
      {deleteOpen && (
        <DeleteScreen
          onClose={() => setDeleteOpen(false)}
          onDelete={() => {
            // evacuate sessions from folder first
            setSessions((prevSessions) => {
              return prevSessions.map((session) => {
                if (session.folder === folderId) {
                  return {
                    ...session,
                    folder: null,
                  };
                }
                return session;
              });
            });

            // then delete folder
            setFolders((prevFolders) =>
              prevFolders.filter((folder) => folder.id !== folderId),
            );
            setDeleteOpen(false);
            onClose();
          }}
        />
      )}
      <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/95 flex flex-col items-center justify-center p-8 gap-2 z-50">
        <div className="w-full max-w-md bg-zinc-100 dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-6 border border-neutral-800 shadow-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Edit Folder</h2>
            <button
              onClick={onClose}
              className="cursor-pointer hover:text-neutral-500 transition-colors"
            >
              <X />
            </button>
          </div>

          <hr className="border-neutral-800" />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                Folder Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. FT1 Season 9 2025"
                className="bg-zinc-200 dark:bg-neutral-800 border border-neutral-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-neutral-600 transition-all"
              />
            </div>

            <div className="flex gap-4 max-w-full">
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                  Icon
                </label>
                <IconSelector value={icon} onChange={setIcon} />
              </div>

              <div className="flex flex-col gap-2 shrink-0 max-w-full">
                <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                  Color
                </label>
                <div
                  className="h-[42px] w-[60px] rounded border border-neutral-700 overflow-hidden relative cursor-pointer hover:border-neutral-500 transition-colors"
                  style={{ backgroundColor: color }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    title="Choose folder color"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2 items-center cursor-pointer self-start mt-2 justify-center">
              <span
                className="text-sm font-bold text-neutral-500 text-red-600 flex flex-row items-center"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash className="inline h-4 w-4 mr-1" />
                Delete Folder
              </span>
            </div>
          </div>

          <button
            onClick={HandleEdit}
            className="w-full bg-neutral-300 text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition mt-2 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
