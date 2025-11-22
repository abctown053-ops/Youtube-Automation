
import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { GlobalSettings, ProjectPlan, AudioPlan, VOICE_OPTIONS, ChatMessage } from "../types";

// Initialize the Gemini API client
// The API key is expected to be in the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ElevenLabs API Key provided by user
const ELEVENLABS_API_KEY = "sk_027cc7d58d72b6e949861dc508c81ae54402a17708d75f53";

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
          voiceOverScript: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
          estimatedDuration: { type: Type.NUMBER },
        },
        required: ["sceneNumber", "voiceOverScript", "imagePrompt", "estimatedDuration"],
      },
    },
    metadata: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        description: { type: Type.STRING },
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
            prompt: { type: Type.STRING },
          },
          required: ["mood", "description", "prompt"],
        },
        bgmOption2: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            description: { type: Type.STRING },
            prompt: { type: Type.STRING },
          },
          required: ["mood", "description", "prompt"],
        },
        sfx: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ["bgmOption1", "bgmOption2", "sfx"],
    },
  },
  required: ["projectTitle", "settings", "scenes", "metadata", "audio"],
};

// Helper to write strings to DataView for WAV header construction
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Helper to create a valid WAV header for Raw PCM data
// Gemini TTS defaults: 24kHz, Mono (1 channel), 16-bit
const createWavHeader = (pcmLength: number, sampleRate: number = 24000, numChannels: number = 1) => {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  
  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmLength, true); // File size - 8
  writeString(view, 8, 'WAVE');
  
  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
  view.setUint16(32, numChannels * 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  
  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, pcmLength, true); // Subchunk2Size
  
  return buffer;
};

/**
 * Sends a chat message with advanced options like Web Search and Deep Search (Thinking).
 * It reconstructs the history and uses `generateContent` to allow dynamic tool configuration per message.
 */
export const sendChatRequest = async (
  history: ChatMessage[], 
  message: string, 
  options: { webSearch: boolean; deepSearch: boolean }
): Promise<{ text: string; sources?: { title: string; uri: string }[] }> => {
  
  // 1. Construct the content history
  const contents = history
    .filter(msg => msg.role === 'user' || msg.role === 'model')
    .map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

  // Add the new user message
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  // 2. Configure Tools & System Instruction
  const config: any = {
    systemInstruction: `
      You are an expert professional scriptwriter and document assistant.
      
      YOUR OUTPUT FORMAT:
      - Format your scripts exactly like a professional Text Document.
      - Use bold Headers for sections (e.g., **Introduction**, **Body**, **Conclusion**).
      - Use clean bullet points for lists.
      - Use clear paragraph breaks.
      - Do NOT use markdown code blocks (\`\`\`) for the script content unless specifically asked for code.
      - Ensure the tone is engaging, well-researched, and ready for production.
      
      YOUR ROLE:
      - Help users brainstorm viral ideas.
      - Write full, detailed scripts.
      - Structure content for high audience retention.
    `
  };

  // Enable Google Search if requested
  if (options.webSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  // Enable Thinking (Deep Search) if requested
  if (options.deepSearch) {
    config.thinkingConfig = { thinkingBudget: 2048 }; // Allocated token budget for reasoning
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: config,
    });

    let text = response.text || "I couldn't generate a response.";
    
    // Extract sources from grounding metadata if available
    let sources: { title: string; uri: string }[] | undefined;
    
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      sources = chunks
        .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
        .map((chunk: any) => ({
          title: chunk.web.title,
          uri: chunk.web.uri
        }));
      
      // Remove duplicates based on URI
      sources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);
    }

    return { text, sources };

  } catch (error) {
    console.error("Chat Gen Error:", error);
    throw error;
  }
};

/**
 * Generates a comprehensive video plan based on user settings.
 */
export const generateVideoPlan = async (settings: GlobalSettings): Promise<ProjectPlan> => {
  const model = "gemini-2.5-flash";
  
  let prompt = "";
  if (settings.isScriptProvided) {
    prompt = `
      Analyze the following script and create a video production plan.
      
      Script: "${settings.topicOrScript}"
      
      Preferences:
      - Visual Style: ${settings.visualStyle}
      - Aspect Ratio: ${settings.aspectRatio}
      - Voice Persona: ${settings.voicePersona}
      
      Break this script into logical scenes. Generate image prompts for each scene that match the visual style.
    `;
  } else {
    prompt = `
      Create a video script and production plan about this topic: "${settings.topicOrScript}"
      
      Preferences:
      - Visual Style: ${settings.visualStyle}
      - Aspect Ratio: ${settings.aspectRatio}
      - Voice Persona: ${settings.voicePersona}
      
      Write an engaging script, break it into scenes, and provide image prompts.
    `;
  }

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: outputSchema,
        systemInstruction: "You are an expert YouTube automation strategist and creative director.",
      },
    });

    if (result.text) {
      return JSON.parse(result.text) as ProjectPlan;
    }
    throw new Error("No content generated");
  } catch (error) {
    console.error("Plan Generation Error:", error);
    throw error;
  }
};

/**
 * Generates a high-quality image for a specific scene.
 */
export const generateSceneImage = async (prompt: string, ratio: string, style: string): Promise<string> => {
  try {
    // Determine aspect ratio string for Imagen
    const aspectRatio = ratio === "9:16" ? "9:16" : "16:9";
    
    const enhancedPrompt = `${prompt}. Style: ${style}. High quality, detailed, cinematic lighting.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        outputMimeType: 'image/jpeg',
      },
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64Image) throw new Error("No image generated");

    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

/**
 * Generates audio using ElevenLabs API
 */
const generateElevenLabsVoiceOver = async (text: string, voiceId: string): Promise<string> => {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.message || `ElevenLabs Error: ${response.statusText}`);
    }

    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("ElevenLabs Generation Error:", error);
    throw error;
  }
};

/**
 * Generates a voiceover using the specified AI persona.
 * Handles routing between Gemini TTS and ElevenLabs based on voice ID format.
 */
export const generateVoiceOver = async (text: string, voiceName: string): Promise<string> => {
  // 1. Check if voiceName is an ElevenLabs ID (20 chars) AND exists in our premium list
  const isPremium = VOICE_OPTIONS.some(v => v.id === voiceName && v.category.includes('Premium'));
  
  if (isPremium || /^[a-zA-Z0-9]{20}$/.test(voiceName)) {
    try {
      return await generateElevenLabsVoiceOver(text, voiceName);
    } catch (err: any) {
      console.warn("ElevenLabs failed, falling back to Gemini:", err.message);
      // Fallback to Gemini if ElevenLabs fails (e.g. Quota Exceeded)
      // We proceed to standard voice generation
    }
  }

  // 2. Fallback to Gemini TTS (Standard/Free)
  try {
    const validVoices = ['Aoede', 'Charon', 'Fenrir', 'Kore', 'Puck', 'Zephyr'];
    let apiVoice = 'Kore'; // Default

    // Try to find exact match or direct mapping
    if (validVoices.includes(voiceName)) {
      apiVoice = voiceName;
    } else {
      // Heuristic mapping from UI names
      const lower = voiceName.toLowerCase();
      // Map Premium voices to Gemini equivalents for fallback
      if (lower.includes('male') || lower.includes('deep') || lower.includes('narrative') || lower.includes('news')) apiVoice = 'Fenrir';
      else if (lower.includes('energetic') || lower.includes('hype') || lower.includes('vlog')) apiVoice = 'Charon';
      else if (lower.includes('soft') || lower.includes('asmr') || lower.includes('meditation')) apiVoice = 'Kore';
      else if (lower.includes('pro') || lower.includes('documentary') || lower.includes('tech') || lower.includes('academic')) apiVoice = 'Zephyr';
      else if (lower.includes('guide') || lower.includes('tutorial') || lower.includes('children')) apiVoice = 'Puck';
      else if (lower.includes('story') || lower.includes('book')) apiVoice = 'Aoede';
      else {
        // Deterministic fallback
        let hash = 0;
        for (let i = 0; i < voiceName.length; i++) {
           hash = voiceName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % validVoices.length;
        apiVoice = validVoices[index];
      }
    }

    const CHUNK_SIZE = 2000;
    const textChunks = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      const chunk = text.substring(i, i + CHUNK_SIZE).trim();
      if (chunk) textChunks.push(chunk);
    }

    const audioBuffers: Uint8Array[] = [];

    for (const chunk of textChunks) {
       const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        // IMPORTANT: Gemini 2.5 Flash TTS expects an array of content parts
        contents: [{
          parts: [{ text: chunk }],
        }],
        config: {
          responseModalities: ['AUDIO'], 
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: apiVoice, 
              },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        // Gemini 2.5 Flash TTS returns Raw PCM data (no header)
        // We decode the base64 to get the raw bytes
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioBuffers.push(bytes);
      } else {
        // If candidates exist but no audio, check for finish reason
        if (response.candidates?.[0]?.finishReason) {
          console.warn(`Chunk skipped. Finish reason: ${response.candidates[0].finishReason}`);
        }
      }
    }
    
    if (audioBuffers.length === 0) {
      // Be explicit about why it failed
      throw new Error("No audio generated by AI service. Please verify input text is valid and try again.");
    }

    // Calculate total length of PCM data
    const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
    
    // Construct a valid WAV header (24kHz, Mono, 16-bit)
    const headerBuffer = createWavHeader(totalLength, 24000, 1);
    const headerBytes = new Uint8Array(headerBuffer);
    
    // Combine Header + PCM Data
    const combinedBuffer = new Uint8Array(headerBytes.length + totalLength);
    combinedBuffer.set(headerBytes, 0);
    
    let offset = headerBytes.length;
    for (const buf of audioBuffers) {
      combinedBuffer.set(buf, offset);
      offset += buf.length;
    }

    // Convert back to Base64 string
    let binary = '';
    const len = combinedBuffer.byteLength;
    for (let i = 0; i < len; i++) {
       binary += String.fromCharCode(combinedBuffer[i]);
    }

    return `data:audio/wav;base64,${btoa(binary)}`;
  } catch (error) {
    console.error("Voice Generation Error:", error);
    throw error;
  }
};

// Placeholder to prevent import errors in unused components
export const generateBackgroundMusic = async (prompt: string): Promise<string> => {
  return generateVoiceOver("Music generation is currently being updated.", "Kore");
};
