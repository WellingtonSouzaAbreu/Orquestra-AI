'use client';

import { useState, FormEvent } from 'react';
import { AgentContext } from '@/lib/types';
import { sendMessage } from '@/lib/ai/gemini';

interface ChatInputProps {
  context: AgentContext;
  onMessageSent?: (message: string, response: string) => void;
}

export default function ChatInput({ context, onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage, context);
      onMessageSent?.(userMessage, response.message);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem ou pergunta..."
            disabled={isLoading}
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}
