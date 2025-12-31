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
    <div className="absolute top-0 left-0 z-100 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Delete Folder</h2>
          <button
            onClick={onClose}
            className="cursor-pointer transition-colors hover:text-neutral-500"
          >
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />

        <p className="text-neutral-700 dark:text-neutral-300">
          Are you sure you want to delete this folder? This action cannot be
          undone.
        </p>

        <div className="flex flex-row justify-end gap-4">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-neutral-300 px-4 py-2 font-bold text-black transition hover:bg-neutral-200"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
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
      <div className="absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
        <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Edit Folder</h2>
            <button
              onClick={onClose}
              className="cursor-pointer transition-colors hover:text-neutral-500"
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
                className="w-full rounded border border-neutral-700 bg-zinc-200 p-2 transition-all focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              />
            </div>

            <div className="flex max-w-full gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                  Icon
                </label>
                <IconSelector value={icon} onChange={setIcon} />
              </div>

              <div className="flex max-w-full shrink-0 flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                  Color
                </label>
                <div
                  className="relative h-[42px] w-[60px] cursor-pointer overflow-hidden rounded border border-neutral-700 transition-colors hover:border-neutral-500"
                  style={{ backgroundColor: color }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    title="Choose folder color"
                  />
                </div>
              </div>
            </div>
            <div className="mt-2 flex cursor-pointer flex-row items-center justify-center gap-2 self-start">
              <span
                className="flex flex-row items-center text-sm font-bold text-neutral-500 text-red-600"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash className="mr-1 inline h-4 w-4" />
                Delete Folder
              </span>
            </div>
          </div>

          <button
            onClick={HandleEdit}
            className="mt-2 w-full cursor-pointer rounded-lg bg-neutral-300 py-3 font-bold text-black transition hover:bg-neutral-200"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
