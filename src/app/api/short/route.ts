import { NextResponse } from "next/server";
import { Pool } from "pg";
import { createClient } from "redis";
import { TySession } from "@/app/types/TyTypes";

const restrictedFields = ["id", "folder"];

export async function GET(req: Request) {
  if (!req.headers.get("sessionData")) {
    return NextResponse.json(
      { error: "No session data provided" },
      { status: 400 }
    );
  }

  // use redis for rate limiting (10 links per hour per IP)
  if (process.env.NODE_ENV !== "development") {
    // no ratey limitey in developmenty modey
    if (!process.env.REDIS_URL) {
      console.error(
        "REDIS_URL not set in environment variables\nShort link creation will still work, but rate limiting is disabled."
      );
    } else {
      const redisClient = createClient();
      await redisClient.connect();
      const ip = req.headers.get("x-forwarded-for") || "unknown";
      const rateLimitKey = `share_rate_${ip}`;
      const currentCount = await redisClient.get(rateLimitKey);
      if (currentCount && parseInt(currentCount) >= 10) {
        redisClient.destroy();
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again later." },
          { status: 429 }
        );
      }
      await redisClient
        .multi()
        .incr(rateLimitKey)
        .expire(rateLimitKey, 3600) // 1 hour
        .exec();
      redisClient.destroy();
    }
  }

  // verify sessionData matches a TySession structure
  let sessionData: TySession;
  try {
    sessionData = JSON.parse(req.headers.get("sessionData")!);
    // clear sessiondata of restricted fields cause we don't need the receiver to have id or folder
    restrictedFields.forEach((field) => {
      (sessionData as Partial<TySession>)[field as keyof Partial<TySession>] =
        undefined;
    });
  } catch (_err) {
    return NextResponse.json(
      { error: "Invalid session data format" },
      { status: 400 }
    );
  }

  // Connect to the database & verify & create if not exists
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS shared_sessions (
                short_url VARCHAR(10) PRIMARY KEY,
                session_data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                hashcheck VARCHAR(64) NOT NULL
            );
        `); // hashcheck to prevent duplicate entries

    const hashcheck = crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(JSON.stringify(sessionData))
    );
    const hashHex = Array.from(new Uint8Array(await hashcheck))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Check for existing entry
    const existingRes = await client.query(
      "SELECT short_url FROM shared_sessions WHERE hashcheck = $1",
      [hashHex]
    );

    let shortUrl: string;
    if (existingRes.rows.length > 0) {
      shortUrl = existingRes.rows[0].short_url;
    } else {
      // Create a new short URL
      shortUrl = crypto.randomUUID().split("-")[0]; // simple short URL
      await client.query(
        "INSERT INTO shared_sessions (short_url, session_data, hashcheck) VALUES ($1, $2, $3)",
        [shortUrl, sessionData, hashHex]
      );
    }

    const url = new URL(req.url);
    const finalizedUrl = `${url.origin}/dashboard/share?${shortUrl}`;
    return NextResponse.json({ finalizedUrl });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  } finally {
    client.release();
    await pool.end();
  }
}
