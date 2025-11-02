# Quick Start Guide

## Setup in 3 Steps

### 1. Install Dependencies
```bash
cd consultoria-app
npm install
```

### 2. Configure Gemini API
Create a `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Gemini API key:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

**Get your API key at**: https://makersuite.google.com/app/apikey

### 3. Run the Application
```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## First Time Use

1. **Welcome Screen**: Enter your nickname
2. **Início**: Add organization basic info
3. **Base**: Define organizational pillars
4. **Áreas**: Create areas (Marketing, IT, HR, etc.)
5. **KPIs**: Select an area and add performance indicators
6. **Tarefas**: Add tasks for each area
7. **Processos**: Map workflows with visual columns
8. **Conversar**: General chat about all data

## Features Overview

### Left Sidebar Navigation
- **Organização**
  - Início: Organization info
  - Base: Organizational pillars
  - Áreas: Area management

- **Áreas**
  - KPIs: Performance indicators
  - Tarefas: Task management
  - Processos: Workflow mapping

- **Conversar**: General conversation

### Right Sidebar (KPIs, Tarefas, Processos pages)
- Select area to filter content
- Auto-opens when on these pages
- Shows all available areas

### Chat Interface
- Present on every page
- Context-aware AI assistant
- Create/update items via conversation
- Get insights and suggestions

## Common Tasks

### Add a New Area
1. Go to **Organização → Áreas**
2. Click "Adicionar Área"
3. Fill in name and description
4. Or use the chat: "Crie uma área chamada Marketing"

### Create KPIs
1. Go to **Áreas → KPIs**
2. Select an area from right sidebar
3. Click "Adicionar KPI"
4. Or use chat: "Adicione um KPI para taxa de conversão"

### Map a Process
1. Go to **Áreas → Processos**
2. Select an area
3. Click "Adicionar Atividade"
4. Choose stage (Planning/Execution/Delivery)
5. Add custom stages with "Adicionar Coluna"

## Keyboard Shortcuts

- **Enter** in chat input: Send message
- **ESC** in modals: Close modal

## Data Storage

All data is stored in your browser's localStorage:
- Persists between sessions
- Tied to your browser/device
- Clear browser data to reset

## Troubleshooting

### "API Key not found" error
- Check `.env.local` file exists
- Verify API key is correct
- Restart dev server after adding key

### Chat not responding
- Verify internet connection
- Check Gemini API key is valid
- Open browser console for errors

### Data not saving
- Check browser localStorage is enabled
- Try different browser
- Check console for errors

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Production Deployment

### Vercel (Recommended)
```bash
vercel
```

Add environment variable in Vercel dashboard:
- `NEXT_PUBLIC_GEMINI_API_KEY`

### Other Platforms
1. Build: `npm run build`
2. Deploy `.next` folder
3. Set environment variable

## Support

- Check README.md for detailed documentation
- Open browser DevTools for debugging
- Review console logs for errors

## Tips

1. **Start Simple**: Begin with one area and expand
2. **Use Chat**: The AI assistant can help create items
3. **Regular Saves**: Data auto-saves, but export important info
4. **Mobile**: Works on mobile but better on desktop
5. **Multiple Users**: Each browser/device has separate data

Enjoy organizing your consultoria! 🚀
