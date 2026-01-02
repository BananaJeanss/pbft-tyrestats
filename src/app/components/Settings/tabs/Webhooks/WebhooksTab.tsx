import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ArrowBigUpDash, Pencil, PlusIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import EditWebhook from "./EditWebhook";

export interface WebhookEntry {
  id: string; // random id
  timestamp?: number; // when it was created for sorting
  name: string; // name shown in the UI
  displayName?: string; // name shown in Discord, defaults to "TyreStats"
  url: string; // webhook URL
  iconUrl?: string; // optional icon URL for use in discord
  isDefault: boolean; // is this the default webhook
}

export default function WebhooksTab() {
  const [webhooks, setWebhooks] = useLocalStorage<string[]>(
    "tyrestats_discord_webhooks",
    [],
  );

  const [webhookEditOpen, setWebhookEditOpen] = useState(false);
  const [webhookEditData, setWebhookEditData] = useState<WebhookEntry | null>(
    null,
  );

  const createNewWebhook = () => {
    const defaults = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      name: "New Webhook",
      displayName: "",
      url: "",
      iconUrl: "",
      isDefault: false,
    };
    setWebhooks([...webhooks, JSON.stringify(defaults)]);
  };

  const deleteWebhook = (id: string) => {
    const updatedWebhooks = webhooks.filter((whStr) => {
      const wh: WebhookEntry = JSON.parse(whStr);
      return wh.id !== id;
    });
    setWebhooks(updatedWebhooks);
  };

  return (
    <>
      {webhookEditOpen && (
        <EditWebhook
          onClose={() => setWebhookEditOpen(false)}
          onSave={(webhook: WebhookEntry) => {
            const updatedWebhooks = webhooks.map((whStr) => {
              const wh: WebhookEntry = JSON.parse(whStr);
              if (wh.id === webhook.id) {
                return JSON.stringify(webhook);
              }
              return whStr;
            });
            setWebhooks(updatedWebhooks);
            setWebhookEditOpen(false);
          }}
          WebhookData={webhookEditData!}
        />
      )}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Discord Webhooks</h3>
        <p className="text-sm text-neutral-500">
          Save & configure your Discord webhooks for sharing sessions.
        </p>
        <hr className="border-neutral-800" />
        <div className="flex max-h-[33.5vh] grow flex-col gap-2 overflow-y-auto">
          <button
            className="w-full cursor-pointer rounded border-2 border-dashed px-4 py-2 text-sm"
            onClick={createNewWebhook}
          >
            <PlusIcon className="mr-2 inline h-4 w-4" />
            Add Webhook
          </button>
          <div className="flex flex-col gap-2">
            {/* Webhook entries container */}
            {webhooks.length === 0 ? (
              <div className="text-sm text-neutral-500">
                No webhooks added yet.
              </div>
            ) : (
              // Sort webhooks by timestamp (descending, newest first)
              webhooks
                .map((webhookStr) => JSON.parse(webhookStr) as WebhookEntry)
                .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
                .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
                .map((webhook) => (
                  <div
                    key={webhook.id}
                    className="flex w-full flex-row items-center gap-4 rounded border bg-zinc-200 border-zinc-300 dark:border-neutral-800 dark:bg-neutral-900 px-4 py-4 text-sm"
                  >
                    {/* ignore cause custom url in img */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={webhook.iconUrl || "/tslogow.png"}
                      alt="Webhook Icon"
                      width={64}
                      height={64}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-row items-center gap-1.5">
                        <div className="font-medium">{webhook.name}</div>
                        {webhook.displayName &&
                          webhook.displayName !== "TyreStats" && (
                            <span className="text-xs opacity-70">
                              ({webhook.displayName})
                            </span>
                          )}
                        {webhook.isDefault && (
                          <span className="text-xs opacity-70">• Default</span>
                        )}
                      </div>
                      <span className="max-w-xs truncate text-xs opacity-70">
                        {webhook.url || "No Webhook URL set!"}
                      </span>
                    </div>
                    {/* Spacer */}
                    <div className="grow" />
                    {!webhook.isDefault && (
                      <button
                        className="cursor-pointer"
                        title="Promote to Default"
                        onClick={() => {
                          const updatedWebhooks = webhooks.map((whStr) => {
                            const wh: WebhookEntry = JSON.parse(whStr);
                            if (wh.id === webhook.id) {
                              wh.isDefault = true;
                            } else {
                              wh.isDefault = false;
                            }
                            return JSON.stringify(wh);
                          });
                          setWebhooks(updatedWebhooks);
                        }}
                      >
                        {/* Promote to default button */}
                        <ArrowBigUpDash className="inline h-6 w-6" />
                      </button>
                    )}

                    <button
                      className="cursor-pointer"
                      title="Edit Webhook"
                      onClick={() => {
                        setWebhookEditData(webhook);
                        setWebhookEditOpen(true);
                      }}
                    >
                      {/* Edit button */}
                      <Pencil className="inline h-6 w-6" />
                    </button>
                    <button
                      className="cursor-pointer text-red-500"
                      title="Delete Webhook"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      {/* Delete button */}
                      <Trash2 className="inline h-6 w-6" />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
