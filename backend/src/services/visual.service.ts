// Visual Service - FIBO parameter mapping and image generation

import axios from 'axios';

export interface VisualParams {
    scene_type: string;
    emotion: string;
    camera_angle: string;
    light_level: number;
    color_palette: string;
    openness: number;
    contrast: number;
    warmth?: number;
}

export interface FiboJson {
    prompt: string;
    camera: {
        distance: number;
        fov: number;
        angle: string;
    };
    lighting: {
        intensity: number;
        direction: string;
        color: string;
        temperature: number;
    };
    palette: {
        mood: string;
        temperature: number;
        saturation: number;
    };
    composition: {
        tension: number;
        openness: number;
        balance: string;
    };
    style: string;
}

const FAL_KEY = process.env.FAL_API_KEY || process.env.FAL_KEY;
const FAL_MODEL_URL = "https://queue.fal.run/fal-ai/fast-sdxl";

export const visualService = {
    /**
     * Map emotion vector to visual parameters
     */
    emotionsToVisualParams(emotionVector: Record<string, number>): VisualParams {
        // Get dominant emotion
        let primaryEmotion = 'calm';
        let maxScore = 0;

        for (const [emotion, score] of Object.entries(emotionVector)) {
            if (score > maxScore) {
                maxScore = score;
                primaryEmotion = emotion;
            }
        }

        // Base params
        const params: VisualParams = {
            scene_type: 'abstract_landscape',
            emotion: primaryEmotion,
            camera_angle: 'medium',
            light_level: 0.5,
            color_palette: 'neutral',
            openness: 0.5,
            contrast: 0.5,
            warmth: 0.5
        };

        // Emotion-specific adjustments
        const emotionMappings: Record<string, Partial<VisualParams>> = {
            joy: { light_level: 0.9, color_palette: 'warm_gold', openness: 0.9, warmth: 0.8, scene_type: 'sunlit_meadow' },
            hope: { light_level: 0.8, color_palette: 'warm_amber', openness: 0.8, warmth: 0.7, scene_type: 'sunrise_horizon' },
            sadness: { light_level: 0.3, color_palette: 'cool_blue', openness: 0.4, warmth: 0.3, scene_type: 'misty_ocean' },
            anxiety: { light_level: 0.2, color_palette: 'gray_teal', openness: 0.2, contrast: 0.8, scene_type: 'dark_forest' },
            anger: { light_level: 0.4, color_palette: 'hot_red', openness: 0.2, contrast: 0.9, scene_type: 'stormy_volcanic' },
            fear: { light_level: 0.1, color_palette: 'dark_purple', openness: 0.1, contrast: 0.7, scene_type: 'shadowy_cavern' },
            calm: { light_level: 0.6, color_palette: 'soft_blue', openness: 0.7, warmth: 0.5, scene_type: 'peaceful_lake' },
            confusion: { light_level: 0.4, color_palette: 'muted_gray', openness: 0.3, contrast: 0.5, scene_type: 'foggy_maze' }
        };

        const mapping = emotionMappings[primaryEmotion] || emotionMappings.calm;
        Object.assign(params, mapping);

        // Apply intensity modifier
        if (maxScore > 0.7) {
            params.contrast = Math.min(1, params.contrast + 0.2);
        }

        return params;
    },

    /**
     * Build FIBO JSON from visual params and metaphor
     */
    buildFiboJson(params: VisualParams, metaphor: string): FiboJson {
        return {
            prompt: `${params.scene_type} representing ${metaphor}. Style: cinematic, emotional, 8k render.`,
            camera: {
                distance: params.openness > 0.5 ? 0.8 : 0.3,
                fov: params.openness > 0.5 ? 70 : 40,
                angle: params.camera_angle
            },
            lighting: {
                intensity: params.light_level,
                direction: 'forward',
                color: params.warmth && params.warmth > 0.5 ? 'warm' : 'cool',
                temperature: params.warmth || 0.5
            },
            palette: {
                mood: params.color_palette,
                temperature: params.warmth || 0.5,
                saturation: 0.7
            },
            composition: {
                tension: params.contrast,
                openness: params.openness,
                balance: 'centered'
            },
            style: 'cinematic_emotional'
        };
    },

    /**
     * Apply reframe deltas to existing visual params
     */
    applyReframeDeltas(baseParams: VisualParams, deltas: Record<string, number>): VisualParams {
        const newParams = { ...baseParams };

        // Apply hope (increases light and warmth)
        if (deltas.hope !== undefined) {
            newParams.light_level = Math.min(1, baseParams.light_level + (deltas.hope * 0.4));
            newParams.warmth = Math.min(1, (baseParams.warmth || 0.5) + (deltas.hope * 0.3));
            newParams.openness = Math.min(1, baseParams.openness + (deltas.hope * 0.3));
        }

        // Apply intensity (affects contrast and camera)
        if (deltas.intensity !== undefined) {
            newParams.contrast = Math.min(1, Math.max(0, baseParams.contrast + (deltas.intensity * 0.3)));
        }

        // Apply openness
        if (deltas.openness !== undefined) {
            newParams.openness = Math.min(1, Math.max(0, baseParams.openness + deltas.openness));
        }

        // Apply warmth
        if (deltas.warmth !== undefined) {
            newParams.warmth = Math.min(1, Math.max(0, (baseParams.warmth || 0.5) + deltas.warmth));
        }

        // Direct parameter overrides
        if (deltas.light_level !== undefined) {
            newParams.light_level = Math.min(1, Math.max(0, baseParams.light_level + deltas.light_level));
        }

        return newParams;
    },

    /**
     * Get emotion-specific image from curated Unsplash collection
     */
    getEmotionImage(emotion: string): string {
        // Curated high-quality Unsplash images for each emotion
        const emotionImages: Record<string, string[]> = {
            joy: [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=900&fit=crop', // Sunny meadow
                'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&h=900&fit=crop', // Golden field
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&h=900&fit=crop', // Bright nature
            ],
            hope: [
                'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1600&h=900&fit=crop', // Sunrise
                'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1600&h=900&fit=crop', // Dawn sky
                'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&h=900&fit=crop', // Morning light
            ],
            sadness: [
                'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?w=1600&h=900&fit=crop', // Misty ocean
                'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=1600&h=900&fit=crop', // Foggy coast
                'https://images.unsplash.com/photo-1515224526905-51c7d77c7bb8?w=1600&h=900&fit=crop', // Rainy window
            ],
            anxiety: [
                'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=1600&h=900&fit=crop', // Dark forest
                'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1600&h=900&fit=crop', // Dense woods
                'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600&h=900&fit=crop', // Moody trees
            ],
            anger: [
                'https://images.unsplash.com/photo-1509635022432-0220ac12960b?w=1600&h=900&fit=crop', // Storm clouds
                'https://images.unsplash.com/photo-1527482937786-6f73e8c33f03?w=1600&h=900&fit=crop', // Lightning
                'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1600&h=900&fit=crop', // Volcanic
            ],
            fear: [
                'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1600&h=900&fit=crop', // Dark cave
                'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1600&h=900&fit=crop', // Shadows
                'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&h=900&fit=crop', // Dark night
            ],
            calm: [
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop', // Serene lake
                'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1600&h=900&fit=crop', // Still water
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop', // Peaceful beach
            ],
            confusion: [
                'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?w=1600&h=900&fit=crop', // Fog
                'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?w=1600&h=900&fit=crop', // Misty path
                'https://images.unsplash.com/photo-1422393462206-207b0fbd8d6b?w=1600&h=900&fit=crop', // Hazy
            ],
            gratitude: [
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&h=900&fit=crop', // Warm sunset
                'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&h=900&fit=crop', // Golden hour
                'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1600&h=900&fit=crop', // Beautiful forest
            ],
            love: [
                'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=1600&h=900&fit=crop', // Pink sky
                'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1600&h=900&fit=crop', // Warm light
                'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1600&h=900&fit=crop', // Flowers
            ],
            peace: [
                'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1600&h=900&fit=crop', // Mountain lake
                'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1600&h=900&fit=crop', // Waterfall
                'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1600&h=900&fit=crop', // Forest path
            ],
            loneliness: [
                'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1600&h=900&fit=crop', // Empty road
                'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=1600&h=900&fit=crop', // Solitary tree
                'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1600&h=900&fit=crop', // Quiet landscape
            ],
            frustration: [
                'https://images.unsplash.com/photo-1527482937786-6f73e8c33f03?w=1600&h=900&fit=crop', // Turbulent sky
                'https://images.unsplash.com/photo-1509635022432-0220ac12960b?w=1600&h=900&fit=crop', // Storm
                'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=1600&h=900&fit=crop', // Rough sea
            ],
            determination: [
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=900&fit=crop', // Mountain peak
                'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&h=900&fit=crop', // Summit
                'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=900&fit=crop', // Climb
            ],
            grief: [
                'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?w=1600&h=900&fit=crop', // Moody ocean
                'https://images.unsplash.com/photo-1515224526905-51c7d77c7bb8?w=1600&h=900&fit=crop', // Rain
                'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=1600&h=900&fit=crop', // Grey sea
            ]
        };

        const emotionKey = emotion.toLowerCase();
        const images = emotionImages[emotionKey] || emotionImages.calm;
        
        // Pick a random image from the emotion's collection
        return images[Math.floor(Math.random() * images.length)];
    },

    /**
     * Generate image using Fal.ai API or emotion-specific fallback
     */
    async generateImage(fiboJson: FiboJson, emotion?: string): Promise<string> {
        // Use provided emotion or extract from palette mood
        const emotionKey = emotion || fiboJson.palette.mood.replace(/_/g, ' ').split(' ')[0] || 'calm';

        if (!FAL_KEY) {
            console.warn("Missing FAL_API_KEY, using emotion-specific Unsplash image");
            return this.getEmotionImage(emotionKey);
        }

        const prompt = this.fiboJsonToPrompt(fiboJson);

        try {
            const response = await axios.post(
                FAL_MODEL_URL,
                {
                    prompt: prompt,
                    negative_prompt: "blurry, low quality, text, watermark, ugly, distorted, nsfw",
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

            const requestId = response.data.request_id;
            if (!requestId) {
                if (response.data.images && response.data.images[0]) {
                    return response.data.images[0].url;
                }
                throw new Error("No request ID or image returned");
            }

            return await this.pollFalResult(requestId);

        } catch (error) {
            console.error("FAL AI generation error:", error);
            // Fall back to emotion-specific Unsplash images
            return this.getEmotionImage(emotionKey);
        }
    },

    /**
     * Convert FIBO JSON to text prompt
     */
    fiboJsonToPrompt(fiboJson: FiboJson): string {
        const lightDesc = fiboJson.lighting.intensity > 0.6 ? 'bright, well-lit' : 'dim, atmospheric';
        const colorDesc = fiboJson.lighting.color === 'warm' ? 'warm golden tones' : 'cool blue tones';
        const openDesc = fiboJson.composition.openness > 0.5 ? 'vast, expansive' : 'intimate, enclosed';

        return `${fiboJson.prompt}. ${lightDesc}, ${colorDesc}, ${openDesc}. 
            Cinematic photography, ultra detailed, 8k resolution, emotional atmosphere.`;
    },

    /**
     * Poll Fal.ai for result
     */
    async pollFalResult(requestId: string): Promise<string> {
        const statusUrl = `https://queue.fal.run/fal-ai/fast-sdxl/requests/${requestId}/status`;
        const headers = { "Authorization": `Key ${FAL_KEY}` };

        for (let i = 0; i < 5; i++) {
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
};
