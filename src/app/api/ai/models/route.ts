import redisClient from "@/app/db/redisClient";

const GetModelsUrl =
  process.env.HC_AI_GET_MODELS_URL || "https://ai.hackclub.com/proxy/v1/models";

interface GetModelsDataType {
  id: string;
  canonical_slug: string;
  hugging_face_id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string | null;
  };
  pricing: Record<string, string>;
  top_provider: {
    context_length: number;
    max_completion_tokens: number | null;
    is_moderated: boolean;
  };
}

export async function GET() {
  try {
    // first, check if cache hits
    const cachedModels = await redisClient.get("ai_models");
    if (cachedModels) {
      return Response.json({ models: JSON.parse(cachedModels) });
    }

    const response = await fetch(GetModelsUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!data || !Array.isArray(data.data)) {
      return Response.json({ models: [] });
    }

    const filteredModels = data.data
      .filter(
        (model: GetModelsDataType) =>
          model.architecture?.input_modalities?.includes("text") &&
          model.architecture?.modality != "text+image->text+image",
      )
      .map((model: GetModelsDataType) => ({ id: model.id }));

    // cache the models for future requests
    await redisClient.set("ai_models", JSON.stringify(filteredModels), {
      EX: 60 * 60 * 12, // cache for 12 hours
    });

    return Response.json({ models: filteredModels });
  } catch (err) {
    console.error("Error fetching models:", err);
    return Response.json({ models: [] }, { status: 500 });
  }
}
