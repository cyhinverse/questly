# 🎯 Questly - Interactive Quiz Platform

A modern, real-time quiz application built with Next.js 14, Supabase, and TailwindCSS. Create, play, and compete in quizzes with friends in real-time!

## ✨ Features

### 🎮 **Quiz Management**

- **Create Custom Quizzes** - Build quizzes with multiple choice questions
- **AI-Powered Generation** - Generate quizzes using AI (Gemini, OpenRouter)
- **Difficulty Levels** - Easy, Medium, Hard difficulty settings
- **Question Management** - Add, edit, and organize questions
- **Quiz Analytics** - Track performance and statistics

### 🏠 **Real-time Multiplayer**

- **Room System** - Create and join quiz rooms with unique codes
- **Live Competition** - Play with friends in real-time
- **Leaderboards** - See rankings and scores instantly
- **Player Management** - Track who's playing and completed

### 👤 **User Experience**

- **Authentication** - Secure login with Supabase Auth
- **Google OAuth** - Quick sign-in with Google
- **Profile Management** - Customize your profile and avatar
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Sound Effects** - Audio feedback for interactions

### 🛡️ **Admin Panel**

- **User Management** - View and manage all users
- **Quiz Analytics** - Detailed quiz performance metrics
- **System Settings** - Configure application settings
- **Content Moderation** - Review and manage quizzes

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (Database, Auth, Realtime)
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: React Hooks, Context API
- **AI Integration**: Google Gemini, OpenRouter
- **Styling**: TailwindCSS with custom animations
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── quiz/              # Quiz pages (create, play, results)
│   ├── room/              # Multiplayer room pages
│   └── profile/           # User profile
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── admin/            # Admin-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configs
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the repository

```bash
git clone <repository-url>
cd questly
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Keys (Optional)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
HF_TOKEN=your_huggingface_token
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the database migrations (if available)
3. Set up Row Level Security (RLS) policies
4. Configure authentication providers

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Usage

### Creating a Quiz

1. Sign up/Login to your account
2. Navigate to "Create Quiz"
3. Fill in quiz details (title, description, difficulty)
4. Add questions with 4 multiple choice options each
5. Set correct answers and save

### Playing Solo

1. Browse available quizzes
2. Click on a quiz to start
3. Answer questions within the time limit
4. View your results and score

### Multiplayer Mode

1. Create a room or join with a room code
2. Wait for other players to join
3. Start the quiz when ready
4. Compete in real-time
5. View the leaderboard at the end

## 🏗️ Build & Deploy

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (if configured)
npm run test
```

## 📱 Features Overview

| Feature               | Description                            | Status |
| --------------------- | -------------------------------------- | ------ |
| User Authentication   | Supabase Auth with Google OAuth        | ✅     |
| Quiz Creation         | Custom quiz builder with AI generation | ✅     |
| Real-time Multiplayer | Live rooms with instant updates        | ✅     |
| Admin Dashboard       | User and content management            | ✅     |
| Responsive Design     | Mobile-first responsive UI             | ✅     |
| Sound Effects         | Audio feedback system                  | ✅     |
| Analytics             | Quiz performance tracking              | ✅     |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [TailwindCSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Lucide](https://lucide.dev/) for icons

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**Happy Quizzing! 🎉**
