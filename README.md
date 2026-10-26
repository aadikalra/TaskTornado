# TaskTornado - Pre-Launch School Organizer

![TaskTornado Logo](public/2.svg)

A U.S.-only, age-13+ school organizer for homework, deadlines, grades, and study planning. Aurora includes free Groq AI and optional personal keys for OpenRouter, Together AI, Fireworks AI, and Groq; social features, uploads, web search, and Google integrations remain disabled.

## 🚀 Features

### 📚 Homework Management
- **Visual Homework List**: Clean, animated interface for managing assignments
- **Priority System**: Priority assignment with visual indicators
- **Due Date Tracking**: Smart deadline management with visual cues
- **Google Classroom Integration**: Implemented behind a fail-closed flag; do not enable publicly before OAuth review
- **Recurring Homework**: Support for repeating assignments

### 🤖 Aurora AI
- Free Groq model routing with approved fallbacks, or your own OpenRouter, Together AI, Fireworks AI, or Groq key. No web search.
- AI endpoints require an eligible, authenticated account. Users age 13–17 also need the current parent or guardian approval.
- Server-side daily quotas, short-burst rate limiting, input/output safety checks, bounded context, and read-only school-data retrieval.
- The database stores usage counts and token totals, not prompt text, in quota records.

### 📅 Study Tools
- **Built-in Timer**: Pomodoro-style study sessions with visual feedback
- **Subject Mastery Tracking**: Monitor progress across different subjects
- **Flashcards**: Create and study digital flashcards

### 🎨 User Experience
- **Beautiful Animations**: Smooth, delightful animations throughout the app
- **Dark/Light Mode**: Automatic theme switching
- **Responsive Design**: Works perfectly on desktop and mobile
- **Accessibility**: Accessibility support is under ongoing review

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Groq API with server-controlled model fallback
- **Icons**: Lucide React
- **Deployment**: Next.js-compatible hosting

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

# Google integrations (enable independently; keep public access disabled until the applicable OAuth review is complete)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_TOKEN_ENCRYPTION_KEY=generate_a_dedicated_random_secret
GMAIL_INTEGRATION_ENABLED=false
GOOGLE_CLASSROOM_INTEGRATION_ENABLED=false
GOOGLE_CALENDAR_INTEGRATION_ENABLED=false

# Aurora AI
GROQ_API_KEY=your_server_only_groq_api_key
AI_FEATURES_ENABLED=true
# Optional BYOK: dedicated 32-byte encryption key, encoded as 64 hex characters
AI_KEY_ENCRYPTION_KEY=generate_a_dedicated_64_character_hex_secret

# Parent or guardian approval emails
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=verified_sender@example.com

# Canonical production URL
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

### 4. Set Up Supabase Database

1. Create a new project on [Supabase](https://supabase.com)
2. Run the provided migration files in the `supabase/migrations/` directory
3. Update your `.env.local` with the Supabase credentials

### 5. Prepare Google OAuth (Optional; Disabled by Default)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project and enable the Gmail API, Google Classroom API, and/or Google Calendar API
3. Create OAuth 2.0 credentials
4. Add the exact production privacy policy, terms, homepage, and redirect URLs
   (Calendar callback: `/api/auth/google-calendar`)
5. Request the narrowest scopes and complete the required Google OAuth review
6. Add credentials and a dedicated token-encryption key to `.env.local`
7. Set `GMAIL_INTEGRATION_ENABLED=true` and/or
   `GOOGLE_CLASSROOM_INTEGRATION_ENABLED=true` and/or
   `GOOGLE_CALENDAR_INTEGRATION_ENABLED=true` only after the applicable review
   and production validation. The legacy `GOOGLE_INTEGRATIONS_ENABLED` flag is
   still supported as a fallback, but enables all Google services together.

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

### AI Features

Run `supabase/migrations/20260728000000_add_atomic_ai_usage_quotas.sql`,
enable Zero Data Retention in the Groq console where available, add the
server-only `GROQ_API_KEY`, and set `AI_FEATURES_ENABLED=true`. Never expose
the Groq key through a `NEXT_PUBLIC_` variable.

### Study Sessions
1. Click the timer icon to start a study session
2. Choose your preferred session length (Pomodoro-style)
3. Take breaks and track your productivity

## Personal AI keys (BYOK)

TaskTornado has one free plan. Existing free assignment, test, flashcard, and
saved-link limits remain in place. Hosted AI keeps the free per-feature limits
and 25 combined actions per UTC day. Personal-key requests skip daily AI quota
reservation and hosted usage metrics; all requests retain authentication,
account eligibility, feature flags, input/output bounds, and four requests per minute.

1. Apply `supabase/migrations/20261018000000_add_personal_ai_keys.sql`.
   The existing `20260728000000_add_atomic_ai_usage_quotas.sql` migration is also
   required for production burst limits and hosted allowances. Review pending
   migrations before running a blanket `supabase db push`; the linked project
   may have other unapplied changes.
2. Set a dedicated `AI_KEY_ENCRYPTION_KEY` on the server. Generate 32 random bytes
   as 64 hex characters, for example with `openssl rand -hex 32`. Never use a
   `NEXT_PUBLIC_` variable or commit the secret. Keep the same secret across
   deployments; changing it requires users to save their personal keys again.
3. Open **Settings → AI Connection**, choose a provider and a chat model with
   tool calling and JSON support, enter its key, and save. An optional connection
   test sends a short request billed by the provider.
4. Switch between hosted AI and your saved key, or remove the key, at any time.

Keys use AES-256-GCM encryption bound to the account and provider. The table is
accessible only through authenticated server routes using the service role;
responses contain only provider/model, status, and the last four key characters.
API keys are never persisted in browser storage. A provider failure never
silently switches to hosted AI or consumes the hosted allowance.

Aurora, translation, grading, grade parsing, study-set generation, and writing
requests use the selected connection. Ramblr uses a personal Groq key when Groq
is active; other providers continue to use the free hosted speech allowance.
Personal-key requests remain subject to provider billing and limits. BYOK does
not enable the separately disabled Google or social features.

Provider API references: [OpenRouter](https://openrouter.ai/docs/api/reference/overview),
[Together AI](https://docs.together.ai/docs/inference/openai-compatibility),
[Fireworks AI](https://docs.fireworks.ai/tools-sdks/openai-compatibility), and
[Groq](https://console.groq.com/docs/openai).

Run the AI regression checks with `npm run test:ai`.

## Key Components

- **MainApp**: Central dashboard with homework overview
- **PlayfulHomeworkList**: Animated homework list with interactions
- **PriorityHomeworkCard**: Priority assignment display
- **StudyTimer**: Built-in study session timer
- **GoogleClassroomIntegration**: OAuth-review-gated Classroom sync

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
- AI and Google integrations fail closed unless their explicit server-side feature flags are enabled
- Aurora has no web-search tool and cannot write to school records
- Review `docs/LAUNCH_SAFETY.md` before changing launch boundaries or enabling integrations

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

**Pre-launch: United States, ages 13+** 🎓
