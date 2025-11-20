import React, { useState } from 'react';
import { generateBackgroundMusic } from '../services/geminiService';
import { Music, Volume2, Loader2, Sparkles, Download } from 'lucide-react';

const AudioDirectorStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedTracks, setGeneratedTracks] = useState<{url: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setGeneratedTracks([]);

    try {
      // Request 2 different tracks concurrently
      const [track1, track2] = await Promise.all([
        generateBackgroundMusic(prompt + " (Variation A)"),
        generateBackgroundMusic(prompt + " (Variation B)")
      ]);
      
      setGeneratedTracks([
        { url: track1, name: "Track A" },
        { url: track2, name: "Track B" }
      ]);

    } catch (err: any) {
      console.error(err);
      setError('Failed to generate music. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/10 text-pink-400 mb-4">
          <Music size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white">No-Copyright BG Music Generator</h2>
        <p className="text-slate-400 mt-2">Create unique, copyright-free background music & soundscapes.</p>
      </div>

      <div className="space-y-6">
        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Music Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
            placeholder="e.g., Lo-fi hip hop beat, chill atmosphere, rain sounds in background..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] ${
            isLoading || !prompt.trim()
            ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
            : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>Composing...</span>
            </>
          ) : (
            <>
              <Sparkles size={24} />
              <span>Generate Music</span>
            </>
          )}
        </button>

        {/* Results Section */}
        {generatedTracks.length > 0 && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-500">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Volume2 className="text-pink-400" size={20} />
              Generated Results
            </h3>

            {generatedTracks.map((track, index) => (
              <div key={index} className="bg-slate-950 rounded-xl border border-slate-800 p-4 transition-all hover:border-pink-500/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full">
                    {track.name}
                  </span>
                  <a 
                    href={track.url}
                    download={`bg_music_generated_${index + 1}.wav`}
                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <Download size={14} /> Download WAV
                  </a>
                </div>
                
                <audio controls src={track.url} className="w-full h-8 opacity-90" />
              </div>
            ))}
            
            <p className="text-xs text-center text-slate-500 mt-4">
              * These tracks are AI-generated and royalty-free.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioDirectorStudio;