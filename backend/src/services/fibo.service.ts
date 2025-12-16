// FIBO Service - Image Generation Logic

import axios from 'axios';
import { VisualParams, ReframeParams } from "../types";

const FAL_KEY = process.env.FAL_API_KEY || process.env.FAL_KEY;
const FAL_MODEL_URL = "https://queue.fal.run/fal-ai/fast-sdxl"; // Costs ~$0.002 per image

export async function generateImage(visualParams: VisualParams): Promise<string> {
    if (!FAL_KEY) {
        console.warn("Missing FAL_API_KEY, using fallback");
        return `https://source.unsplash.com/1600x900/?${visualParams.scene_type},${visualParams.emotion}`;
    }

    const prompt = constructPrompt(visualParams);

    try {
        const response = await axios.post(
            FAL_MODEL_URL,
            {
                prompt: prompt,
                negative_prompt: "blurry, low quality, text, watermark, ugly, distorted",
                image_size: "landscape_16_9",
                num_inference_steps: 25,
                guidance_scale: 7.5
            },
            {
                headers: {
                    "Authorization": `Key ${FAL_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Fal queue usage: usually requires polling if using .queue, but .run or sync endpoint preferred for chat.
        // Queue endpoint returns an ID and we poll.
        // "queue.fal.run" is async.
        // Let's use the result directly if it waits, or handle polling.
        // For simplicity in this demo, I'll assume fast-sdxl returns quickly or use the `sync` endpoint if available?
        // Fal recommended pattern is submit -> poll.
        // Let's implement a simple poller.

        const requestId = response.data.request_id;
        if (!requestId) {
            // Maybe it returned image directly?
            if (response.data.images && response.data.images[0]) {
                return response.data.images[0].url;
            }
            throw new Error("No request ID or image returned");
        }

        return await pollFalResult(requestId);

    } catch (error) {
        console.error("FAL AI generation error:", error);
        return `https://source.unsplash.com/1600x900/?${visualParams.scene_type},${visualParams.emotion}`;
    }
}

export async function reframeImage(
    originalUrl: string,
    reframeParams: ReframeParams
): Promise<string> {
    // For reframing, we ideally want img2img, but let's do text2image with modified prompt for now
    // because we don't store the original prompt easily (unless we add it to Session).
    // We'll approximate a "Reframed" prompt.

    // Note: In a real app we'd fetch the original prompt from DB. 
    // For now, let's create a prompt that emphasizes the REFRAME.

    if (!FAL_KEY) return originalUrl;

    const mood = reframeParams.hope_level > 0.6 ? "hopeful, bright, divine light" : "moody, atmospheric";
    const intensity = reframeParams.intensity_level > 0.6 ? "intense, vibrant, high contrast" : "soft, muted, pastel";

    const prompt = `A landscape transformation, ${mood}, ${intensity}, artistic masterpiece, 8k`;

    // Call generate logic again (simplified)
    try {
        const response = await axios.post(
            FAL_MODEL_URL,
            {
                prompt: prompt,
                negative_prompt: "blurry, ugly",
                image_size: "landscape_16_9"
            },
            { headers: { "Authorization": `Key ${FAL_KEY}` } }
        );

        const requestId = response.data.request_id;
        return await pollFalResult(requestId);

    } catch (error) {
        console.error("Reframe error:", error);
        return originalUrl;
    }
}

// Helper: Construct Prompt
function constructPrompt(params: VisualParams): string {
    return `${params.scene_type} landscape that represents ${params.emotion} emotion. 
    Lighting: ${params.light_level > 0.5 ? 'bright' : 'dim'}. 
    Colors: ${params.color_palette}. 
    Style: cinematic, 8k, unreal engine 5 render, ${params.openness > 0.5 ? 'wide angle, vast' : 'claustrophobic, tight frame'}. 
    ${params.contrast > 0.7 ? 'high contrast' : 'soft lighting'}.`;
}

// Helper: Poll Fal Result
async function pollFalResult(requestId: string): Promise<string> {
    const statusUrl = `https://queue.fal.run/fal-ai/fast-sdxl/requests/${requestId}/status`;
    const headers = { "Authorization": `Key ${FAL_KEY}` };

    for (let i = 0; i < 20; i++) { // Max 20 attempts (20 seconds)
        await new Promise(r => setTimeout(r, 1000));
        const res = await axios.get(statusUrl, { headers });

        if (res.data.status === "COMPLETED") {
            const resultUrl = `https://queue.fal.run/fal-ai/fast-sdxl/requests/${requestId}`;
            const finalRes = await axios.get(resultUrl, { headers });
            return finalRes.data.images[0].url;
        }
        if (res.data.status === "FAILED") {
            throw new Error("Fal generation failed");
        }
    }
    throw new Error("Fal generation timeout");
}
