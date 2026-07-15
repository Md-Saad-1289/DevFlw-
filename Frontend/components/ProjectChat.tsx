import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Shield, User, Clock } from 'lucide-react';
import { Message, User as AuthUser } from '../types';

interface ProjectChatProps {
  messages: Message[];
  user: AuthUser;
  onSendMessage: (text: string) => Promise<void>;
}

export const ProjectChat: React.FC<ProjectChatProps> = ({
  messages,
  user,
  onSendMessage
}) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll message list to the bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    try {
      await onSendMessage(text.trim());
      setText('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="workspace-chat-box" className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col h-[520px] overflow-hidden">
      
      {/* Chat Title bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <MessageSquare className="w-4.5 h-4.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Team Workspace Chat</h3>
          <p className="text-[10px] text-slate-400">Direct, real-time sync with your project collaboration partner.</p>
        </div>
      </div>

      {/* Message Scroller */}
      <div 
        id="chat-message-scroller" 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 animate-pulse" />
            <p className="text-xs font-semibold text-slate-600">No Messages Yet</p>
            <p className="text-[10px] text-slate-400 max-w-[200px]">Say hello! Start alignment discussions, share progress links, or clarify criteria right here.</p>
          </div>
        ) : (
          messages.map(msg => {
            const id = msg._id || msg.id;
            const isMe = msg.senderEmail.toLowerCase() === user.email.toLowerCase();
            const senderInitials = msg.senderName ? msg.senderName.substring(0, 2).toUpperCase() : '??';

            return (
              <div
                id={`chat-bubble-container-${id}`}
                key={id}
                className={`flex gap-3.5 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Sender Avatar */}
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm select-none ${
                  isMe 
                    ? 'bg-indigo-600 text-white border-indigo-500' 
                    : msg.senderRole === 'developer'
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                }`}>
                  {senderInitials}
                </div>

                {/* Message Bubble box */}
                <div className="space-y-1">
                  {/* Sender Metadata */}
                  <div className={`flex items-center gap-1.5 text-[9px] font-bold ${isMe ? 'justify-end text-slate-500' : 'text-slate-600'}`}>
                    <span>{msg.senderName}</span>
                    <span className={`px-1.5 py-0.5 rounded-full border text-[8px] tracking-wider uppercase font-extrabold ${
                      msg.senderRole === 'developer'
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {msg.senderRole}
                    </span>
                  </div>

                  {/* Bubble card */}
                  <div className={`p-3.5 rounded-2xl text-xs font-sans shadow-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-200/60 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Timestamp */}
                  <div className={`text-[8px] text-slate-400 flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : ''}`}>
                    <Clock className="w-2.5 h-2.5" />
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form Footer */}
      <div className="bg-white border-t border-slate-100 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2.5 items-stretch">
          <input
            id="chat-text-input"
            type="text"
            required
            placeholder="Type a workspace update or review response..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-slate-50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 px-4 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
          />
          <button
            type="submit"
            id="send-chat-btn"
            disabled={sending || !text.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 flex items-center justify-center transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
