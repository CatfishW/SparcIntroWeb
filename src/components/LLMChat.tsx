import { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Cpu, Activity, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export function LLMChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<'OFFLINE' | 'CONNECTING' | 'ONLINE' | 'ERROR'>('CONNECTING');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setSystemStatus('CONNECTING');
        const response = await fetch('https://game.agaii.org/llm/v1/models');
        if (!response.ok) throw new Error('Failed to fetch models');
        
        const data = await response.json();
        const availableModels = data.data || [];
        setModels(availableModels);
        
        if (availableModels.length > 0) {
          setSelectedModel(availableModels[0].id);
        }
        setSystemStatus('ONLINE');
        
        setMessages([
          { role: 'system', content: `CONNECTION ESTABLISHED.\nNODE: ACTIVE\nMODEL: ${availableModels[0]?.id || 'UNKNOWN'}\nAWAITING INPUT...` }
        ]);
      } catch (err) {
        console.error('Error fetching models:', err);
        setSystemStatus('ERROR');
        setError('UPLINK FAILURE: COULD NOT RETRIEVE MODELS');
      }
    };

    fetchModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !selectedModel) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    setError(null);

    const apiMessages = newMessages.filter(m => m.role !== 'system');

    try {
      const response = await fetch('https://game.agaii.org/llm/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: apiMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let assistantContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const delta = data.choices[0]?.delta?.content || '';
              assistantContent += delta;
              
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content = assistantContent;
                return updated;
              });
            } catch (e) {
              console.warn('Could not parse SSE line:', line, e);
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'UNKNOWN';
      setError(`TRANSMISSION ERROR: ${errorMessage}`);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden font-mono text-slate-300 relative">
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-red-500/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-500/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-500/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-red-500/50" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40 text-xs tracking-widest uppercase">
        <div className="flex items-center gap-3 text-red-400">
          <Terminal className="w-4 h-4" />
          <span>NEURAL_LINK_INTERFACE</span>
        </div>
        <div className="flex items-center gap-4">
          {models.length > 0 && (
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-black/50 border border-white/10 text-slate-400 px-2 py-1 rounded outline-none focus:border-red-500/50 transition-colors"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.id}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              systemStatus === 'ONLINE' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
              systemStatus === 'CONNECTING' ? 'bg-yellow-500 animate-pulse' : 
              'bg-slate-600'
            }`} />
            <span className={systemStatus === 'ONLINE' ? 'text-red-400' : 'text-slate-500'}>
              {systemStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className={`flex items-center gap-2 mb-1 text-[10px] tracking-widest opacity-60 ${
              msg.role === 'user' ? 'text-blue-400' : 
              msg.role === 'system' ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {msg.role === 'user' ? (
                <><span>OPERATOR</span><Activity className="w-3 h-3" /></>
              ) : msg.role === 'system' ? (
                <><span>SYSTEM</span><Terminal className="w-3 h-3" /></>
              ) : (
                <><Cpu className="w-3 h-3" /><span>AI_AGENT</span></>
              )}
            </div>
            <div className={`max-w-[85%] p-4 rounded-lg whitespace-pre-wrap leading-relaxed text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-900/20 border border-blue-500/30 text-blue-100' 
                : msg.role === 'system'
                ? 'bg-yellow-900/20 border border-yellow-500/30 text-yellow-200/80 font-bold'
                : 'bg-red-900/10 border border-red-500/20 text-slate-300 backdrop-blur-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1 text-[10px] tracking-widest opacity-60 text-red-400">
              <Cpu className="w-3 h-3" /><span>AI_AGENT</span>
            </div>
            <div className="max-w-[85%] p-4 rounded-lg bg-red-900/10 border border-red-500/20 text-slate-300">
              <span className="flex gap-1">
                <span className="w-1.5 h-4 bg-red-500/50 animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-4 bg-red-500/50 animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-4 bg-red-500/50 animate-pulse" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Bar */}
      {error && (
        <div className="bg-red-950/50 border-t border-red-500/50 p-2 px-4 flex items-center gap-3 text-red-400 text-xs tracking-wider">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/60 backdrop-blur-md relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50" />
        <div className="flex items-center gap-4 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/50 font-bold">
            &gt;
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping || systemStatus !== 'ONLINE'}
            placeholder="ENTER COMMAND..."
            className="flex-1 bg-transparent border border-white/10 hover:border-white/20 focus:border-red-500/50 rounded pl-10 pr-4 py-3 outline-none transition-colors text-sm tracking-wide disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || systemStatus !== 'ONLINE'}
            className="group flex items-center justify-center p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 rounded transition-all disabled:opacity-50 disabled:hover:bg-red-500/10 disabled:hover:border-red-500/30"
          >
            <Send className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
          </button>
        </div>
      </form>

    </div>
  );
}
