'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/storage/localStorage';

export default function WelcomePage() {
  const [nickname, setNickname] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    db.setUser({
      nickname: nickname.trim(),
      createdAt: new Date().toISOString(),
    });

    router.push('/inicio');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">
            Bem-vindo!
          </h1>
          <p className="text-gray-600">
            Para começar, nos diga como podemos te chamar:
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              Seu apelido ou nome
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Digite seu nome..."
              className="input w-full"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!nickname.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Começar
          </button>
        </form>
      </div>
    </div>
  );
}
