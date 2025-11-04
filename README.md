# Consultoria - AI-Powered Organizational Management

An intelligent platform that helps businesses structure their operations through conversational AI. Manage organizational pillars, areas, KPIs, tasks, and processes using natural language interactions powered by Google Gemini AI.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5.9
- **Styling**: Tailwind CSS 3.4 with custom blue theme
- **AI**: Google Gemini AI (gemini-2.0-flash)
- **Validation**: Zod 4.1 for runtime type safety
- **UI Libraries**: @dnd-kit (drag-and-drop), react-markdown
- **Storage**: LocalStorage with migration-ready database abstraction

## Features

### Core Capabilities
- **Multi-Agent AI System** - 5 specialized AI agents for different organizational aspects
- **Natural Language CRUD** - Create, update, and delete entities via conversational chat
- **Visual Process Mapping** - Drag-and-drop Kanban board for workflow management
- **Context-Aware Intelligence** - AI agents understand organizational structure and relationships
- **Resizable Split-Screen** - Innovative chat interface with adjustable workspace
- **Area-Based Organization** - Filter and manage data by department/function

### Pages & Functionality

| Page | Purpose | AI Agent | Key Features |
|------|---------|----------|--------------|
| `/welcome` | User onboarding | - | Nickname-based authentication |
| `/inicio` | Organization setup | Organization | Define pillars & company info |
| `/areas` | Area management | Organization | CRUD for departments/functions |
| `/kpis` | Performance metrics | KPI | Area-specific indicators |
| `/tarefas` | Task tracking | Task | Action items per area |
| `/processos` | Process mapping | Process | Drag-drop workflow board |
| `/conversar` | General insights | General | Cross-sectional analysis |

## Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── areas/                   # Area management
│   ├── base/                    # Organizational pillars
│   ├── conversar/               # General chat & analytics
│   ├── inicio/                  # Organization setup
│   ├── kpis/                    # KPI management
│   ├── processos/               # Process mapping (drag-drop)
│   ├── tarefas/                 # Task management
│   └── welcome/                 # Onboarding
│
├── components/
│   ├── chat/                    # ChatInput, ChatMessages, ResizableChatContainer
│   ├── layout/                  # AppLayout, Sidebars
│   └── ui/                      # Reusable UI components
│
├── lib/
│   ├── ai/                      # Gemini AI integration & action extraction
│   ├── storage/                 # Database abstraction layer
│   ├── types/                   # TypeScript definitions
│   └── utils/                   # Utility functions
│
└── prompts/                     # AI agent system prompts & schemas
    ├── organizationPrompt/      # Modular agent prompts
    ├── schemas.ts               # Zod validation schemas
    └── promptBuilder.ts         # Context assembly logic
```

## How It Works

### Multi-Agent Architecture

The application uses **5 specialized AI agents**, each with specific responsibilities:

1. **Organization Agent** - Manages company info, pillars, and areas
2. **KPI Agent** - Defines performance indicators for areas
3. **Task Agent** - Creates and manages tasks
4. **Process Agent** - Maps workflows and processes
5. **General Agent** - Provides insights across entire organization

### AI Action Processing Flow

```
User types message
    ↓
ChatInput sends to Gemini AI with agent context
    ↓
AI responds with: message text + JSON action
    ↓
extractActions() validates with Zod schemas
    ↓
Page handler executes action (create/update/delete)
    ↓
LocalStorage persisted
    ↓
UI refreshes with updated data
```

### AI Response Format

```typescript
// User: "Create a KPI called Conversion Rate"
// AI responds:

"Ótimo! Vou criar esse KPI para você..."

~~~json
{
  "action": "create_kpi",
  "data": {
    "name": "Conversion Rate",
    "description": "Percentage of visitors who convert"
  }
}
~~~
```

Actions are validated using Zod schemas before execution, ensuring type safety.

### Context-Aware Intelligence

Each AI agent receives relevant context:

- **Organization data** (name, description, pillars)
- **All areas** with descriptions
- **Area-specific data** (KPIs, tasks, processes for selected area)
- **Full organizational data** (General Agent only)

This enables intelligent, contextually appropriate responses.

## Getting Started

### Prerequisites
- Node.js 18+
- Google Gemini API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Gemini API key to .env.local
```

### Environment Variables

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm start
```

## Data Model

### Entity Hierarchy

```
Organization
├── name, description, website
├── Pillars[] (core values/principles)
│   └── name, description
│
└── Areas[] (departments/functions)
    ├── name, description
    │
    ├── KPIs[] (performance metrics)
    │   └── name, description
    │
    ├── Tasks[] (action items)
    │   └── name, description
    │
    └── Processes[] (workflow steps)
        └── name, description, stage, position
```

### Core Types

```typescript
interface Organization {
  id: string;
  name: string;
  description: string;
  website: string;
  pillars: Pillar[];
}

interface Pillar {
  id: string;
  name: string;
  description: string;
}

interface Area {
  id: string;
  name: string;
  description: string;
}

interface KPI {
  id: string;
  areaId: string;  // Links to Area
  name: string;
  description: string;
}

interface Task {
  id: string;
  areaId: string;  // Links to Area
  name: string;
  description: string;
}

interface Process {
  id: string;
  areaId: string;  // Links to Area
  name: string;
  description: string;
  stage: string;   // 'planning' | 'execution' | 'delivery' | custom
  position: number; // Order within stage
}
```

## Key Concepts

### Database Abstraction

The app uses an `IDatabase` interface for storage operations:

```typescript
interface IDatabase {
  // Organization
  getOrganization(): Organization | null;
  setOrganization(org: Organization): void;

  // Areas
  getAreas(): Area[];
  createArea(area: Omit<Area, 'id' | 'createdAt'>): Area;
  updateArea(id: string, updates: Partial<Area>): void;
  deleteArea(id: string): void;

  // Similar for KPIs, Tasks, Processes...
}
```

**Current Implementation**: LocalStorage
**Future Options**: PostgreSQL, Supabase, MongoDB, Firebase

Simply swap the implementation to migrate storage backends without changing application code.

### Action Validation with Zod

All AI actions are validated at runtime:

```typescript
// Schema definition
const createKpiSchema = z.object({
  action: z.literal('create_kpi'),
  data: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

// Runtime validation
const result = createKpiSchema.safeParse(action);
if (result.success) {
  // Execute action
}
```

This prevents malformed AI responses from causing errors.

### Resizable Chat Interface

Innovative split-screen design with draggable divider:

- **Top Section**: Page content (70-85% height)
- **Resize Handle**: Smooth dragging with visual feedback
- **Bottom Section**: AI chat (15-70% height)
- **Constraints**: Minimum/maximum heights for usability

### Drag-and-Drop Process Board

Kanban-style board powered by @dnd-kit:

- **Drag cards** between columns (workflow stages)
- **Reorder cards** within same column
- **Drag columns** to reorder stages
- **Auto-save** positions to database
- **Visual feedback** with drag overlay

Default stages: Planning → Execution → Delivery (customizable)

## Architecture Decisions

### Why No Redux/Zustand?
Simple use case with LocalStorage persistence. Direct database calls are sufficient. React's built-in state management handles UI state effectively.

### Why Client-Side AI?
Faster prototyping and development. API key exposed via `NEXT_PUBLIC_*` for client-side calls. For production, migrate to Next.js API routes for security.

### Why LocalStorage?
Quick setup for prototype. Database abstraction allows seamless migration to PostgreSQL/Supabase when ready for multi-user scenarios.

### Why Portuguese Language?
Target audience is Portuguese-speaking organizations in Brazil. All AI prompts and UI optimized for Brazilian Portuguese.

### Why Modular Prompts?
Each agent has separate prompt file for easy customization. Prompt builder composes context dynamically. Easy to extend or modify agent behaviors.

## Future Enhancements

- [ ] **Authentication** - NextAuth.js for real user accounts
- [ ] **Database Migration** - Move to PostgreSQL/Supabase
- [ ] **File Upload** - Complete strategic document upload feature
- [ ] **Process Connections** - Visual flow diagrams with arrows
- [ ] **Analytics Dashboard** - Data visualizations
- [ ] **Export/Import** - Backup and restore functionality
- [ ] **Real-time Collaboration** - Multi-user WebSocket support
- [ ] **API Security** - Move Gemini calls server-side
- [ ] **Mobile App** - React Native version

## Development Notes

### Adding a New AI Agent

1. Create prompt file in `prompts/organizationPrompt/`
2. Add Zod schema to `prompts/schemas.ts`
3. Update `AgentType` in `lib/types/index.ts`
4. Modify `buildFullPrompt()` in `prompts/promptBuilder.ts`
5. Create page component with `ChatInput` using new agent type

### Adding a New Entity Type

1. Define interface in `lib/types/index.ts`
2. Add CRUD methods to `IDatabase` interface
3. Implement in `LocalStorageDatabase` class
4. Create Zod action schemas
5. Update relevant AI agent prompts
6. Build UI page component

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

