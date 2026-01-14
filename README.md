# AI Dashboard Builder

Generate beautiful, interactive dashboards powered by AI. Simply describe what you want to visualize, and let AI create a fully functional dashboard with charts, tables, and insights.

## Tech Stack

- **React 19** - Modern UI framework
- **Vite** - Next-generation frontend tooling
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Google Gemini AI** - AI-powered dashboard generation
- **Recharts** - Composable charting library
- **Framer Motion** - Smooth animations

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AIDashboardBuilder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   Add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey).

## Vercel Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/AIDashboardBuilder&env=VITE_GEMINI_API_KEY&envDescription=Google%20Gemini%20API%20key%20for%20AI%20features&envLink=https://aistudio.google.com/apikey)

### Manual Deployment

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Configure environment variables:
     - Add `VITE_GEMINI_API_KEY` with your API key
   - Click "Deploy"

3. **Deploy via CLI**
   ```bash
   vercel
   ```

   Follow the prompts and add environment variables when requested.

4. **Set Environment Variables**

   In the Vercel dashboard:
   - Navigate to your project
   - Go to Settings → Environment Variables
   - Add `VITE_GEMINI_API_KEY` with your Gemini API key
   - Redeploy the project

## Project Structure

```
AIDashboardBuilder/
├── components/           # React components
│   ├── DataTableEditor.tsx   # Data table editing interface
│   └── WidgetRenderer.tsx    # Dashboard widget renderer
├── src/                 # Source files
│   └── index.css        # Global styles
├── utils/               # Utility functions
│   ├── reportGenerator.ts    # Report generation logic
│   └── storage.ts            # Local storage utilities
├── App.tsx              # Main application component
├── geminiService.ts     # Google Gemini AI integration
├── constants.tsx        # Application constants
├── types.ts             # TypeScript type definitions
├── index.tsx            # Application entry point
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vercel.json          # Vercel deployment configuration
```

## Features

- **AI-Powered Generation**: Describe your dashboard in natural language
- **Multiple Chart Types**: Bar charts, line charts, pie charts, and more
- **Data Editing**: Built-in table editor for data manipulation
- **Theming**: Multiple color themes and layout options
- **Dashboard Library**: Save and manage multiple dashboards
- **Export & Share**: Download dashboards as images or share online
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run TypeScript type checking
```

## License

This project is licensed under the MIT License.
