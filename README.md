# Consultoria - Gestão Organizacional

Uma plataforma de gestão organizacional com agentes de IA que ajudam a organizar estruturas empresariais, definir KPIs, gerenciar tarefas e mapear processos através de interfaces conversacionais.

## 🌟 Funcionalidades

### Organização
- **Início**: Colete informações básicas da organização (nome, descrição, website, arquivos estratégicos)
- **Base**: Defina pilares fundamentais da organização
- **Áreas**: Cadastre e gerencie diferentes áreas de atuação

### Gestão por Área
- **KPIs**: Defina indicadores de desempenho por área
- **Tarefas**: Gerencie tarefas específicas de cada área
- **Processos**: Mapeie workflows visuais com etapas customizáveis

### Conversação Geral
- **Conversar**: Chat geral com acesso a todos os dados da organização
- Faça perguntas sobre qualquer aspecto cadastrado
- Obtenha insights e sugestões do assistente de IA

## 🚀 Tecnologias

- **Next.js 14+** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Gemini AI** - Integração com IA
- **Local Storage** - Persistência de dados (migrável)

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- Uma chave de API do Google Gemini

### Passos

1. Clone ou navegue até o diretório do projeto:
```bash
cd consultoria-app
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a API Key do Gemini:
```bash
cp .env.local.example .env.local
```

Edite `.env.local` e adicione sua chave:
```env
NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_aqui
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse http://localhost:3000 no navegador

## 🎯 Como Usar

### Primeiro Acesso

1. Digite seu nome/apelido na tela de boas-vindas
2. Você será direcionado para a página Início

### Configuração Inicial

1. **Início**: Configure informações básicas da organização
2. **Base**: Defina pilares organizacionais
3. **Áreas**: Cadastre áreas de atuação (Marketing, TI, RH, etc.)

### Gerenciamento

4. **KPIs**: Selecione uma área e defina indicadores
5. **Tarefas**: Cadastre tarefas por área
6. **Processos**: Mapeie workflows com arrastar e soltar

### Conversa com IA

- Use o chat no rodapé de cada página para interação contextual
- Vá em "Conversar" para perguntas gerais sobre toda a organização

## 🏗 Estrutura do Projeto

```
consultoria-app/
├── app/                      # Páginas Next.js (App Router)
│   ├── areas/               # Página de áreas
│   ├── base/                # Página de pilares
│   ├── conversar/           # Chat geral
│   ├── inicio/              # Página inicial
│   ├── kpis/                # Página de KPIs
│   ├── processos/           # Mapeamento de processos
│   ├── tarefas/             # Página de tarefas
│   └── welcome/             # Tela de boas-vindas
├── components/              # Componentes React
│   ├── chat/               # Componentes de chat
│   ├── layout/             # Layouts e sidebars
│   └── ui/                 # Componentes UI reutilizáveis
├── lib/                     # Lógica de negócio
│   ├── ai/                 # Integração com Gemini
│   ├── storage/            # Abstração de banco de dados
│   ├── types/              # TypeScript types
│   └── utils/              # Funções utilitárias
└── public/                  # Arquivos estáticos
```

## 🤖 Agentes de IA

### Organization Agent
- Coleta informações organizacionais
- Extrai pilares e áreas
- Analisa documentos estratégicos

### KPI Agent
- Ajuda a definir indicadores relevantes
- Valida KPIs contra contexto organizacional
- Identifica lacunas de medição

### Task Agent
- Auxilia na criação de tarefas
- Valida tarefas contra KPIs
- Identifica gaps de cobertura

### Process Mapping Agent
- Guia mapeamento de workflows
- Sugere conexões entre atividades
- Valida processos contra objetivos

### General Agent
- Acesso a todos os dados
- Responde perguntas gerais
- Oferece insights cruzados

## 💾 Armazenamento de Dados

Os dados são armazenados no **localStorage** do navegador. A arquitetura modular permite fácil migração para:

- PostgreSQL
- MongoDB
- Firebase
- Supabase

Para migrar, basta implementar a interface `IDatabase` em `lib/storage/database.ts`.

## 🎨 Customização

### Cores

O tema azul pode ser customizado em `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    // Modifique os valores aqui
  }
}
```

### Agentes

Customize os prompts dos agentes em `lib/ai/gemini.ts`:

```typescript
const AGENT_PROMPTS = {
  // Edite os prompts aqui
}
```

## 📝 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa linter
```

## 🔒 Segurança

- A API Key do Gemini é exposta no cliente (NEXT_PUBLIC_*)
- Para produção, considere usar rotas de API do Next.js
- Dados armazenados localmente no navegador
- Sem autenticação real (apenas nickname)

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

Não esqueça de adicionar a variável de ambiente `NEXT_PUBLIC_GEMINI_API_KEY` no painel da Vercel.

## 📄 Licença

Este projeto foi criado como exemplo educacional.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

## 📧 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

Desenvolvido com ❤️ usando Next.js e Gemini AI
