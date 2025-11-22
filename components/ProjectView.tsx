
import React from 'react';
import { ProjectPlan, Scene } from '../types';
import { Copy, Clock, Image as ImageIcon, Mic, Hash, Tag, Download, Sparkles, Wand2, Play, Loader2, Music, Volume2, FileText, Check, Upload } from 'lucide-react';
import { generateSceneImage, generateVoiceOver } from '../services/geminiService';

interface ProjectViewProps {
  plan: ProjectPlan;
  onReset: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ plan, onReset }) => {
  
  const [generatedImages, setGeneratedImages] = React.useState<Record<number, string>>({});
  const [generatingImages, setGeneratingImages] = React.useState<Record<number, boolean>>({});
  
  const [generatedAudio, setGeneratedAudio] = React.useState<Record<number, string>>({});
  const [generatingAudio, setGeneratingAudio] = React.useState<Record<number, boolean>>({});
  
  const [copiedState, setCopiedState] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(id);
    setTimeout(() => setCopiedState(null), 2000);
  };

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${plan.projectTitle.replace(/\s+/g, '_').toLowerCase()}_plan.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleGenerateImage = async (sceneNumber: number, prompt: string) => {
    setGeneratingImages(prev => ({ ...prev, [sceneNumber]: true }));
    try {
      // Pass the visual style from settings to the service
      const imageUrl = await generateSceneImage(prompt, plan.settings.ratio, plan.settings.style);
      setGeneratedImages(prev => ({ ...prev, [sceneNumber]: imageUrl }));
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setGeneratingImages(prev => ({ ...prev, [sceneNumber]: false }));
    }
  };

  const handleGenerateAudio = async (sceneNumber: number, text: string) => {
    setGeneratingAudio(prev => ({ ...prev, [sceneNumber]: true }));
    try {
      const audioUrl = await generateVoiceOver(text, plan.settings.voice);
      setGeneratedAudio(prev => ({ ...prev, [sceneNumber]: audioUrl }));
    } catch (error) {
      console.error(error);
      alert("Failed to generate audio. Please try again.");
    } finally {
      setGeneratingAudio(prev => ({ ...prev, [sceneNumber]: false }));
    }
  };

  const handleFileUpload = (sceneNumber: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGeneratedAudio(prev => ({ ...prev, [sceneNumber]: url }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <div className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-1">Project Plan</div>
          <h1 className="text-3xl font-bold text-white">{plan.projectTitle}</h1>
          <div className="flex gap-4 mt-3 text-sm text-slate-400">
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700/50">{plan.settings.style}</span>
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700/50">{plan.settings.ratio}</span>
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700/50">{plan.settings.voice}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={downloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 font-medium"
          >
            <Download size={18} />
            Export JSON
          </button>
          <button 
            onClick={onReset}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-900/20"
          >
            New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Scenes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Clock className="text-indigo-400" size={24} />
               Scene Breakdown
             </h2>
             <span className="text-slate-400 text-sm">{plan.scenes.length} Scenes Generated</span>
          </div>

          {plan.scenes.map((scene) => (
            <div key={scene.sceneNumber} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden transition-all hover:border-indigo-500/30 shadow-md">
              {/* Scene Header */}
              <div className="bg-slate-950/50 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
                <span className="font-bold text-indigo-400 tracking-wide">SCENE {scene.sceneNumber}</span>
                <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded text-xs font-mono text-white border border-slate-700">
                  <Clock size={12} />
                  <span>{scene.estimatedDuration}s</span>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Voice Over Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <Mic size={16} className="text-purple-400" />
                      Script / Audio
                    </label>
                    <button 
                      onClick={() => copyToClipboard(scene.voiceOverScript, `script-${scene.sceneNumber}`)}
                      className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      {copiedState === `script-${scene.sceneNumber}` ? <span className="text-green-400">Copied!</span> : <><Copy size={12} /> Copy Text</>}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg text-slate-300 text-lg font-medium border border-slate-800 leading-relaxed">
                    "{scene.voiceOverScript}"
                  </div>
                  
                  {/* Audio Generation Controls */}
                  <div className="flex items-center gap-3 pt-2">
                     {generatedAudio[scene.sceneNumber] ? (
                        <div className="flex items-center gap-3 w-full bg-slate-800/50 p-2 rounded-lg border border-slate-700 animate-in fade-in">
                           <audio 
                             controls 
                             src={generatedAudio[scene.sceneNumber]} 
                             className="h-8 w-full opacity-90"
                           />
                           <a 
                              href={generatedAudio[scene.sceneNumber]}
                              download={`voiceover_scene_${scene.sceneNumber}.wav`}
                              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
                              title="Download WAV"
                           >
                              <Download size={16} />
                           </a>
                           {/* Allow replacing the audio even if generated */}
                           <label className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600 cursor-pointer" title="Upload Custom Audio">
                              <Upload size={16} />
                              <input 
                                type="file" 
                                accept="audio/*" 
                                hidden 
                                onChange={(e) => handleFileUpload(scene.sceneNumber, e)} 
                              />
                           </label>
                        </div>
                     ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGenerateAudio(scene.sceneNumber, scene.voiceOverScript)}
                            disabled={generatingAudio[scene.sceneNumber]}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600/90 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-900/20"
                          >
                             {generatingAudio[scene.sceneNumber] ? (
                               <>
                                 <Loader2 size={14} className="animate-spin" />
                                 <span>Generating Audio...</span>
                               </>
                             ) : (
                               <>
                                 <Mic size={14} />
                                 <span>Generate AI Voice</span>
                               </>
                             )}
                          </button>
                          
                          <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all border border-slate-700 cursor-pointer">
                             <Upload size={14} />
                             <span>Upload Audio</span>
                             <input 
                               type="file" 
                               accept="audio/*" 
                               hidden 
                               onChange={(e) => handleFileUpload(scene.sceneNumber, e)} 
                             />
                          </label>
                        </div>
                     )}
                  </div>
                </div>

                {/* Image Prompt Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <ImageIcon size={16} className="text-blue-400" />
                      Visual Description
                    </label>
                    <button 
                      onClick={() => copyToClipboard(scene.imagePrompt, `img-${scene.sceneNumber}`)}
                      className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      {copiedState === `img-${scene.sceneNumber}` ? <span className="text-green-400">Copied!</span> : <><Copy size={12} /> Copy Prompt</>}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg text-slate-400 text-sm border border-slate-800">
                    {scene.imagePrompt}
                  </div>

                   {/* Image Generator Controls */}
                   <div className="pt-2">
                     {generatedImages[scene.sceneNumber] ? (
                       <div className="relative group rounded-lg overflow-hidden border border-slate-700 animate-in fade-in">
                         <img 
                           src={generatedImages[scene.sceneNumber]} 
                           alt={`Scene ${scene.sceneNumber}`} 
                           className="w-full h-auto object-cover"
                         />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                           <a 
                             href={generatedImages[scene.sceneNumber]} 
                             download={`scene_${scene.sceneNumber}.jpg`}
                             className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                             title="Download Image"
                           >
                             <Download size={24} />
                           </a>
                           <button 
                             onClick={() => handleGenerateImage(scene.sceneNumber, scene.imagePrompt)}
                             className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                             title="Regenerate"
                           >
                             <Wand2 size={24} />
                           </button>
                         </div>
                       </div>
                     ) : (
                        <button
                          onClick={() => handleGenerateImage(scene.sceneNumber, scene.imagePrompt)}
                          disabled={generatingImages[scene.sceneNumber]}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20"
                        >
                          {generatingImages[scene.sceneNumber] ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Generating Visual...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={14} />
                              <span>Generate Scene Image</span>
                            </>
                          )}
                        </button>
                     )}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Audio Director & Metadata */}
        <div className="space-y-6">
          
           {/* Audio Director Card */}
           <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6 shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
               <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                 <Music size={24} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-white">Audio Director</h3>
                 <p className="text-xs text-slate-400">Music & SFX Suggestions</p>
               </div>
            </div>

            {/* BGM Option 1 */}
            <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Option A: {plan.audio.bgmOption1.mood}</span>
               </div>
               <p className="text-xs text-slate-400 italic">{plan.audio.bgmOption1.description}</p>
               <div className="relative group bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <p className="text-xs font-mono text-slate-300 break-words leading-relaxed">
                    {plan.audio.bgmOption1.prompt}
                  </p>
                  <button 
                    onClick={() => copyToClipboard(plan.audio.bgmOption1.prompt, 'bgm1')}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-400 rounded hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
                    title="Copy Music Prompt"
                  >
                    {copiedState === 'bgm1' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  </button>
               </div>
            </div>

             {/* BGM Option 2 */}
             <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Option B: {plan.audio.bgmOption2.mood}</span>
               </div>
               <p className="text-xs text-slate-400 italic">{plan.audio.bgmOption2.description}</p>
               <div className="relative group bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <p className="text-xs font-mono text-slate-300 break-words leading-relaxed">
                    {plan.audio.bgmOption2.prompt}
                  </p>
                  <button 
                    onClick={() => copyToClipboard(plan.audio.bgmOption2.prompt, 'bgm2')}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-400 rounded hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
                    title="Copy Music Prompt"
                  >
                     {copiedState === 'bgm2' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  </button>
               </div>
            </div>

            {/* SFX Section */}
            <div className="pt-4 border-t border-slate-800">
               <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-300">
                 <Volume2 size={16} className="text-pink-400" />
                 Sound Effects (SFX)
               </div>
               <ul className="space-y-2">
                 {plan.audio.sfx.map((sfx, i) => (
                   <li key={i} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded border border-slate-800/50 text-xs text-slate-300">
                     <span className="text-pink-500 font-bold">•</span>
                     {sfx}
                   </li>
                 ))}
               </ul>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
               <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                 <Tag size={24} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-white">Metadata</h3>
                 <p className="text-xs text-slate-400">SEO Optimization</p>
               </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Title</label>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm text-white font-medium flex justify-between items-start gap-2 group">
                {plan.metadata.title}
                <button 
                  onClick={() => copyToClipboard(plan.metadata.title, 'title')}
                  className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                   <Copy size={14} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed relative group h-24 overflow-y-auto custom-scrollbar">
                {plan.metadata.description}
                 <button 
                  onClick={() => copyToClipboard(plan.metadata.description, 'desc')}
                  className="absolute top-2 right-2 bg-slate-800 p-1.5 rounded text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                   <Copy size={12} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {plan.metadata.tags.map(tag => (
                  <span key={tag} className="bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectView;
