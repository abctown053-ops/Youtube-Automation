import React, { useState } from 'react';
import { DEFAULT_VOICES } from '../types';
import { generateVoiceOver } from '../services/geminiService';
import { Mic, Download, Loader2, Sparkles, Volume2 } from 'lucide-react';

const VoiceOverStudio: React.FC = () => {
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState(DEFAULT_VOICES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MAX_CHARS = 10000;

  const handleGenerate = async () => {
    if (!script.trim()) return;
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const url = await generateVoiceOver(script, voice);
      setAudioUrl(url);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate voice over. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 mb-4">
          <Mic size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white">AI Voice Studio</h2>
        <p className="text-slate-400 mt-2">Transform any text into lifelike speech instantly.</p>
      </div>

      <div className="space-y-6">
        {/* Script Input */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="block text-sm font-medium text-slate-300">
              Your Script
            </label>
            <span className={`text-xs ${script.length >= MAX_CHARS ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
              {script.length} / {MAX_CHARS} characters
            </span>
          </div>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            maxLength={MAX_CHARS}
            className={`w-full h-48 bg-slate-950 border rounded-xl p-4 text-white placeholder-slate-500 transition-all resize-none custom-scrollbar ${
              script.length >= MAX_CHARS 
                ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                : 'border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            }`}
            placeholder="Paste your full script here to generate a voiceover..."
          />
          {script.length >= MAX_CHARS && (
             <p className="text-red-400 text-xs mt-1">Character limit reached.</p>
          )}
        </div>

        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Voice Persona</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {DEFAULT_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
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
          disabled={isLoading || !script.trim()}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] ${
            isLoading || !script.trim()
            ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>Generating Audio...</span>
            </>
          ) : (
            <>
              <Volume2 size={24} />
              <span>Generate Voice Over</span>
            </>
          )}
        </button>

        {/* Result Section */}
        {audioUrl && (
          <div className="mt-8 bg-slate-950 rounded-xl border border-slate-800 p-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" />
                Voice Over Ready
              </h3>
              <a 
                href={audioUrl}
                download="voiceover_studio_output.wav"
                className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Download size={14} /> Download WAV
              </a>
            </div>
            
            <audio 
              controls 
              src={audioUrl} 
              className="w-full h-10 rounded-lg" 
            />
            
            <div className="mt-4 flex justify-end">
              <a
                href={audioUrl}
                download="voiceover_studio_output.wav" 
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
              >
                <Download size={16} />
                Download Audio File
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceOverStudio;