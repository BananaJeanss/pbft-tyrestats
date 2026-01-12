import { NextResponse } from "next/server";
import redisClient from "@/app/db/redisClient";
import { TySession } from "@/app/types/TyTypes";
import { prisma } from "../../../../db";

const restrictedFields = ["id", "folder"];
const IsDevvingRatelimits = process.env.ENABLE_RDISPSTGRS_INDEV === "true";

// for getting data from short links
export async function GET(req: Request) {
  const url = new URL(req.url);
  const shortUrl = url.searchParams.get("url");
  if (!shortUrl) {
    return NextResponse.json(
      { error: "No short URL provided" },
      { status: 400 },
    );
  }

  // redis ratelimit of 50/hour per IP cause we dont want people to spam shit
  if (process.env.NODE_ENV !== "development" || IsDevvingRatelimits) {
    if (!process.env.REDIS_URL) {
      console.error(
        "REDIS_URL not set in environment variables\nShort link access will still work, but rate limiting is disabled.",
      );
    } else {
      const ip =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        req.headers.get("host") ||
        "unknown";
      const rateLimitKey = `short_access_rate_${ip}`;
      const currentCount = await redisClient.get(rateLimitKey);
      if (currentCount && parseInt(currentCount) >= 50) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again later." },
          { status: 429 },
        );
      }
      await redisClient
        .multi()
        .incr(rateLimitKey)
        .expire(rateLimitKey, 3600) // 1 hour
        .exec();
    }
  }

  try {
    const res = await prisma.shared_sessions.findUnique({
      where: { short_url: shortUrl },
      select: { session_data: true },
    });

    if (!res) {
      return NextResponse.json(
        { error: "Short URL not found" },
        { status: 404 },
      );
    }

    const sessionData = res.session_data;
    return NextResponse.json({ sessionData });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// for generating short links
export async function POST(req: Request) {
  const body = await req.json();
  if (!body.sessionData) {
    return NextResponse.json(
      { error: "No session data provided" },
      { status: 400 },
    );
  }

  // use redis for rate limiting (20 links per hour per IP)
  if (process.env.NODE_ENV !== "development" || IsDevvingRatelimits) {
    // no ratey limitey in developmenty modey
    if (!process.env.REDIS_URL) {
      console.error(
        "REDIS_URL not set in environment variables\nShort link creation will still work, but rate limiting is disabled.",
      );
    } else {
      const ip =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        req.headers.get("host") ||
        "unknown";
      const rateLimitKey = `share_rate_${ip}`;
      const currentCount = await redisClient.get(rateLimitKey);
      if (currentCount && parseInt(currentCount) >= 20) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again later." },
          { status: 429 },
        );
      }
      await redisClient
        .multi()
        .incr(rateLimitKey)
        .expire(rateLimitKey, 3600) // 1 hour
        .exec();
    }
  }

  // verify sessionData matches a TySession structure
  let sessionData: TySession;
  try {
    sessionData = body.sessionData;
    // clear sessiondata of restricted fields cause we don't need the receiver to have id or folder
    restrictedFields.forEach((field) => {
      (sessionData as Partial<TySession>)[field as keyof Partial<TySession>] =
        undefined;
    });
  } catch (_err) {
    return NextResponse.json(
      { error: "Invalid session data format" },
      { status: 400 },
    );
  }

  // if json is too large, reject
  const jsonString = JSON.stringify(sessionData);
  if (jsonString.length > 100000) {
    // 100 KB limit
    return NextResponse.json(
      { error: "Session data too large to share" },
      { status: 400 },
    );
  }

  try {
    const hashcheck = crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(JSON.stringify(sessionData)),
    );
    const hashHex = Array.from(new Uint8Array(await hashcheck))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Check for existing entry
    const existingRes = await prisma.shared_sessions.findUnique({
      where: { hashcheck: hashHex },
    });

    let shortUrl: string = "";
    if (existingRes) {
      shortUrl = existingRes.short_url;
    } else {
      // Create a new short URL, and make sure already doesnt exist
      let exists = false;
      while (!shortUrl || exists) {
        shortUrl = crypto.randomUUID().split("-")[0]; // simple short URL
        const checkRes = await prisma.shared_sessions.findMany({
          where: { short_url: shortUrl },
          select: { short_url: true },
        });
        exists = checkRes.length > 0;
      }

      // Insert new entry
      await prisma.shared_sessions.create({
        data: {
          short_url: shortUrl,
          session_data: JSON.parse(JSON.stringify(sessionData)),
          hashcheck: hashHex,
        },
      });
    }

    const url = new URL(req.url);
    const finalizedUrl = `${url.origin}/dashboard/share?${shortUrl}`;
    return NextResponse.json({ finalizedUrl });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
