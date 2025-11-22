
import React, { useState } from 'react';
import SetupForm from './components/SetupForm';
import ProjectView from './components/ProjectView';
import VoiceOverStudio from './components/VoiceOverStudio';
import ChatBotStudio from './components/ChatBotStudio';
import { GlobalSettings, ProjectPlan } from './types';
import { generateVideoPlan } from './services/geminiService';
import { Zap, Mic, Youtube, MessageSquare } from 'lucide-react';

const App: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<ProjectPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'automation' | 'voice' | 'chat'>('automation');

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      {/* Navbar */}
      <nav className="border-b border-gray-700 bg-gray-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer z-10"
              onClick={handleReset}
            >
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Zap size={20} className="text-white" fill="currentColor" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white hidden sm:block">AutoStream<span className="text-indigo-400">.ai</span></span>
            </div>

            {/* Centered Navigation Tabs (Desktop) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center bg-gray-800 p-1 rounded-lg border border-gray-700 shadow-inner">
              <button
                onClick={() => setActiveTab('automation')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'automation'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              >
                <Youtube size={14} />
                Automation Engine
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'voice'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              >
                <Mic size={14} />
                Voice Studio
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'chat'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              >
                <MessageSquare size={14} />
                AI Chatbot
              </button>
            </div>

            {/* Right Side: Version */}
            <div className="text-xs font-medium text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700 z-10">
              v1.3.0
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden py-2 flex justify-center border-t border-gray-800">
             <div className="flex gap-1 bg-gray-800 p-1 rounded-lg border border-gray-700">
                <button onClick={() => setActiveTab('automation')} className={`p-2 rounded-md transition-colors ${activeTab === 'automation' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`} title="Automation Engine"><Youtube size={18} /></button>
                <button onClick={() => setActiveTab('voice')} className={`p-2 rounded-md transition-colors ${activeTab === 'voice' ? 'bg-purple-600 text-white' : 'text-gray-400'}`} title="Voice Studio"><Mic size={18} /></button>
                <button onClick={() => setActiveTab('chat')} className={`p-2 rounded-md transition-colors ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-400'}`} title="AI Chatbot"><MessageSquare size={18} /></button>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${activeTab === 'chat' ? 'py-4' : 'py-12'}`}>
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm text-center animate-in fade-in">
            {error}
          </div>
        )}

        {!currentPlan ? (
          <div className="flex flex-col items-center justify-center animate-in fade-in duration-500">
            
            {/* Header Text - Hidden for Chat to maximize space */}
            {activeTab !== 'chat' && (
              <div className="text-center mb-8">
                {activeTab === 'automation' && (
                  <>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                      The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">YouTube Automation</span> Engine
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
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
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                      Generate lifelike voiceovers with our premium AI voice library.
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="w-full">
              {activeTab === 'automation' && <SetupForm onSubmit={handleFormSubmit} isLoading={loading} />}
              {activeTab === 'voice' && <VoiceOverStudio />}
              {activeTab === 'chat' && <ChatBotStudio />}
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
