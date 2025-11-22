
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { VOICE_OPTIONS } from '../types';
import { generateVoiceOver } from '../services/geminiService';
import { Mic, Download, Loader2, Sparkles, Volume2, Search, CheckCircle2, Trash2, Copy, User, Play, StopCircle } from 'lucide-react';

const VoiceOverStudio: React.FC = () => {
  // State
  const [script, setScript] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState(VOICE_OPTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Male' | 'Female'>('All');
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview State
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Ref to track the latest preview request to handle race conditions
  const latestPreviewRequestRef = useRef<string | null>(null);

  const MAX_CHARS = 50000;
  const PREVIEW_TEXT = "Welcome to text to speech AI tool for Naeem Ullah";

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Helper to parse voice label into Name and Style
  const parseVoiceLabel = (label: string) => {
    let name = label;
    let style = "General";

    if (label.includes('(')) {
      const parts = label.split('(');
      name = parts[0].trim();
      style = parts[1].replace(')', '').trim();
    } else if (label.includes('-')) {
      const parts = label.split('-');
      name = parts[0].trim();
      style = parts[1].trim();
    }

    return { name, style };
  };

  // Filter voices
  const filteredVoices = useMemo(() => {
    return VOICE_OPTIONS.filter(voice => {
      const matchesSearch = voice.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = 
        activeFilter === 'All' ? true :
        activeFilter === 'Male' ? voice.gender === 'male' :
        voice.gender === 'female';
      
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  // Handle selecting a voice (No audio playback)
  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
  };

  // Handle previewing a voice (Audio playback on icon click)
  const handleVoicePreview = async (e: React.MouseEvent, voiceId: string) => {
    e.stopPropagation(); // Prevent triggering selection

    // If currently playing this voice, stop it
    if (previewingVoiceId === voiceId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPreviewingVoiceId(null);
      setIsPreviewLoading(false);
      return;
    }

    // Stop any other playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    latestPreviewRequestRef.current = voiceId;
    setPreviewingVoiceId(voiceId);
    setIsPreviewLoading(true);

    try {
      // Generate the specific preview text
      const url = await generateVoiceOver(PREVIEW_TEXT, voiceId);

      // Only play if this request is still the latest one
      if (latestPreviewRequestRef.current === voiceId) {
        const audio = new Audio(url);
        audioRef.current = audio;
        
        setIsPreviewLoading(false);
        
        await audio.play();
        
        audio.onended = () => {
          setPreviewingVoiceId(null);
        };
        audio.onerror = () => {
          setPreviewingVoiceId(null);
          setIsPreviewLoading(false);
        };
      }
    } catch (err) {
      console.error("Preview failed", err);
      if (latestPreviewRequestRef.current === voiceId) {
        setIsPreviewLoading(false);
        setPreviewingVoiceId(null);
      }
    }
  };

  const handleGenerate = async () => {
    if (!script.trim()) return;
    setIsLoading(true);
    setError(null);
    setGeneratedAudioUrl(null);

    try {
      const url = await generateVoiceOver(script, selectedVoiceId);
      setGeneratedAudioUrl(url);
    } catch (err: any) {
      console.error(err);
      let msg = 'Failed to generate voice over. Please try again.';
      if (err.message) {
         msg = err.message;
      } else if (err.toString().includes('{')) {
        try {
           const match = err.toString().match(/(\{.*\})/);
           if (match) {
             const jsonErr = JSON.parse(match[1]);
             if (jsonErr.error && jsonErr.error.message) {
                msg = jsonErr.error.message;
             }
           }
        } catch (e) {}
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(script);
  };

  const selectedVoiceDetails = VOICE_OPTIONS.find(v => v.id === selectedVoiceId) || VOICE_OPTIONS[0];
  const { name: selectedName } = parseVoiceLabel(selectedVoiceDetails.label);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      
      {/* --- VOICE SELECTION CARD --- */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700 bg-gray-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="text-purple-400" size={24} />
              Select Speaker
            </h2>
            
            {/* Search & Filter */}
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search voices..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              
              <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                {['All', 'Male', 'Female'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      activeFilter === filter 
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Voice Grid */}
        <div className="p-6 bg-gray-900/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
            {filteredVoices.map((voice) => {
              const { name, style } = parseVoiceLabel(voice.label);
              const isSelected = selectedVoiceId === voice.id;
              const isPreviewing = previewingVoiceId === voice.id;

              return (
                <div 
                  key={voice.id}
                  onClick={() => handleVoiceSelect(voice.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all text-left group relative cursor-pointer ${
                    isSelected 
                      ? 'bg-purple-900/30 border-purple-500 ring-1 ring-purple-500/50' 
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                >
                  {/* Avatar / Preview Button */}
                  <button
                    onClick={(e) => handleVoicePreview(e, voice.id)}
                    className="relative shrink-0 w-10 h-10 rounded-full outline-none focus:ring-2 ring-purple-500 overflow-hidden"
                    title="Click to preview voice"
                  >
                    <img 
                      src={voice.avatarSrc} 
                      alt={name} 
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isSelected ? '' : 'opacity-90 group-hover:opacity-100'}`}
                    />
                    
                    {/* Idle State: Hover to Play */}
                    {!isPreviewing && !isPreviewLoading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={14} className="text-white fill-white ml-0.5" />
                      </div>
                    )}

                    {/* Loading Spinner */}
                    {isPreviewing && isPreviewLoading && (
                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 size={16} className="text-white animate-spin" />
                       </div>
                    )}

                    {/* Playing State: Stop Button */}
                    {isPreviewing && !isPreviewLoading && (
                        <div className="absolute inset-0 bg-purple-500/80 flex items-center justify-center backdrop-blur-sm">
                          <StopCircle size={16} className="text-white" />
                        </div>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-bold truncate ${isSelected ? 'text-purple-200' : 'text-gray-200'}`}>{name}</div>
                    <div className="text-[10px] text-gray-500 truncate">{style}</div>
                  </div>

                  {/* Selected Checkmark (Top Right of Card) */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-purple-500 bg-purple-500/10 rounded-full p-0.5">
                      <CheckCircle2 size={12} />
                    </div>
                  )}
                </div>
              );
            })}
            {filteredVoices.length === 0 && (
               <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                 No voices found. Try a different filter.
               </div>
            )}
          </div>
        </div>
      </div>

      {/* --- INPUT & GENERATION CARD --- */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mic className="text-purple-400" size={24} />
            Your Script
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-700">
              {script.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
            <button onClick={() => setScript('')} className="text-gray-500 hover:text-red-400 transition-colors p-1" title="Clear">
              <Trash2 size={18} />
            </button>
            <button onClick={handleCopyScript} className="text-gray-500 hover:text-white transition-colors p-1" title="Copy">
              <Copy size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Enter your text here to generate speech..."
            className="w-full h-48 bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg leading-relaxed transition-all"
          />
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm">
              Error: {error}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !script.trim()}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${
                isLoading || !script.trim()
                ? 'bg-gray-700 cursor-not-allowed text-gray-500' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Generating Voiceover...</span>
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  <span>Generate Audio</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- OUTPUT CARD --- */}
      {generatedAudioUrl && (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl p-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shrink-0">
              <Volume2 size={24} className="text-white" />
            </div>
            
            <div className="flex-1 w-full">
              <h3 className="text-lg font-bold text-white mb-2">Voiceover Ready</h3>
              <audio controls src={generatedAudioUrl} className="w-full h-10" />
            </div>

            <a 
              href={generatedAudioUrl}
              download={`voiceover_${selectedName.replace(/\s+/g, '_')}.wav`}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors border border-gray-600 shadow-sm whitespace-nowrap"
            >
              <Download size={20} />
              Download WAV
            </a>
          </div>
        </div>
      )}

    </div>
  );
};

export default VoiceOverStudio;
