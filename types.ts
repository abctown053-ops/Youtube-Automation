
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

export interface VoiceOption {
  label: string;
  id: string;
  category: 'Standard (Free)' | 'Premium (High Quality)';
  avatarSrc: string;
  gender: 'male' | 'female';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: { title: string; uri: string }[];
}

// Using Standard ElevenLabs System IDs which are free and don't count towards Custom Voice limits
export const VOICE_OPTIONS: VoiceOption[] = [
  // Standard Gemini Voices
  { label: "Deep Male (Documentary)", id: "Deep Male (Documentary)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg", gender: 'male' },
  { label: "Energetic Female (Vlog)", id: "Energetic Female (Vlog)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg", gender: 'female' },
  { label: "Soft Storyteller (ASMR)", id: "Soft Storyteller (ASMR)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/women/63.jpg", gender: 'female' },
  { label: "Professional Narrator", id: "Professional Narrator", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/men/85.jpg", gender: 'male' },
  { label: "Hype Beast (Shorts)", id: "Hype Beast (Shorts)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/men/12.jpg", gender: 'male' },
  { label: "Marcus (Deep Narrative)", id: "Marcus (Deep Narrative)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/men/22.jpg", gender: 'male' },
  { label: "Sarah (Energetic Vlog)", id: "Sarah (Energetic Vlog)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/women/28.jpg", gender: 'female' },
  { label: "The Oracle (Mysterious)", id: "The Oracle (Mysterious)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/women/90.jpg", gender: 'female' },
  { label: "Axel (High Energy)", id: "Axel (High Energy)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/men/55.jpg", gender: 'male' },
  { label: "Emma (Soft Spoken)", id: "Emma (Soft Spoken)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/women/12.jpg", gender: 'female' },
  { label: "Leo (Documentary)", id: "Leo (Documentary)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/men/67.jpg", gender: 'male' },
  { label: "Zeus (Epic Movie Trailer)", id: "Zeus (Epic Movie Trailer)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/men/45.jpg", gender: 'male' },
  { label: "Chloe (Friendly Guide)", id: "Chloe (Friendly Guide)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/women/33.jpg", gender: 'female' },
  { label: "Viktor (Tech Reviewer)", id: "Viktor (Tech Reviewer)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/men/29.jpg", gender: 'male' },
  { label: "Luna (Bedtime Stories)", id: "Luna (Bedtime Stories)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/women/68.jpg", gender: 'female' },
  { label: "Titan (Motivational)", id: "Titan (Motivational)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/men/78.jpg", gender: 'male' },
  { label: "Nova (News Anchor)", id: "Nova (News Anchor)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/women/54.jpg", gender: 'female' },
  { label: "Sage (Philosophical)", id: "Sage (Philosophical)", category: 'Standard (Free)', avatarSrc: "https://randomuser.me/api/portraits/men/91.jpg", gender: 'male' },

  // Premium ElevenLabs Voices (Standard System Voices)
  { label: "Adam - Deep Narrative", id: "pNInz6obpgDQGcFmaJgB", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/54.jpg", gender: 'male' },
  { label: "Rachel - Motivational", id: "21m00Tcm4TlvDq8ikWAM", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/women/47.jpg", gender: 'female' },
  { label: "Antoni - Professional", id: "ErXwobaYiN019PkySvjV", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/33.jpg", gender: 'male' },
  { label: "Josh - Conversational", id: "TxGEqnHWrfWFTfGW9XjX", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/88.jpg", gender: 'male' },
  { label: "Arnold - Epic Movie Trailer", id: "VR6AewGX3KQ92AmB6mPV", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/99.jpg", gender: 'male' },
  { label: "Bella - Emotional Drama", id: "EXAVITQu4vr4xnSDxMaL", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/women/52.jpg", gender: 'female' },
  { label: "Domi - Strong Female", id: "AZnzlk1XvdvUeBnXmlld", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/women/22.jpg", gender: 'female' },
  { label: "Elli - Young Storyteller", id: "MF3mGyEYCl7XYWbV9V6O", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/women/10.jpg", gender: 'female' },
  { label: "Sam - American Generic", id: "yoZ06aMxZJJ28mfd3POQ", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/65.jpg", gender: 'male' },
  { label: "Charlie - Australian Casual", id: "IKne3meq5aSn9XLyUdCD", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/15.jpg", gender: 'male' },
  { label: "Clyde - Deep & Rough", id: "2EiwWnXFnvU5JabPnv8n", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/76.jpg", gender: 'male' },
  { label: "Dave - British & Deep", id: "CYw3kZ02Hs0563khs1Fj", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/42.jpg", gender: 'male' },
  { label: "Fin - Irish Energetic", id: "D38z5RcWu1voky8WSVqt", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/18.jpg", gender: 'male' },
  { label: "Freya - Hypnotic", id: "jsCqWAovK2LkecY7zXl4", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/women/75.jpg", gender: 'female' },
  { label: "George - British Academic", id: "JBFqnCBsd6RMkjVDRZzb", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/82.jpg", gender: 'male' },
  { label: "Giovanni - Foreigner", id: "zcAOhNBS3c14rBihAFp1", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/24.jpg", gender: 'male' },
  { label: "Glinda - Witchy/Shrill", id: "z9fAny952GXov8NuuUNO", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/women/88.jpg", gender: 'female' },
  { label: "Grace - Southern US", id: "oWAxZDx7w5VEj9dCyTzz", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/women/36.jpg", gender: 'female' },
  { label: "Harry - Anxious", id: "SOYHLrjzK2X1ezoPC6cr", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/19.jpg", gender: 'male' },
  { label: "Liam - Young American", id: "TX3LPaxmHKxFdv7VOQHJ", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/11.jpg", gender: 'male' },
  { label: "Matilda - Children's Story", id: "XrExE9yKIg1WjnnlVkGX", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/women/9.jpg", gender: 'female' },
  { label: "Michael - Audiobook", id: "flq6f7yk4E4fJM5XTYuZ", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/20.jpg", gender: 'male' },
  { label: "Mimi - Childish", id: "zrHiDhphv9ZnVXBqCLjz", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/women/15.jpg", gender: 'female' },
  { label: "Nicole - Whisper", id: "piTKgcLEGmPE4e6mEKli", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/women/42.jpg", gender: 'female' },
  { label: "Patrick - Shouty", id: "ODq5zmih8GrVes37Dizj", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/60.jpg", gender: 'male' },
  { label: "Ryan - Soldier", id: "wViXBPUzp2ZZixB1xQuM", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/71.jpg", gender: 'male' },
  { label: "Serena - Pleasant", id: "pMsXgVXv3BLzUgSXRplE", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/women/50.jpg", gender: 'female' },
  { label: "Thomas - Calm", id: "GBv7mTt5Xyp17vdpf686", category: 'Premium (High Quality)', avatarSrc: "https://randomuser.me/api/portraits/men/39.jpg", gender: 'male' }
];
