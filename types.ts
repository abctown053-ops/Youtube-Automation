
export enum AspectRatio {
  WIDE = "16:9",
  SHORTS = "9:16"
}

export interface GlobalSettings {
  topicOrScript: string;
  isScriptProvided: boolean; // true if user pasted a full script, false if just a topic
  visualStyle: string;
  aspectRatio: AspectRatio;
  voicePersona: string;
}

export interface Scene {
  sceneNumber: number;
  voiceOverScript: string;
  imagePrompt: string;
  estimatedDuration: number; // in seconds
}

export interface VideoMetadata {
  title: string;
  tags: string[];
  description: string;
}

export interface MusicPrompt {
  mood: string;
  description: string;
  prompt: string;
}

export interface AudioPlan {
  bgmOption1: MusicPrompt;
  bgmOption2: MusicPrompt;
  sfx: string[];
}

export interface ProjectPlan {
  projectTitle: string;
  settings: {
    style: string;
    ratio: string;
    voice: string;
  };
  scenes: Scene[];
  metadata: VideoMetadata;
  audio: AudioPlan;
}

export const DEFAULT_STYLES = [
  "Cyberpunk / Neon",
  "Minimalist / Clean",
  "Historical / Vintage",
  "Anime / Manga",
  "Hyper-Realistic 4K",
  "Cinematic Documentary",
  "Abstract / Geometric",
  "Corporate / Professional"
];

export const DEFAULT_VOICES = [
  "Deep Male (Documentary)",
  "Energetic Female (Vlog)",
  "Soft Storyteller (ASMR)",
  "Professional Narrator",
  "Hype Beast (Shorts)",
  "Marcus (Deep Narrative)",
  "Sarah (Energetic Vlog)",
  "The Oracle (Mysterious)",
  "Axel (High Energy)",
  "Emma (Soft Spoken)",
  "Leo (Documentary)",
  "Zeus (Epic Movie Trailer)",
  "Chloe (Friendly Guide)",
  "Viktor (Tech Reviewer)",
  "Luna (Bedtime Stories)",
  "Titan (Motivational)",
  "Nova (News Anchor)",
  "Sage (Philosophical)"
];
