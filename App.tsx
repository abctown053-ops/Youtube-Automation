
import React, { useState } from 'react';
import SetupForm from './components/SetupForm';
import ProjectView from './components/ProjectView';
import VoiceOverStudio from './components/VoiceOverStudio';
import AudioDirectorStudio from './components/AudioDirectorStudio';
import { GlobalSettings, ProjectPlan } from './types';
import { generateVideoPlan } from './services/geminiService';
import { Zap, Mic, Youtube, Music } from 'lucide-react';

const App: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<ProjectPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'automation' | 'voice' | 'audio'>('automation');

  const handleFormSubmit = async (settings: GlobalSettings) => {
    setLoading(true);
    setError(null);
    try {
      const plan = await generateVideoPlan(settings);
      setCurrentPlan(plan);
    } catch (err: any) {
      setError("Failed to generate the project plan. Please try again. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentPlan(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleReset}
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg">
                <Zap size={20} className="text-white" fill="currentColor" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">AutoStream<span className="text-indigo-400">.ai</span></span>
            </div>
            <div className="text-xs font-medium text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              v1.2.0 Beta
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm text-center animate-in fade-in">
            {error}
          </div>
        )}

        {!currentPlan ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
            <div className="text-center mb-8">
              {activeTab === 'automation' && (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">YouTube Automation</span> Engine
                  </h1>
                  <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Turn ideas or scripts into production-ready plans instantly. 
                    We handle the scripting, visual direction, and metadata.
                  </p>
                </>
              )}
              {activeTab === 'voice' && (
                <>
                   <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AI Voice Studio</span>
                  </h1>
                  <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Generate ultra-realistic voiceovers for your existing scripts in seconds.
                    Select a persona and let the AI speak.
                  </p>
                </>
              )}
              {activeTab === 'audio' && (
                <>
                   <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Music Generator</span>
                  </h1>
                  <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Create unique, copyright-free background music and soundscapes.
                    Just describe the mood, and we'll compose it.
                  </p>
                </>
              )}
            </div>

            {/* Tab Switcher */}
            <div className="bg-slate-900/50 p-1 rounded-xl border border-slate-800 mb-8 flex gap-1 flex-wrap justify-center">
              <button
                onClick={() => setActiveTab('automation')}
                className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'automation'
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Youtube size={16} />
                Automation Engine
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'voice'
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Mic size={16} />
                Voice Studio
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'audio'
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Music size={16} />
                Music Generator
              </button>
            </div>

            <div className="w-full">
              {activeTab === 'automation' && <SetupForm onSubmit={handleFormSubmit} isLoading={loading} />}
              {activeTab === 'voice' && <VoiceOverStudio />}
              {activeTab === 'audio' && <AudioDirectorStudio />}
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-10 duration-500">
             <ProjectView plan={currentPlan} onReset={handleReset} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
