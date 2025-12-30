import OpenAI from "openai";

export const recognizeImage = async (imageSource: string | any): Promise<string> => {
  // normalize input: accept either a URL string or a discord Attachment-like object
  const normalizedUrl = typeof imageSource === 'string'
    ? imageSource
    : imageSource?.url ?? imageSource?.proxyURL ?? imageSource?.attachment ?? null;

  if (!normalizedUrl) {
    throw new Error('recognizeImage: image URL is required (pass an attachment object or a URL string)');
  }

  const openai = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY,
  });

  // Use env var so model can be updated without code changes
  const model = process.env.VISION_MODEL ?? "gpt-4o";
  const fallbackModel = process.env.VISION_MODEL_FALLBACK;

  console.log('recognizeImage: using URL', normalizedUrl, 'model', model);

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "以下の画像から文字を抽出し、順位とプレイヤー名を json 形式で返してください。" },
            { type: "image_url", image_url: { url: normalizedUrl } },
          ],
        },
      ],
    });

    const message = response.choices?.[0]?.message;
    if (message && typeof message.content === "string") {
      console.log("OCR Result:", message.content);
      return message.content;
    } else {
      return "画像の内容を認識できませんでした。";
    }
  } catch (err: any) {
    console.error("recognizeImage error:", err?.message ?? err);

    const isDeprecated = err?.message?.includes("deprecated") || err?.status === 404;
    if (isDeprecated && fallbackModel) {
      console.log(`Model ${model} unavailable; retrying with fallback ${fallbackModel}`);
      try {
        const resp = await openai.chat.completions.create({
          model: fallbackModel,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "以下の画像から文字を抽出し、順位とプレイヤー名を json 形式で返してください。" },
                { type: "image_url", image_url: { url: normalizedUrl } },
              ],
            },
          ],
        });
        const message = resp.choices?.[0]?.message;
        if (message && typeof message.content === "string") return message.content;
      } catch (e: any) {
        console.error("Fallback model failed:", e?.message ?? e);
      }
    }

    // Try to list models to help debugging
    try {
      const models = await openai.models.list();
      const modelIds = (models?.data ?? [])?.slice?.(0, 20)?.map((m: any) => m.id) ?? [];
      console.error("Available models (sample):", modelIds.join(", "));
    } catch (listErr) {
      console.error("Failed to list models:", listErr);
    }

    throw new Error(`Image recognition failed: ${err?.message ?? err}. If the error is due to a deprecated model, set VISION_MODEL or VISION_MODEL_FALLBACK env var to a supported vision-capable model.`);
  }
}