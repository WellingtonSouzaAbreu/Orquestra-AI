'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ResizableChatContainer from '@/components/chat/ResizableChatContainer';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import { Organization, ChatMessage } from '@/lib/types';
import {
  getOrganization,
  setOrganization,
  getChatHistory,
  saveChatHistory,
} from '@/lib/storage/qdrant';
import { sendMessage } from '@/lib/ai/gemini';
import { generateId, getCurrentTimestamp } from '@/lib/storage/database';

export default function InicioPage() {
  const [organization, setOrganizationState] = useState<Organization | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') {
      sendProactiveMessage();
    }
  }, [messages]);

  useEffect(() => {
    if (organization) {
      setOrganization(organization);
    }
  }, [organization]);

  const sendProactiveMessage = async () => {
    const proactiveMessage = "Olá! Como posso ajudar a configurar sua organização hoje?";
    try {
      const response = await sendMessage(proactiveMessage, { type: 'organization', currentPage: 'inicio' });
      const newAiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.message,
        timestamp: getCurrentTimestamp(),
      };
      const updatedMessages = [...messages, newAiMessage];
      setMessages(updatedMessages);
      await saveChatHistory(updatedMessages, 'inicio');
    } catch (error) {
      console.error('Error sending proactive message:', error);
    }
  };


  const loadData = async () => {
    const org = await getOrganization();
    setOrganizationState(org);
    const chatHistory = await getChatHistory('inicio');
    setMessages(chatHistory);
  };

  const handleMessageSent = async (
    userMessage: string,
    aiResponse: string,
    actions?: Array<{ type: string; data: any }>
  ) => {
    const newMessages: ChatMessage[] = [
      {
        id: generateId(),
        role: 'user',
        content: userMessage,
        timestamp: getCurrentTimestamp(),
      },
      {
        id: generateId(),
        role: 'assistant',
        content: aiResponse,
        timestamp: getCurrentTimestamp(),
      },
    ];

    const updatedMessages = [...messages, ...newMessages];
    setMessages(updatedMessages);
    await saveChatHistory(updatedMessages, 'inicio');

    // Handle AI actions to update the UI
    if (actions && actions.length > 0) {
      for (const action of actions) {
        if (action.type === 'update_organization') {
          await handleAIUpdate(action.data);
        }
      }
    }
  };

  const handleAIUpdate = (data: Partial<Organization>) => {
    // Ensure organization exists
    if (!organization) {
      const newOrg: Organization = {
        id: generateId(),
        name: data.name || '',
        description: data.description || '',
        website: data.website || '',
        files: [],
        pillars: [],
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };
      setOrganizationState(newOrg);
    } else {
      // Update existing organization with new data
      const updated = {
        ...organization,
        ...data,
        updatedAt: getCurrentTimestamp(),
      };
      setOrganizationState(updated);
    }
  };

  const handleCreateOrganization = () => {
    if (!organization) {
      const newOrg: Organization = {
        id: generateId(),
        name: '',
        description: '',
        website: '',
        files: [],
        pillars: [],
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };
      setOrganizationState(newOrg);
    }
  };

  const handleUpdateField = (field: keyof Organization, value: string) => {
    if (organization) {
      const updated = { ...organization, [field]: value };
      setOrganizationState(updated);
    }
  };

  return (
    <AppLayout>
      <ResizableChatContainer
        content={
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Início</h1>
              <p className="text-gray-600 mb-8">
                Conte-nos sobre sua organização para começarmos.
              </p>

              {organization ? (
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Organização
                    </label>
                    <input
                      type="text"
                      value={organization.name}
                      onChange={(e) => handleUpdateField('name', e.target.value)}
                      placeholder="Digite o nome da organização..."
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={organization.description}
                      onChange={(e) => handleUpdateField('description', e.target.value)}
                      placeholder="Descreva sua organização..."
                      rows={4}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={organization.website}
                      onChange={(e) => handleUpdateField('website', e.target.value)}
                      placeholder="https://..."
                      className="input w-full"
                    />
                  </div>

                  {organization.files.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arquivos Enviados
                      </label>
                      <div className="space-y-2">
                        {organization.files.map((file) => (
                          <div key={file.id} className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              Enviado em {new Date(file.uploadedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                  <p className="text-primary-900 mb-4">
                    Você ainda não configurou sua organização. Use o chat abaixo para começar ou clique no botão:
                  </p>
                  <button onClick={handleCreateOrganization} className="btn-primary">
                    Criar Organização
                  </button>
                </div>
              )}
            </div>
          </div>
        }
        chat={
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  💬 Conversar com o Assistente
                </h2>
                <ChatMessages messages={messages} />
              </div>
            </div>
            <ChatInput
              context={{ type: 'organization', currentPage: 'inicio' }}
              onMessageSent={handleMessageSent}
            />
          </div>
        }
      />
    </AppLayout>
  );
}
