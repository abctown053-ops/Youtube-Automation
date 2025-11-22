
import React, { useState } from 'react';
import { GlobalSettings, AspectRatio, DEFAULT_STYLES, VOICE_OPTIONS } from '../types';
import { Sparkles, Youtube, FileText, Settings2 } from 'lucide-react';

interface SetupFormProps {
  onSubmit: (settings: GlobalSettings) => void;
  isLoading: boolean;
}

const SetupForm: React.FC<SetupFormProps> = ({ onSubmit, isLoading }) => {
  const [mode, setMode] = useState<'topic' | 'script'>('topic');
  const [content, setContent] = useState('');
  const [style, setStyle] = useState(DEFAULT_STYLES[0]);
  const [voice, setVoice] = useState(VOICE_OPTIONS[0].id);
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.WIDE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    onSubmit({
      topicOrScript: content,
      isScriptProvided: mode === 'script',
      visualStyle: style,
      aspectRatio: ratio,
      voicePersona: voice
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
          <Settings2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white">Project Configuration</h2>
        <p className="text-slate-400 mt-2">Configure your global video settings to begin automation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Input Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('topic')}
            className={`flex items-center justify-center gap-2 py-3 rounded-md transition-all ${
              mode === 'topic' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles size={18} />
            <span>Idea / Topic</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('script')}
            className={`flex items-center justify-center gap-2 py-3 rounded-md transition-all ${
              mode === 'script' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText size={18} />
            <span>Existing Script</span>
          </button>
        </div>

        {/* Main Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {mode === 'topic' ? 'Video Topic' : 'Paste Your Script'}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            placeholder={mode === 'topic' ? "e.g., The History of Cyberpunk 2077..." : "Paste your full script here..."}
            required
          />
        </div>

        {/* Dropdowns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Visual Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {DEFAULT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Voice Persona</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <optgroup label="Standard (Free)">
                {VOICE_OPTIONS.filter(v => v.category === 'Standard (Free)').map(v => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </optgroup>
              <optgroup label="Premium (High Quality)">
                {VOICE_OPTIONS.filter(v => v.category === 'Premium (High Quality)').map(v => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => setRatio(AspectRatio.WIDE)}
              className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center transition-all ${
                ratio === AspectRatio.WIDE ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-950 hover:border-slate-600'
              }`}
            >
              <div className="w-16 h-9 border-2 border-current rounded-sm mb-2"></div>
              <span className="text-sm font-medium">16:9 (Long Form)</span>
            </div>
            <div 
              onClick={() => setRatio(AspectRatio.SHORTS)}
              className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center transition-all ${
                ratio === AspectRatio.SHORTS ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-950 hover:border-slate-600'
              }`}
            >
              <div className="w-9 h-16 border-2 border-current rounded-sm mb-2"></div>
              <span className="text-sm font-medium">9:16 (Shorts)</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !content}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] ${
            isLoading 
            ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing & Generating...</span>
            </>
          ) : (
            <>
              <Youtube size={24} />
              <span>Generate Video Plan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SetupForm;
