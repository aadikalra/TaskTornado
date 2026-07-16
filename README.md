# TaskTornado - AI-Powered School Organizer

![TaskTornado Logo](public/2.svg)

A modern, AI-powered school organizer designed to help students manage homework, deadlines, and study planning with intelligent features and beautiful animations.

## 🚀 Features

### 📚 Homework Management
- **Visual Homework List**: Clean, animated interface for managing assignments
- **Priority System**: Automatic priority assignment with visual indicators
- **Due Date Tracking**: Smart deadline management with visual cues
- **Google Classroom Integration**: Sync assignments from Google Classroom
- **Recurring Homework**: Support for repeating assignments

### 🤖 AI-Powered Features
- **Smart Study Planning**: AI analyzes your workload to suggest optimal study schedules
- **Priority Recommendations**: AI determines which homework to tackle first
- **Progress Insights**: AI-powered progress tracking and suggestions
- **Homework Helper**: Instant assistance with difficult assignments

### 📅 Study Tools
- **Built-in Timer**: Pomodoro-style study sessions with visual feedback
- **Subject Mastery Tracking**: Monitor progress across different subjects
- **Group Chats**: Collaborate with classmates on group projects
- **Flashcards**: Create and study digital flashcards

### 🎨 User Experience
- **Beautiful Animations**: Smooth, delightful animations throughout the app
- **Dark/Light Mode**: Automatic theme switching
- **Responsive Design**: Works perfectly on desktop and mobile
- **Accessibility**: Full keyboard navigation and screen reader support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Local AI models (Gemma 3n)
- **Icons**: Lucide React
- **Deployment**: Netlify

## 📋 Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (for database)
- Google Cloud Console account (for Classroom integration)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aadikalra/TaskTornado.git
cd TaskTornado
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Classroom Integration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Configuration (Optional)
OLLAMA_BASE_URL=http://localhost:11434
```

### 4. Set Up Supabase Database

1. Create a new project on [Supabase](https://supabase.com)
2. Run the provided migration files in the `supabase/migrations/` directory
3. Update your `.env.local` with the Supabase credentials

### 5. Set Up Google Classroom (Optional)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project and enable the Google Classroom API
3. Create OAuth 2.0 credentials
4. Add your credentials to `.env.local`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Adding Homework
1. Click the "+" button in the main interface
2. Fill in assignment details (title, class, due date, priority)
3. Add links to resources if needed
4. Set up recurring schedules for regular assignments

### Using AI Features
1. Enable AI features in settings
2. The app will automatically analyze your homework load
3. Get personalized study recommendations
4. Use the homework helper for instant assistance

### Study Sessions
1. Click the timer icon to start a study session
2. Choose your preferred session length (Pomodoro-style)
3. Take breaks and track your productivity

## Key Components

- **MainApp**: Central dashboard with homework overview
- **PlayfulHomeworkList**: Animated homework list with interactions
- **PriorityHomeworkCard**: AI-recommended priority assignments
- **StudyTimer**: Built-in study session timer
- **GoogleClassroomIntegration**: Seamless Classroom sync

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Notes

- The app uses Next.js 15 with App Router
- Database migrations are in `supabase/migrations/`
- UI components follow the design system in `components/ui/`
- AI features use local Ollama models for privacy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- Database by [Supabase](https://supabase.com/)

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ for students everywhere** 🎓
