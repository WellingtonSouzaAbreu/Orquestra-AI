'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Nenhuma mensagem ainda. Comece a conversar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-4 ${
              message.role === 'user'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="text-sm font-medium mb-1">
              {message.role === 'user' ? 'Você' : 'Assistente'}
            </div>
            <div className={`prose prose-sm max-w-none ${
              message.role === 'user' ? 'prose-invert' : ''
            }`}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            <div className={`text-xs mt-2 ${
              message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
            }`}>
              {formatDate(message.timestamp)}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
