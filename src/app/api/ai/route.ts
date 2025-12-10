import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "redis";

const redis = await createClient({ url: process.env.REDIS_URL }).connect();

const CurrentModel = "qwen/qwen3-32b";
const hcurl = "https://ai.hackclub.com/proxy/v1/chat/completions";
const apikey = process.env.HC_AI_API_KEY;

function CallHCAI(prompt: String) {
  const body = {
    model: CurrentModel,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apikey}`,
  };

  let response = fetch(hcurl, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });

  return response;
}

// expected request because we only want to allow tyre stats, no free ai for you
export interface ExpectedRequest {
  tyreData: Record<string, any>;
  raceConfig: {
    RaceLaps: number;
  };
  tyrePreferences: {
    preferredSwitchoverPoint: number;
    softToMediumRatio: number;
    mediumToHardRatio: number;
  };
}

async function checkRateLimit(request: Request) {
  const headersList = headers();
  const ip = (await headersList).get("x-forwarded-for") || "unknown";
  const rateLimitKey = `rate_limit_v2:${ip}`;
  const limit = 5;
  const window = 60 * 60 * 24; // 5 request per 24 hours

  let currentCount;
  try {
    currentCount = await redis.get(rateLimitKey);
  } catch (error) {
    console.error("Redis error:", error);
    return -1;
  }

  if (currentCount && parseInt(currentCount) >= limit) {
    return -1;
  } else {
    const newCount = await redis.incr(rateLimitKey);
    if (newCount === 1) {
      await redis.expire(rateLimitKey, window);
    }
    return newCount;
  }
}

export async function POST(request: Request) {
  let userRatelimitCount = 0;

  if (process.env.NODE_ENV != "development") { // no rate limiting in dev
    try {
      userRatelimitCount = await checkRateLimit(request);
      if (userRatelimitCount <= -1) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 }
        );
      }
    } catch (e) {
      console.error("Rate limit check failed:", e);
    }
  }

  try {
    const body: ExpectedRequest = await request.json();

    // Basic validation to ensure it looks like tyre stats
    if (!body.tyreData || !body.raceConfig || !body.tyrePreferences) {
      return NextResponse.json(
        { error: "Invalid request format. Missing tyre stats data." },
        { status: 400 }
      );
    }

    // Construct a specific prompt for the AI based on the data
    const prompt = `
      Analyze the following tyre strategy data for a race and provide a brief strategic summary.
      
      Race Laps: ${body.raceConfig.RaceLaps}
      Tyre Preferences: ${JSON.stringify(body.tyrePreferences)}
      Tyre Data (Wear per lap, etc): ${JSON.stringify(body.tyreData)}
      
      Please suggest the optimal strategy and explain why. Keep it concise.
    `;

    const aiResponse = await CallHCAI(prompt);

    if (!aiResponse.ok) {
      const text = await aiResponse.text();
      console.error("AI API Error Response:", text);
      throw new Error(`AI API returned ${aiResponse.status}: ${text}`);
    }

    const aiData = await aiResponse.json();
    const suggestion =
      aiData.choices?.[0]?.message?.content || "No suggestion generated.";

    return NextResponse.json({
      suggestion: suggestion,
      ratelimitCount: userRatelimitCount,
    });
  } catch (error) {
    console.error("Error processing AI request:", error);
    return NextResponse.json(
      {
        error: `Internal Server Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
