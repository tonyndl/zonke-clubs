# Zonke Clubs Admin Web Panel

Web-based administration panel for club owners to manage their clubs on the Zonke Clubs platform.

## Features

### Core Management

- **Dashboard** - Analytics and overview of club performance
- **Events Management** - Create, edit, and publish club events
- **Content Moderation** - Review and moderate user-generated content
- **Spending Tracker** - Track customer spending and analytics

### Settings

- **Club Information** - Edit club details, contact info, and description
- **Opening Hours** - Manage weekly operating hours
- **Media Gallery** - Upload and manage photos and videos
- **DJ Schedule** - Set weekly DJ lineup
- **Posting Permissions** - Control who can post and content rules
- **Blocked Users** - Manage blocked users list
- **Content Guidelines** - Set community guidelines
- **Subscription** - Manage subscription plan and billing

## Tech Stack

- **React 18** with TypeScript
- **React Router** for client-side routing
- **Styled Components** for styling
- **TanStack Query** for server state management
- **Axios** for API communication

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:4000`

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (one-way operation)

## Project Structure

```
src/
├── components/       # Reusable UI components (Button, Card, Input, etc.)
├── layouts/          # Layout components (Sidebar, MainLayout)
├── pages/            # Route pages
│   ├── Dashboard/    # Dashboard page
│   ├── Events/       # Events management
│   ├── Content/      # Content moderation
│   ├── Spending/     # Spending tracker
│   └── Settings/     # All settings pages
├── services/         # API services
│   ├── api.ts        # Base API service with auth
│   ├── clubService.ts
│   ├── eventService.ts
│   ├── contentService.ts
│   ├── spendingService.ts
│   └── settingsService.ts
├── styles/           # Global styles and theme
├── types/            # TypeScript type definitions
└── App.tsx           # Main app with routing
```

## API Integration

The app communicates with the backend API at `http://localhost:4000/api`. Make sure the backend is running before starting the web app.

### Authentication

Authentication is handled via JWT tokens stored in localStorage. The API service automatically:

- Adds auth tokens to requests
- Handles 401 responses by clearing tokens and redirecting to login
- Manages token lifecycle

## Development Notes

### Current Status

✅ **Completed:**

- Project setup with Create React App + TypeScript
- Styled Components integration
- Base layout with sidebar navigation
- API service layer for all domains
- TypeScript type definitions
- Reusable UI components (Button, Card, Input, Table, Badge)
- Dashboard page (basic version)
- Events page with filtering
- Routing setup

🚧 **In Progress:**

- Full implementation of all management pages
- Backend API endpoint integration
- Authentication flow
- Form validations
- File upload handling

📋 **Planned:**

- Analytics charts and visualizations
- Real-time updates
- Responsive mobile design
- Testing coverage
- Production build optimization

### Adding New Features

1. Create TypeScript types in `src/types/`
2. Add API methods in relevant service file
3. Create page components in `src/pages/`
4. Add routes in `src/App.tsx`
5. Update sidebar navigation in `src/layouts/Sidebar.tsx`

## Migration from Mobile

This web app replaces the club management features previously in the mobile app at `frontend/zonke-clubs/app/manage/`. All 13 management screens have been migrated to this web-based platform for better UX and easier club administration.

## License

Proprietary - Zonke Clubs
