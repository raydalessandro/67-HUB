# 67 Hub

Artist management portal for 67 Label. A PWA for managing social media content with approval workflows.

## Features

- **Posts Management**: Create, edit, schedule posts
- **Approval Flow**: Staff creates → Artist reviews → Publish
- **Calendar**: Visual overview of scheduled content
- **Chat**: Communication between staff and artists
- **Notifications**: Real-time updates on post status
- **Mobile-first**: PWA optimized for mobile use

## Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Realtime)
- **State**: Zustand
- **Routing**: React Router 6

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in Supabase credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## Deploy

Build for production:
```bash
npm run build
```

Deploy to Vercel:
```bash
vercel
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@67hub.test | testpassword123 |
| Manager | manager@67hub.test | testpassword123 |
| Artist | artist1@67hub.test | testpassword123 |

## License

Private - 67 Label
