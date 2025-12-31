import { X } from "lucide-react";
import { WebhookEntry } from "./WebhooksTab";
import { useState } from "react";

export interface EditWebhookProps {
  onClose: () => void;
  onSave: (webhook: WebhookEntry) => void;
  WebhookData: WebhookEntry;
}

export default function EditWebhook(
  this: WebhookEntry,
  { onClose, onSave, WebhookData }: EditWebhookProps,
) {
  const [localWebhookData, setLocalWebhookData] = useState<WebhookEntry>({
    ...WebhookData,
  });
  return (
    <div className="absolute top-0 left-0 z-100 flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-950/95 p-8">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-neutral-800 bg-zinc-100 p-6 shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Webhook</h2>
          <button onClick={onClose} className="cursor-pointer">
            <X />
          </button>
        </div>

        <hr className="border-neutral-800" />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Webhook Name</label>
            <div className="flex flex-row gap-2">
              <input
                type="text"
                maxLength={32}
                value={localWebhookData.name}
                onChange={(e) => {
                  setLocalWebhookData({
                    ...localWebhookData,
                    name: e.target.value,
                  });
                }}
                placeholder="e.g. FT1 Kubica Island Autodrome"
                className="h-10 w-full rounded border border-neutral-700 bg-zinc-200 px-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">
              Display Name
              <span className="text-xs opacity-70"> (used in Discord)</span>
            </label>
            <input
              type="text"
              maxLength={32}
              value={localWebhookData.displayName || ""}
              onChange={(e) => {
                setLocalWebhookData({
                  ...localWebhookData,
                  displayName: e.target.value,
                });
              }}
              placeholder="e.g. TyreStats"
              className="h-10 w-full rounded border border-neutral-700 bg-zinc-200 px-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Webhook URL</label>
            <div className="flex flex-row gap-2">
              <input
                maxLength={200}
                type="text"
                value={localWebhookData.url}
                onChange={(e) => {
                  setLocalWebhookData({
                    ...localWebhookData,
                    url: e.target.value,
                  });
                }}
                placeholder="https://discord.com/api/webhooks/..."
                className="h-10 w-full rounded border border-neutral-700 bg-zinc-200 px-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Icon URL</label>
            <div className="flex flex-row gap-2">
              <input
                type="text"
                maxLength={200}
                value={localWebhookData.iconUrl || ""}
                onChange={(e) => {
                  setLocalWebhookData({
                    ...localWebhookData,
                    iconUrl: e.target.value,
                  });
                }}
                placeholder="https://pbft-tyrestats.vercel.app/tslogow.png"
                className="h-10 w-full rounded border border-neutral-700 bg-zinc-200 px-2 focus:ring-2 focus:ring-neutral-600 focus:outline-none dark:bg-neutral-800"
              />
            </div>
          </div>
        </div>

        <button
          onClick={onSave.bind(this, localWebhookData)}
          className="mt-2 w-full cursor-pointer rounded-lg bg-neutral-300 py-3 font-bold text-black transition hover:bg-neutral-200"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
