import { prisma } from "../../../../db";
import { TySession, Folder } from "@/app/types/TyTypes";
import { headers } from "next/headers";
import { auth } from "../../../../auth";
import { z } from "zod";

// Minimal validation schemas to ensure structure
const MigratePayloadSchema = z.object({
  sessions: z.array(z.any()), // validating exact shape of session is complex, trusting basic structure + ownership
  folders: z.array(z.any()),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
      status: 400,
    });
  }

  const result = MigratePayloadSchema.safeParse(rawBody);

  if (!result.success) {
    return new Response(
      JSON.stringify({ error: "Invalid payload structure" }),
      {
        status: 400,
      },
    );
  }

  const { sessions, folders } = result.data;
  const userId = session.user.id;

  // Limits
  if (sessions.length + folders.length > 500) {
    return new Response(
      JSON.stringify({ error: "Too many items to migrate at once (Max 500)" }),
      {
        status: 413,
      },
    );
  }

  try {
    // 1. Migrate Folders

    // Process Folders
    // We strictly take the fields we need.
    const foldersData = (folders as Folder[]).map((f) => ({
      id: f.id,
      userId: userId,
      name: f.name,
      color: f.color,
      icon: f.icon,
    }));

    const folderPromises = foldersData.map((f) =>
      prisma.raceFolder
        .upsert({
          where: { id: f.id },
          update: {
            name: f.name,
            color: f.color,
            icon: f.icon,
          },
          create: f,
        })
        .catch((err) => {
          console.error(`Failed to migrate folder ${f.id}:`, err);
          return null;
        }),
    );

    // 2. Migrate Sessions
    const sessionsData = (sessions as TySession[]).map((s) => ({
      id: s.id,
      userId: userId,
      folderId: s.folder, // link to folder if it exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: s as any,
    }));

    const sessionPromises = sessionsData.map((s) =>
      prisma.raceSession
        .upsert({
          where: { id: s.id },
          update: {
            data: s.data,
            folderId: s.folderId,
          },
          create: {
            id: s.id,
            userId: s.userId,
            folderId: s.folderId,
            data: s.data,
          },
        })
        .catch((err) => {
          console.error(`Failed to migrate session ${s.id}:`, err);
          return null;
        }),
    );

    // Execute
    await Promise.all([...folderPromises, ...sessionPromises]);

    return new Response(
      JSON.stringify({
        success: true,
        count: sessions.length + folders.length,
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Migration error:", error);
    return new Response(JSON.stringify({ error: "Migration failed" }), {
      status: 500,
    });
  }
}
