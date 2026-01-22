import { prisma } from "../../../../db";
import { TySession } from "@/app/types/TyTypes";
import { TySessionSchema } from "@/app/types/schemas";
import { headers } from "next/headers";
import { auth } from "../../../../auth";

// either get a list of user sessions or a specific session by id
export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("id");

  try {
    if (sessionId) {
      // Fetch specific session
      const userSession = await prisma.raceSession.findUnique({
        where: { id: sessionId },
      });

      if (!userSession) {
        return new Response(JSON.stringify({ error: "Session not found" }), {
          status: 404,
        });
      }

      // Security check: Ensure the user owns this session
      if (userSession.userId !== session.user.id) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
        });
      }

      const sessionData = userSession.data as unknown;

      if (sessionData && typeof sessionData === "object") {
        return new Response(JSON.stringify(sessionData as TySession), {
          status: 200,
        });
      } else {
        return new Response(
          JSON.stringify({ error: "Invalid session data format" }),
          { status: 500 },
        );
      }
    } else {
      // List all sessions for the user
      // TODO: Ideally we should project the 'meta' field from the JSONB data here
      const sessions = await prisma.raceSession.findMany({
        where: { userId: session.user.id },
        select: { id: true, updatedAt: true, data: true },
      });

      // Map to a lightweight summary
      const sessionSummaries = sessions.map((s) => {
        const data = s.data as unknown as TySession;
        return {
          id: s.id,
          updatedAt: s.updatedAt,
          name: data.meta?.name || "Unnamed Session",
          date: data.meta?.date,
        };
      });

      return new Response(JSON.stringify({ sessions: sessionSummaries }), {
        status: 200,
      });
    }
  } catch (error) {
    console.error("GET session error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// Create/Update a session
export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 500 * 1024) {
    return new Response(
      JSON.stringify({ error: "Payload too large (Max 500KB)" }),
      {
        status: 413,
      },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
      status: 400,
    });
  }

  const result = TySessionSchema.safeParse(rawBody);

  if (!result.success) {
    console.error("Validation failed:", result.error.format());
    return new Response(
      JSON.stringify({
        error: "Invalid session data",
        details: result.error.flatten(),
      }),
      { status: 400 },
    );
  }

  const validSessionData = result.data;
  const targetId = validSessionData.id;

  if (!targetId) {
    return new Response(JSON.stringify({ error: "Session data missing ID" }), {
      status: 400,
    });
  }

  try {
    // 1. Check if session exists
    const existingSession = await prisma.raceSession.findUnique({
      where: { id: targetId },
      select: { userId: true },
    });

    if (existingSession) {
      // Update Session Path
      if (existingSession.userId !== session.user.id) {
        return new Response(
          JSON.stringify({ error: "Forbidden: You do not own this session" }),
          {
            status: 403,
          },
        );
      }

      await prisma.raceSession.update({
        where: { id: targetId },
        data: {
          data: validSessionData,
          // updatedAt is auto-handled by Prisma but good to be explicit if needed
        },
      });

      return new Response(
        JSON.stringify({ success: true, action: "updated", id: targetId }),
        { status: 200 },
      );
    } else {
      // Create Session Path
      // We force the DB ID to match the Session Data ID for consistency
      try {
        await prisma.raceSession.create({
          data: {
            id: targetId,
            userId: session.user.id,
            data: validSessionData,
          },
        });

        return new Response(
          JSON.stringify({ success: true, action: "created", id: targetId }),
          { status: 201 },
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.code === "P2002") {
          // Race condition: Session was created between findUnique and create
          // We must treat this as an update, but verify ownership first.
          const freshSession = await prisma.raceSession.findUnique({
            where: { id: targetId },
            select: { userId: true },
          });

          if (freshSession) {
            if (freshSession.userId !== session.user.id) {
              return new Response(
                JSON.stringify({
                  error: "Forbidden: You do not own this session",
                }),
                {
                  status: 403,
                },
              );
            }

            await prisma.raceSession.update({
              where: { id: targetId },
              data: {
                data: validSessionData,
              },
            });

            return new Response(
              JSON.stringify({
                success: true,
                action: "updated",
                id: targetId,
              }),
              { status: 200 },
            );
          }
        }
        throw error;
      }
    }
  } catch (err) {
    console.error("Save session error:", err);
    return new Response(JSON.stringify({ error: "Failed to save session" }), {
      status: 500,
    });
  }
}

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
  const sessionId = searchParams.get("id");
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Session ID is required" }), {
      status: 400,
    });
  }
  try {
    const existingSession = await prisma.raceSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });
    if (!existingSession) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
      });
    }
    if (existingSession.userId !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden: You do not own this session" }),
        {
          status: 403,
        },
      );
    }
    await prisma.raceSession.delete({ where: { id: sessionId } });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Delete session error:", err);
    return new Response(JSON.stringify({ error: "Failed to delete session" }), {
      status: 500,
    });
  }
}
