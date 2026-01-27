import { useState } from "react";
import DangerousDeletionWarningWaaazaaa from "../DangerousDeletionWarningWaaazaaa";
import ExportMyData from "../ExportMyData";
import ImportMyData from "../ImportMyData";
import {
  Cloud,
  Database,
  Download,
  Trash2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

import MoveToCloudModal from "../MoveToCloudModal";

interface LongNameProps {
  onClose: () => void;
}

function DeleteMyCloudDataDawg({ onClose }: LongNameProps) {
  const { data: session } = authClient.useSession();
  const [isUsernameConfirmed, setIsUsernameConfirmed] = useState(false);

  return (
    <div className="absolute top-0 left-0 z-150 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border-2 border-red-500 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Confirm Account Deletion</h2>
          <button onClick={onClose} className="cursor-pointer">
            <X />
          </button>
        </div>
        <hr className="border-neutral-800" />
        <div className="font-light text-red-500">
          This action will permanently delete your account and all related data.
          <br />
          This cannot be undone. Are you sure you want to proceed?
          <hr className="my-4 border-neutral-800" />
          <strong className="font-semibold">
            To continue, enter your username in the box (case-sensitive):
          </strong>
          <br />
          <br />
          {session?.user?.email && (
            <div className="flex flex-row items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={session.user.image || ""}
                alt="User Avatar"
                className="mr-2 inline-block h-16 w-16 rounded-full"
              />
              <input
                type="text"
                className="rounded border px-2 py-1 text-lg font-bold"
                placeholder={session.user.name || ""}
                onChange={(e) => {
                  if (e.target.value === session.user?.name) {
                    setIsUsernameConfirmed(true);
                  } else {
                    setIsUsernameConfirmed(false);
                  }
                }}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-zinc-300 px-4 py-2 font-semibold transition hover:bg-zinc-400 dark:bg-neutral-700 dark:hover:bg-neutral-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              fetch("/api/deletemyaccount", {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              }).then(async () => {
                await authClient.signOut();
                window.location.href = "/";
              });
            }}
            className={`rounded-lg px-4 py-2 font-semibold transition ${
              isUsernameConfirmed
                ? "cursor-pointer bg-red-600 text-white hover:bg-red-500"
                : "cursor-not-allowed bg-neutral-400 text-neutral-700"
            }`}
            disabled={!isUsernameConfirmed}
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DangerTab() {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAccountDeleteOpen, setIsAccountDeleteOpen] = useState(false);
  const [isMoveToCloudOpen, setIsMoveToCloudOpen] = useState(false);

  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <div className="flex flex-col gap-2">
      {isWarningOpen && (
        <DangerousDeletionWarningWaaazaaa
          onClose={() => setIsWarningOpen(false)}
        />
      )}
      {isAccountDeleteOpen && (
        <DeleteMyCloudDataDawg onClose={() => setIsAccountDeleteOpen(false)} />
      )}
      {isExportOpen && <ExportMyData onClose={() => setIsExportOpen(false)} />}
      {isImportOpen && <ImportMyData onClose={() => setIsImportOpen(false)} />}
      {isMoveToCloudOpen && (
        <MoveToCloudModal onClose={() => setIsMoveToCloudOpen(false)} />
      )}

      <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
      <p className="text-sm text-neutral-500">
        Sensitive actions that can delete or modify your data permanently.
      </p>
      <hr className="border-neutral-800" />

      <h4 className="text-md flex flex-row items-center gap-2 font-semibold">
        <Database className="h-4 w-4" /> LocalStorage
      </h4>
      <div className="flex w-full flex-row gap-2">
        <button
          onClick={() => setIsExportOpen(true)}
          className="flex-1 cursor-pointer rounded-md bg-neutral-200 p-2 text-sm font-medium transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <Upload className="mr-2 inline-block h-4 w-4" />
          Export My Data
        </button>
        <button
          onClick={() => setIsImportOpen(true)}
          className="flex-1 cursor-pointer rounded-md bg-neutral-200 p-2 text-sm font-medium transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <Download className="mr-2 inline-block h-4 w-4" />
          Import My Data
        </button>
        <button
          onClick={() => setIsWarningOpen(true)}
          className="flex-1 cursor-pointer rounded-md bg-red-600 p-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          <Trash2 className="mr-2 inline-block h-4 w-4" />
          Delete All Data
        </button>
      </div>
      {user && (
        <>
          <hr className="border-neutral-800" />
          <h4 className="text-md flex flex-row items-center gap-2 font-semibold">
            <Cloud className="h-4 w-4" /> Your Account
          </h4>
          <div className="flex w-full flex-row gap-2">
            {/* i could add data export but i cba to update this every time schema changes */}
            <button
              onClick={() => setIsMoveToCloudOpen(true)}
              className="flex-1 cursor-pointer rounded-md bg-neutral-200 p-2 text-sm font-medium transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              <UploadCloud className="mr-2 inline-block h-4 w-4" />
              Move LocalStorage to Cloud
            </button>
            <button
              onClick={() => setIsAccountDeleteOpen(true)}
              className="cursor-pointer rounded-md bg-red-600 p-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <Trash2 className="mr-2 inline-block h-4 w-4" />
              Delete My Account
            </button>
          </div>
        </>
      )}
    </div>
  );
}
