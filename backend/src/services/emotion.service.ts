// Emotion Service - Mapping logic

import { EmotionData, VisualParams } from "../types";

/**
 * Maps emotion analysis data to FIBO visual parameters.
 */
export function mapEmotionToVisualParams(emotionData: EmotionData): VisualParams {
    const { primary_emotion, intensity, scene_metaphor } = emotionData;

    // Default
    let params: VisualParams = {
        scene_type: "abstract",
        emotion: primary_emotion,
        camera_angle: "medium",
        light_level: 0.5,
        color_palette: "neutral_gray",
        openness: 0.5,
        contrast: 0.5
    };

    // Logic to adjust params based on emotion
    switch (primary_emotion) {
        case "joy":
        case "hope":
        case "gratitude":
            params.light_level = 0.8 + (intensity * 0.2);
            params.color_palette = "warm_gold";
            params.openness = 0.8;
            params.contrast = 0.6;
            params.scene_type = "meadow";
            break;

        case "sadness":
        case "grief":
        case "loneliness":
            params.light_level = 0.3;
            params.color_palette = "cool_blue";
            params.openness = 0.4;
            params.contrast = 0.3;
            params.scene_type = "ocean";
            break;

        case "anger":
        case "frustration":
            params.light_level = 0.4;
            params.color_palette = "hot_red";
            params.openness = 0.2; // Claustrophobic
            params.contrast = 0.9; // Harsh
            params.scene_type = "volcano";
            break;

        case "anxiety":
        case "fear":
        case "confusion":
            params.light_level = 0.2;
            params.color_palette = "dull_gray";
            params.openness = 0.1;
            params.contrast = 0.8;
            params.scene_type = "forest"; // Dark forest
            break;

        case "calm":
        case "peace":
            params.light_level = 0.6;
            params.color_palette = "soft_blue";
            params.openness = 0.7;
            params.contrast = 0.4;
            params.scene_type = "lake";
            break;
    }

    return params;
}
