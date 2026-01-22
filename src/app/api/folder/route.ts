import { prisma } from "../../../../db";
import { FolderSchema } from "@/app/types/schemas";
import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "../../../../auth";

// list user folders
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  try {
    const folders = await prisma.raceFolder.findMany({
      where: { userId: session.user.id },
    });
    return new Response(JSON.stringify({ folders }), { status: 200 });
  } catch (error) {
    console.error("GET folder error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// Create/Update a folder
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

  const result = FolderSchema.safeParse(rawBody);

  if (!result.success) {
    console.error("Validation failed:", z.treeifyError(result.error));
    return new Response(
      JSON.stringify({
        error: "Invalid folder data",
        details: z.treeifyError(result.error),
      }),
      { status: 400 },
    );
  }

  const validFolderData = result.data;
  const targetId = validFolderData.id;

  if (!targetId) {
    return new Response(JSON.stringify({ error: "Folder data missing ID" }), {
      status: 400,
    });
  }

  const MAX_ID_LENGTH = 64;
  const MAX_NAME_LENGTH = 50;
  const MAX_COLOR_LENGTH = 32;
  const MAX_ICON_LENGTH = 32;
  const colorPattern = /^#([0-9A-F]{3}){1,2}$/i;
  const iconPattern = /^[a-zA-Z0-9\-_]+$/;

  if (
    typeof validFolderData.id !== "string" ||
    validFolderData.id.length > MAX_ID_LENGTH
  ) {
    return new Response(JSON.stringify({ error: "Invalid folder ID" }), {
      status: 400,
    });
  }
  if (
    typeof validFolderData.name !== "string" ||
    validFolderData.name.length === 0 ||
    validFolderData.name.length > MAX_NAME_LENGTH
  ) {
    return new Response(JSON.stringify({ error: "Invalid folder name" }), {
      status: 400,
    });
  }
  if (
    typeof validFolderData.color !== "string" ||
    validFolderData.color.length > MAX_COLOR_LENGTH ||
    !colorPattern.test(validFolderData.color)
  ) {
    return new Response(JSON.stringify({ error: "Invalid folder color" }), {
      status: 400,
    });
  }
  if (
    typeof validFolderData.icon !== "string" ||
    validFolderData.icon.length > MAX_ICON_LENGTH ||
    !iconPattern.test(validFolderData.icon)
  ) {
    return new Response(JSON.stringify({ error: "Invalid folder icon" }), {
      status: 400,
    });
  }

  try {
    // 1. Check if folder exists
    const existingFolder = await prisma.raceFolder.findUnique({
      where: { id: targetId },
      select: { userId: true },
    });

    if (existingFolder) {
      // Update Folder Path
      if (existingFolder.userId !== session.user.id) {
        return new Response(
          JSON.stringify({ error: "Forbidden: You do not own this folder" }),
          {
            status: 403,
          },
        );
      }

      await prisma.raceFolder.update({
        where: { id: targetId },
        data: {
          name: validFolderData.name,
          color: validFolderData.color,
          icon: validFolderData.icon,
        },
      });

      return new Response(
        JSON.stringify({ success: true, action: "updated", id: targetId }),
        { status: 200 },
      );
    } else {
      // Create Folder Path
      await prisma.raceFolder.create({
        data: {
          id: targetId,
          userId: session.user.id,
          name: validFolderData.name,
          color: validFolderData.color,
          icon: validFolderData.icon,
        },
      });

      return new Response(
        JSON.stringify({ success: true, action: "created", id: targetId }),
        { status: 201 },
      );
    }
  } catch (err) {
    console.error("Save folder error:", err);
    return new Response(JSON.stringify({ error: "Failed to save folder" }), {
      status: 500,
    });
  }
}

// Delete a folder
export async function DELETE(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("id");
  if (!folderId) {
    return new Response(JSON.stringify({ error: "Folder ID is required" }), {
      status: 400,
    });
  }
  try {
    const existingFolder = await prisma.raceFolder.findUnique({
      where: { id: folderId },
      select: { userId: true },
    });
    if (!existingFolder) {
      return new Response(JSON.stringify({ error: "Folder not found" }), {
        status: 404,
      });
    }
    if (existingFolder.userId !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden: You do not own this folder" }),
        {
          status: 403,
        },
      );
    }
    await prisma.$transaction([
      prisma.raceSession.updateMany({
        where: { folderId: folderId },
        data: { folderId: null },
      }),
      prisma.raceFolder.delete({ where: { id: folderId } }),
    ]);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Delete folder error:", err);
    return new Response(JSON.stringify({ error: "Failed to delete folder" }), {
      status: 500,
    });
  }
}
