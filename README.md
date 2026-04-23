# Digital Twin Interview Platform

An interactive AI-powered interview platform where users can conduct live conversations with a digital twin of Ali Azan, featuring real-time streaming responses and professional PDF report generation.

## Features

- **Interactive Interview Flow**: 6 structured questions covering leadership, innovation, and vision
- **Real-time Streaming**: Answers appear character-by-character using Groq's streaming API
- **RAG Enhancement**: Retrieves relevant context from Upstash Vector Database for accurate responses
- **PDF Reports**: Download professional interview reports with candidate info and all Q&A
- **Session Management**: Temporary session storage for interview data
- **Beautiful UI**: Dark-themed interface with smooth animations and gradients

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **AI Integration**: Groq API for streaming LLM responses
- **Vector Database**: Upstash Vector DB for semantic search & context retrieval
- **PDF Export**: html2pdf.js for client-side PDF generation
- **Components**: shadcn/ui for polished UI elements

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **AI Integration**: Groq API for streaming LLM responses
- **Vector Database**: Upstash Vector DB for semantic search & context retrieval
- **PDF Export**: html2pdf.js for client-side PDF generation
- **Components**: shadcn/ui for polished UI elements

## Setup Instructions

### Prerequisites

1. **Groq API Key**: Get it from [console.groq.com](https://console.groq.com)
2. **Upstash Vector Database**: Set up your vector DB with Ali Azan's career data embedded and indexed
   - Get `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN`

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
UPSTASH_VECTOR_REST_URL=your_upstash_url_here
UPSTASH_VECTOR_REST_TOKEN=your_upstash_token_here
```

When deploying to Vercel, make sure the same environment variables are configured in your Vercel project settings. If the default model is not accessible to your account, set `GROQ_MODEL` to a model your Groq API key can use.

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Offline Testing

For testing the UI and basic functionality without API keys:

1. Run the test server on port 5000:
```bash
pnpm test
```

2. Open [http://localhost:5000](http://localhost:5000) in your browser

**Offline Mode Features:**
- Mock AI responses when GROQ_API_KEY is not set
- Full UI functionality without external API calls
- PDF generation works normally
- All pages and navigation functional

**Note:** AI responses will be generic mock responses. For full functionality, configure the environment variables above.

## Project Structure

```
app/
├── layout.tsx              # Root layout with metadata
├── page.tsx                # Home page with intro
├── setup/
│   └── page.tsx           # Candidate info collection
├── interview/
│   └── page.tsx           # Interview flow & streaming
├── results/
│   └── page.tsx           # Results display & PDF export
└── api/
    └── interview/
        └── stream/
            └── route.ts   # Streaming response API endpoint

lib/
├── types.ts               # TypeScript interfaces
├── groq.ts                # Groq streaming client
├── upstash.ts             # Vector DB query utility
└── utils.ts               # Shared utilities
```

## How It Works

### 1. Home Page
- Introduces the platform and its features
- Directs users to start the interview

### 2. Setup Page
- Collects candidate information (name, email, role)
- Creates a session object in sessionStorage

### 3. Interview Page
- Displays one question at a time
- Streams AI response character-by-character
- Saves each Q&A pair to session
- Provides next/previous navigation

### 4. Results Page
- Displays all Q&A pairs
- Shows candidate summary
- Provides PDF download functionality
- Uses html2pdf to generate professional reports

## API Routes

### POST `/api/interview/stream`

Streams real-time responses for interview questions.

**Request:**
```json
{
  "question": "What is your leadership philosophy?"
}
```

**Response:** Server-sent event stream with text chunks

## Key Features Explained

### Real-time Streaming
Uses Groq's streaming API with `stream: true` parameter to deliver responses character-by-character, creating an engaging conversational experience.

### RAG (Retrieval-Augmented Generation)
Context from Upstash Vector DB is retrieved based on question similarity, enhancing response accuracy with relevant information about Ali Azan's career and insights.

### Session Management
Interview data is stored temporarily in sessionStorage, providing seamless navigation between pages without requiring a database.

### PDF Generation
Client-side PDF generation using html2pdf allows users to download professional reports without server overhead.

## Deployment

### To Vercel

1. Push code to GitHub
2. Connect repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

```bash
pnpm build
```

## Interview Questions

The platform includes 6 pre-configured questions:

1. Leadership and Vision
2. Innovation Approach
3. Career Highlights
4. Challenges Overcome
5. Future Direction
6. Advice for Young Professionals

## Performance Considerations

- **Streaming**: Groq API provides fast inference with context awareness
- **Vector DB**: Upstash enables semantic search with millisecond latency
- **Client-side PDF**: No server load for report generation
- **Session Storage**: Lightweight alternative to database for temporary data

## Troubleshooting

### Streaming not working?
- Check Groq API key is valid
- Ensure `GROQ_API_KEY` is set in environment variables
- Check browser console for errors

### No context retrieved?
- Verify Upstash credentials are correct
- Ensure vector DB is populated with Ali Azan's data
- Check question is being sent correctly to API

### PDF download fails?
- Enable pop-ups if browser is blocking it
- Check browser console for errors
- Ensure html2pdf.js is loaded

## Future Enhancements

- Database persistence for interview history
- Authentication for user accounts
- Multiple digital twin personas
- Advanced analytics dashboard
- Interview templates for different roles
- Email report delivery

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
