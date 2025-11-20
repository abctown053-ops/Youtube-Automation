
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { GlobalSettings, ProjectPlan, AudioPlan } from "../types";

// Initialize the Gemini API client
// The API key is expected to be in the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const outputSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    projectTitle: { type: Type.STRING },
    settings: {
      type: Type.OBJECT,
      properties: {
        style: { type: Type.STRING },
        ratio: { type: Type.STRING },
        voice: { type: Type.STRING },
      },
      required: ["style", "ratio", "voice"],
    },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sceneNumber: { type: Type.INTEGER },
          voiceOverScript: { type: Type.STRING, description: "The exact spoken text for this scene. Keep it punchy (1-2 sentences)." },
          imagePrompt: { type: Type.STRING, description: "Detailed visual description for image generation. Must be 'Generator Ready' with quality keywords." },
          estimatedDuration: { type: Type.NUMBER, description: "Estimated duration in seconds based on word count (approx 150 wpm)." }
        },
        required: ["sceneNumber", "voiceOverScript", "imagePrompt", "estimatedDuration"],
      },
    },
    metadata: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A catchy, clickbait-optimized title." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4-5 relevant SEO tags." },
        description: { type: Type.STRING, description: "A short SEO description for the video." },
      },
      required: ["title", "tags", "description"],
    },
    audio: {
      type: Type.OBJECT,
      properties: {
        bgmOption1: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            description: { type: Type.STRING },
            prompt: { type: Type.STRING, description: "Technical prompt for AI music generator. Must include keywords like 'Instrumental', 'Royalty Free', 'No Vocals'." }
          },
          required: ["mood", "description", "prompt"]
        },
        bgmOption2: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            description: { type: Type.STRING },
            prompt: { type: Type.STRING, description: "Alternative technical prompt with a different energy/mood." }
          },
          required: ["mood", "description", "prompt"]
        },
        sfx: {
          type: Type.ARRAY,
          items: { type: Type.STRING, description: "Specific sound effect description suitable for the video content." }
        }
      },
      required: ["bgmOption1", "bgmOption2", "sfx"]
    }
  },
  required: ["projectTitle", "settings", "scenes", "metadata", "audio"],
};

const audioPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    bgmOption1: {
      type: Type.OBJECT,
      properties: {
        mood: { type: Type.STRING },
        description: { type: Type.STRING },
        prompt: { type: Type.STRING, description: "Technical prompt for AI music generator. Must include keywords like 'Instrumental', 'Royalty Free', 'No Vocals'." }
      },
      required: ["mood", "description", "prompt"]
    },
    bgmOption2: {
      type: Type.OBJECT,
      properties: {
        mood: { type: Type.STRING },
        description: { type: Type.STRING },
        prompt: { type: Type.STRING, description: "Alternative technical prompt with a different energy/mood." }
      },
      required: ["mood", "description", "prompt"]
    },
    sfx: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "Specific sound effect description suitable for the video content." }
    }
  },
  required: ["bgmOption1", "bgmOption2", "sfx"]
};

export const generateVideoPlan = async (config: GlobalSettings): Promise<ProjectPlan> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    You are the "Ultimate YouTube Automation Engine". Your goal is to reduce the user's workload to ZERO.
    
    **PHASE 1: CONTEXT**
    Input Type: ${config.isScriptProvided ? "Full Script provided by user" : "Topic provided by user"}
    Input Content: "${config.topicOrScript}"
    
    **PHASE 2: GLOBAL SETTINGS**
    Visual Style: ${config.visualStyle}
    Aspect Ratio: ${config.aspectRatio}
    Voice Persona: ${config.voicePersona}
    
    **YOUR TASK:**
    ${config.isScriptProvided 
      ? `1. **EXTREME GRANULARITY (Line-by-Line)**: You MUST break down the provided script into the smallest possible logical segments (individual sentences or short phrases). 
         - Create a SEPARATE SCENE for **EVERY SINGLE SENTENCE**. 
         - **DO NOT** group multiple sentences into one scene. 
         - The user requires a specific image for every line of text to ensure perfect 1:1 pacing.
         - If a sentence is long, split it into two scenes.` 
      : `1. Write a compelling script based on the topic. 
         - Break the script down into many short, punchy scenes (1 sentence per scene max).`}

    2. Generate highly detailed, "Generator Ready" image prompts for *each* resulting scene.
       - The prompt must visually represent the specific text of that scene.
       - Enforce the Global Visual Style: ${config.visualStyle}.
    3. Ensure SUBJECT CONSISTENCY (e.g., if Scene 1 introduces a character, subsequent scenes must describe the same character).
    4. Estimate duration for each scene based on word count.
    5. Generate metadata (Title, Tags, Description).

    **6. ACT AS AN AUDIO ENGINEER & MUSIC SUPERVISOR:**
       - Analyze the video context and emotional arc.
       - Provide 2 DISTINCT options for Background Music (BGM) that are safe for YouTube (Copyright-Free).
       - OPTION 1: Mood A (e.g., Cinematic/Atmospheric).
       - OPTION 2: Mood B (e.g., Intense/Upbeat).
       - For each option, write a specific PROMPT for AI Music Generators (like Suno/Stable Audio/MusicGen).
       - MANDATORY KEYWORDS for prompts: "Instrumental", "Royalty-Free", "No Vocals", "High Quality".
       - Suggest 3 specific Sound Effects (SFX) that would enhance the storytelling.

    **CRITICAL RULES:**
    - **Granularity is King:** One Sentence = One Scene.
    - Image prompts must include quality keywords (8k, cinematic, lighting details).
    - Audio prompts must be technical and ready to copy-paste.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: outputSchema,
        systemInstruction: "You are an expert Video Director, Scriptwriter, and Audio Engineer AI.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as ProjectPlan;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateAudioGuidance = async (context: string): Promise<AudioPlan> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    You are an expert "AI Audio Director & Sound Engineer" specializing in YouTube content.
    
    **CONTEXT:**
    The user is creating a video about: "${context}"

    **YOUR TASK:**
    1. Analyze the context to understand the required mood, tempo, and atmosphere.
    2. Provide 2 DISTINCT options for Background Music (BGM) prompts.
       - Option 1: Primary mood (e.g., suspenseful, cinematic).
       - Option 2: Alternative mood (e.g., fast-paced, energetic).
    3. Write TECHNICAL prompts for AI Music Generators (Suno, Stable Audio, MusicGen).
       - MUST include keywords: "Instrumental", "Royalty-Free", "No Vocals", "High Quality".
    4. Suggest 3 specific Sound Effects (SFX) that fit this specific context.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: audioPlanSchema,
        systemInstruction: "You are an expert Audio Engineer. Generate technical audio prompts.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }
    return JSON.parse(text) as AudioPlan;
  } catch (error) {
    console.error("Gemini Audio Guidance Error:", error);
    throw error;
  }
};

export const generateSceneImage = async (prompt: string, ratio: string, style: string): Promise<string> => {
  // Sanitize ratio to ensure it matches Imagen supported values
  let validRatio = '16:9';
  if (ratio.includes('9:16')) validRatio = '9:16';
  else if (ratio.includes('16:9')) validRatio = '16:9';
  else if (ratio.includes('1:1')) validRatio = '1:1';
  else if (ratio.includes('4:3')) validRatio = '4:3';
  else if (ratio.includes('3:4')) validRatio = '3:4';

  // Explicitly prepend the style to the prompt to ensure it's applied
  const styledPrompt = `High quality, ${style} style. ${prompt}`;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: styledPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: validRatio as any,
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
      throw new Error("No image generated");
    }
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Imagen API Error:", error);
    throw error;
  }
};

// Helper to map friendly names to API voice names
const getVoiceName = (persona: string): string => {
  // Standard Personas
  if (persona.includes("Deep Male")) return 'Fenrir';
  if (persona.includes("Energetic Female")) return 'Kore';
  if (persona.includes("Soft Storyteller")) return 'Puck';
  if (persona.includes("Professional Narrator")) return 'Charon';
  if (persona.includes("Hype Beast")) return 'Zephyr';

  // Creative Named Personas
  if (persona.includes("Marcus")) return 'Fenrir';
  if (persona.includes("Sarah")) return 'Kore';
  if (persona.includes("The Oracle")) return 'Charon';
  if (persona.includes("Axel")) return 'Zephyr';
  if (persona.includes("Emma")) return 'Puck';
  if (persona.includes("Leo")) return 'Fenrir';
  if (persona.includes("Zeus")) return 'Fenrir';
  if (persona.includes("Chloe")) return 'Kore';
  if (persona.includes("Viktor")) return 'Charon';
  if (persona.includes("Luna")) return 'Puck';
  if (persona.includes("Titan")) return 'Zephyr';
  if (persona.includes("Nova")) return 'Kore';
  if (persona.includes("Sage")) return 'Charon';

  return 'Puck'; // Default
};

// Helper to Convert Base64 to Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper to create a WAV blob from PCM data (Little Endian 16-bit)
const createWavBlob = (pcmData: Uint8Array, sampleRate: number = 24000): Blob => {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Function to write strings
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // File size - 8
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // Write PCM data
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
};

export const generateVoiceOver = async (text: string, persona: string): Promise<string> => {
  const voiceName = getVoiceName(persona);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    // The API returns raw PCM data (no header). We need to wrap it in a WAV container.
    const pcmData = base64ToUint8Array(base64Audio);
    const wavBlob = createWavBlob(pcmData);
    
    // Create a URL for the blob
    return URL.createObjectURL(wavBlob);
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};

export const generateBackgroundMusic = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      contents: `Create a short, high-quality audio soundscape or musical motif that matches this description: "${prompt}". It should be instrumental background music. Do not speak. Just audio.`,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "You are a music synthesizer. You generate audio soundscapes and music. You do not speak.",
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    // The native audio model often outputs at 24kHz or similar. 
    const pcmData = base64ToUint8Array(base64Audio);
    const wavBlob = createWavBlob(pcmData, 24000);
    
    return URL.createObjectURL(wavBlob);
  } catch (error) {
    console.error("Gemini Music Gen Error:", error);
    throw error;
  }
};
