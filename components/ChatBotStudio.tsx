
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Copy, Check, Sparkles, Globe, Brain, ExternalLink, Loader2 } from 'lucide-react';
import { sendChatRequest } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatBotStudio: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI Script Assistant. \n\nI can help you:\n- Brainstorm viral video ideas\n- Write engaging scripts and hooks\n- Structure your content for high retention\n\nWhat are we working on today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Features
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useDeepSearch, setUseDeepSearch] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: input.trim(), 
      timestamp: Date.now() 
    };
    
    // Optimistic update
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      // Call the service with history and current options
      const response = await sendChatRequest(messages, userMsg.text, {
        webSearch: useWebSearch,
        deepSearch: useDeepSearch
      });
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        sources: response.sources
      }]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: "Chat cleared. How can I help you with your next script?",
      timestamp: Date.now()
    }]);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] flex flex-col bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in">
      
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
             <Bot size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Script Assistant</h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Powered by Gemini 2.5</span>
              {useDeepSearch && <span className="bg-purple-500/20 text-purple-300 px-1.5 rounded border border-purple-500/30">Thinking</span>}
              {useWebSearch && <span className="bg-blue-500/20 text-blue-300 px-1.5 rounded border border-blue-500/30">Web</span>}
            </div>
          </div>
        </div>
        <button 
          onClick={handleClearChat}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
          title="Clear Chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-900">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                  <Sparkles size={14} className="text-white" />
                </div>
              )}
              
              <div className={`group relative max-w-[85%] flex flex-col gap-2`}>
                {/* Bubble */}
                <div className={`p-5 rounded-2xl shadow-md ${
                  isUser 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-7 font-sans">
                    {msg.text}
                  </div>
                </div>

                {/* Sources (if any) */}
                {msg.sources && msg.sources.length > 0 && (
                   <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-500 mb-2 font-semibold">
                        <Globe size={12} />
                        <span>Sources found:</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {msg.sources.map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 hover:underline truncate"
                          >
                            <ExternalLink size={10} />
                            <span className="truncate">{source.title}</span>
                          </a>
                        ))}
                      </div>
                   </div>
                )}

                {/* Action Buttons (Copy) */}
                {!isUser && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      {copiedId === msg.id ? 'Copied' : 'Copy Text'}
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                  <User size={14} className="text-gray-300" />
                </div>
              )}
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex gap-4 justify-start animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="bg-gray-800 p-4 rounded-2xl rounded-bl-sm border border-gray-700 flex items-center gap-3">
               <div className="flex space-x-1">
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
               </div>
               {(useWebSearch || useDeepSearch) && (
                 <span className="text-xs text-gray-500 font-medium">
                    {useDeepSearch ? 'Thinking deeply & ' : ''}
                    {useWebSearch ? 'Searching web...' : 'Processing...'}
                 </span>
               )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 space-y-3 shrink-0">
        
        {/* Controls */}
        <div className="flex items-center gap-3 px-1">
          <button
            onClick={() => setUseWebSearch(!useWebSearch)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              useWebSearch 
              ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
              : 'bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            <Globe size={14} />
            Web Search
            {useWebSearch && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>}
          </button>

          <button
            onClick={() => setUseDeepSearch(!useDeepSearch)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              useDeepSearch 
              ? 'bg-purple-600/20 text-purple-400 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
              : 'bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            <Brain size={14} />
            Deep Search
            {useDeepSearch && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>}
          </button>
        </div>

        {/* Input Box */}
        <div className="relative max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all overflow-hidden shadow-inner">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                useWebSearch 
                ? "Ask anything (e.g., 'Latest trends in tech...')" 
                : "Ask me to write a script about..."
              }
              className="w-full max-h-[200px] bg-transparent p-3 pl-4 text-gray-200 placeholder-gray-500 outline-none resize-none text-sm custom-scrollbar leading-relaxed"
              rows={1}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              !input.trim() || isLoading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-500">
          AI can make mistakes. Please review generated scripts.
        </p>
      </div>
    </div>
  );
};

export default ChatBotStudio;
