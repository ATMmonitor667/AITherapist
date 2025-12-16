export type PrimaryEmotion =
  | "joy" | "sadness" | "anger" | "fear" | "anxiety"
  | "peace" | "hope" | "love" | "loneliness" | "grief"
  | "frustration" | "confusion" | "determination" | "gratitude" | "calm";

export type SecondaryEmotion =
  | "elation" | "contentment" | "relief" | "nostalgia"
  | "overwhelm" | "betrayal" | "envy" | "pride"
  | "uncertainty" | "resilience" | "clarity" | "annoyance" | "excitement"
  | "neutral";

export type SceneType =
  | "ocean" | "meadow" | "forest" | "mountain" | "room"
  | "garden" | "cliff" | "lake" | "memorial" | "cottage"
  | "park" | "volcano" | "crossroads" | "nursery" | "abstract";

export type CameraAngle = "wide" | "medium" | "close" | "dramatic_low" | "dramatic_upward" | "soft_close" | "tight_close" | "wide_panoramic";

export type ColorPalette =
  | "vibrant_multicolor" | "warm_orange" | "warm_gold"
  | "neutral_gray" | "cool_blue" | "muted_brown"
  | "hot_red" | "bold_orange" | "foggy_neutral"
  | "dull_gray" | "soft_green" | "soft_blue"
  | "pastel_warm" | "cool_white" | "mixed_warm_cool";

export interface EmotionData {
  primary_emotion: PrimaryEmotion;
  secondary_emotion: SecondaryEmotion;
  intensity: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  scene_metaphor: string;
}

export interface VisualParams {
  scene_type: SceneType;
  emotion: PrimaryEmotion;
  camera_angle: CameraAngle;
  light_level: number; // 0.0 to 1.0
  color_palette: ColorPalette;
  openness: number; // 0.0 to 1.0 (claustrophobic to vast)
  contrast: number; // 0.0 to 1.0
}

export interface ReframeParams {
  hope_level: number; // 0-100
  intensity_level: number; // 0-100
}
