import React, { useState, useRef, useEffect } from 'react';
import { User, Supplier } from '../types';
import { BrainCircuit, Send, Sparkles, User as UserIcon, Bot, Terminal, HelpCircle } from 'lucide-react';

interface AIAssistantTabProps {
  currentUser: User;
  suppliers: Supplier[];
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

export default function AIAssistantTab({ currentUser, suppliers }: AIAssistantTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `### Welcome to Vanguard Risk Intelligence Copilot
      
How can I assist you with your procurement and risk management workflows today?
      
**Suggested Queries:**
* **Summarize Risk:** "Analyze risk vectors for Vortex Steel Corp"
* **Remediations:** "Draft mitigation strategy for high-dependency nodes"
* **Global Alerts:** "Assess impact of active typhoons on suppliers"`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setInputValue('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Find if message matches a supplier name to load context
      const matchedSupplier = suppliers.find(s =>
        userMsg.toLowerCase().includes(s.name.toLowerCase()) ||
        userMsg.toLowerCase().includes(s.id.toLowerCase())
      );

      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          customPrompt: userMsg,
          supplierId: matchedSupplier?.id || undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { sender: 'assistant', text: data.text }]);
      } else {
        setMessages(prev => [...prev, { sender: 'assistant', text: 'Error executing AI action. Please review environment settings.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'assistant', text: 'Connecting to server-side model. Retrying...' }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse simple markdown markers for visual layout
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-bold text-white mt-3 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-xs font-semibold text-slate-200 mt-2 mb-1 uppercase tracking-wider">{line.replace('#### ', '')}</h4>;
      }
      
      // Bullet lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const cleanLine = line.trim().replace(/^[\*\-]\s+/, '');
        return (
          <li key={idx} className="list-disc list-inside ml-2 my-1 text-xs text-slate-300">
            {parseBold(cleanLine)}
          </li>
        );
      }

      return <p key={idx} className="text-xs text-slate-300 my-1">{parseBold(line)}</p>;
    });
  };

  const parseBold = (str: string) => {
    const parts = str.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-white">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 font-sans h-[calc(100vh-140px)] flex flex-col justify-between">
      {/* Intro Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-blue-500" />
          Intelligence Copilot
        </h1>
        <p className="text-sm text-slate-400">Interact with the mathematical risk scoring model, draft warnings, or run dual-sourcing recommendations using server-side Gemini AI.</p>
      </div>

      {/* Chat Messages Frame */}
      <div className="flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-4 ${m.sender === 'user' ? 'justify-end' : ''}`}>
              {/* Bot Avatar */}
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[80%] rounded-2xl p-4 border text-slate-300 ${
                m.sender === 'user'
                  ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none'
                  : 'bg-slate-950 border-slate-800/80 rounded-tl-none space-y-1'
              }`}>
                {m.sender === 'user' ? (
                  <p className="text-xs font-semibold leading-relaxed">{m.text}</p>
                ) : (
                  renderMessageContent(m.text)
                )}
              </div>

              {/* User Avatar */}
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5 font-mono text-xs font-bold uppercase">
                  {currentUser.role.substring(0, 2)}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl rounded-tl-none p-4 text-xs text-slate-500 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200" />
                </div>
                <span>Copilot is formulating mitigation steps...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Suggested pills row */}
        <div className="px-5 py-3 border-t border-slate-800/40 bg-slate-950/20 flex gap-2 overflow-x-auto text-[11px]">
          <button
            onClick={() => handleSendMessage('Summarize Global Network Health')}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white transition whitespace-nowrap"
          >
            Network Health Summary
          </button>
          <button
            onClick={() => handleSendMessage('Recommend mitigations for high-hazard solvency nodes')}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white transition whitespace-nowrap"
          >
            Mitigate Solvency Risks
          </button>
          <button
            onClick={() => handleSendMessage('Draft cyber alert warning email for Apex Semiconductors')}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white transition whitespace-nowrap"
          >
            Draft Cyber Warning Email
          </button>
        </div>

        {/* Chat input bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex gap-2">
          <input
            type="text"
            placeholder="Type a supply chain risk query (e.g., 'Draft warning letter to Vortex Steel')..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || loading}
            className="px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-lg shadow-blue-500/10"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
