# Series Episode Viewer

A Next.js application that displays the nearest upcoming episode from the most recently created series. Built with TypeScript, Prisma ORM, and PostgreSQL.

## 📋 Task Overview

This project implements two key features:

### Task 1: API Endpoint for Finding the Nearest Episode

**Objective**: Create an API endpoint that finds and returns the nearest episode from the most recently created series.

**Requirements**:

- Find the latest created series (Series) that contains at least one episode (Salon with type `SERIES_EPISODE`)
- Determine the nearest episode by time (`startTime`), regardless of whether it's in the past or future
- Return episode information in JSON format
- Use Prisma Client for database access

**API Endpoint**: `GET /api/nearest-episode`

**Response Format**:

```json
{
  "episodeId": "episode1",
  "title": "Episode Title",
  "startTime": "2025-07-01T18:00:00Z",
  "description": "Description of the episode"
}
```

### Task 2: React Component for Episode Display

**Objective**: Create a React component that fetches and displays episode data from the API.

**Features**:

- Fetches data from the nearest episode API
- Displays episode title, start time, and description
- Handles loading, error, and empty states
- Uses SWR for data fetching and caching
- Responsive design with Tailwind CSS

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR
- **Validation**: Zod
- **Testing**: Playwright for E2E tests
- **Code Quality**: ESLint, Prettier, Husky

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- pnpm, npm, or yarn

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/SashaMarchuk/series-episode-viewer.git
   cd series-episode-viewer
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your database connection string:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```

4. **Set up the database**:

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Pull database schema (if database already exists)
   npm run db:pull
   ```

5. **Start the development server**:

   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/nearest-episode/    # API endpoint for nearest episode
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── NearestEpisodeCard.tsx  # Main episode display component
│   └── ui/
│       ├── index.ts            # UI components barrel export
│       └── Spinner.tsx         # Loading spinner component
├── generated/prisma/           # Generated Prisma client
├── lib/
│   └── prisma.ts               # Prisma client configuration
└── types/
    └── api.ts                  # API type definitions

prisma/
└── schema.prisma               # Database schema

e2e/
└── nearestEpisode.spec.ts      # End-to-end tests
```

## 🧪 Available Scripts

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server

### Database

- `npm run db:pull` - Pull schema from database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

### Code Quality

- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing

- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode

## 🔍 API Documentation

### GET /api/nearest-episode

Finds and returns the nearest episode from the most recently created series.

**Algorithm**:

1. Query for the most recent series (ordered by `created_at` DESC)
2. Filter series that have at least one episode (`type: 'SERIES_EPISODE'`)
3. From the found series, get all episodes ordered by `startTime`
4. Calculate which episode has the smallest time difference from now
5. Return the episode information

**Response Codes**:

- `200` - Success with episode data
- `404` - No series with episodes found
- `500` - Internal server error

**Response Schema**:

```typescript
{
  episodeId: string
  title: string
  startTime: string // ISO 8601 format
  description: string | null
}
```

## 🗄 Database Schema

The application uses the following key models:

- **Series**: Represents a series of episodes
- **Salon**: Represents individual episodes/events (with `type: 'SERIES_EPISODE'`)
- **User**: Hosts and participants

**Key relationships**:

- Series → Salon (one-to-many)
- User → Series (host relationship)
- User → Salon (host relationship)

## 🎨 Component Features

### NearestEpisodeCard

A comprehensive React component that:

- **Data Fetching**: Uses SWR for efficient data fetching with automatic revalidation
- **Loading States**: Shows spinner during data loading
- **Error Handling**: Displays different error messages based on status codes
- **Retry Mechanism**: Allows manual retry on errors
- **Date Formatting**: Formats episode start time in user-friendly format
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Proper semantic HTML and ARIA attributes

**States**:

- Loading: Shows spinner with loading message
- Error (404): Shows "No Episode Found" warning
- Error (500): Shows server error with retry button
- Error (Network): Shows connection error with retry button
- Success: Displays episode card with title, time, and description

## 🧪 Testing

The project includes comprehensive E2E tests using Playwright:

- Tests API endpoint functionality
- Tests component rendering and error states
- Tests user interactions and retry mechanisms
- Cross-browser testing support

Run tests:

```bash
npm run test:e2e
```

## 🔧 Development Guidelines

### Code Quality

- ESLint configuration with Next.js and TypeScript rules
- Prettier for consistent code formatting
- Husky pre-commit hooks for code quality
- Strict TypeScript configuration

### Database

- Prisma ORM for type-safe database access
- Generated client in `src/generated/prisma`
- Schema-first approach with database introspection

### Styling

- Tailwind CSS for utility-first styling
- Responsive design principles
- Consistent color scheme and spacing

## 🚀 Deployment

The application is ready for deployment on platforms like Vercel, Netlify, or any Node.js hosting service.

**Environment Variables**:

- `DATABASE_URL` - PostgreSQL connection string

**Build Steps**:

1. Install dependencies
2. Generate Prisma client
3. Build the application
4. Start the production server

## 🤝 Contributing

1. Ensure all tests pass: `npm run test:e2e`
2. Lint and format code: `npm run lint && npm run format`
3. Build successfully: `npm run build`
4. Follow the existing code patterns and conventions
