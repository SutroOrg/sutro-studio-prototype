# Sutro Studio

A prototype UI for Sutro's AI-powered backend builder. Describe your backend in plain English, and Sutro generates the code, data model, and API documentation.

## Features

- **Landing Page** - Dark-themed hero with prompt input for describing your backend
- **Signup Flow** - Email/password and profile collection forms
- **Studio Interface** - Three-tab view for exploring generated backends:
  - **SLang** - Monaco editor displaying Sutro's domain-specific language with syntax highlighting
  - **Data Model** - Mermaid-powered class diagram visualization
  - **API Docs** - Interactive OpenAPI documentation viewer
- **Streaming Generation** - Typewriter effect showing code generation in real-time
- **Responsive Design** - Mobile, tablet, and desktop viewport support
- **Example Apps** - Pre-built examples (DataStream Pro, RenderMaster, CacheGuard, StyleCraft)

## Tech Stack

- **Framework**: React Router v7 (SPA mode)
- **Styling**: Tailwind CSS + ShadCN UI components
- **Editor**: Monaco Editor with custom SLang language support
- **Diagrams**: Mermaid for data model visualization
- **State**: Zustand with localStorage persistence
- **Build**: Vite

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server (runs on port 5178)
pnpm dev

# Build for production
pnpm build
```

## Project Structure

```
app/
├── components/
│   ├── api-docs-viewer/    # OpenAPI documentation display
│   ├── chat-panel/         # Prompt input box
│   ├── data-model-viewer/  # Mermaid diagram renderer
│   ├── dirty-banner/       # Unsaved changes indicator
│   ├── landing/            # Landing page hero
│   ├── signup/             # Email and profile forms
│   ├── slang-editor/       # Monaco editor with SLang support
│   ├── studio-footer/      # App metadata display
│   ├── studio-header/      # App name and actions
│   ├── studio-sidebar/     # App list navigation
│   └── ui/                 # ShadCN components
├── lib/
│   ├── mock-data.ts        # Example app data
│   └── utils.ts            # Utility functions
├── routes/
│   ├── _index.tsx          # Landing page
│   ├── email-signup.tsx    # Email/password form
│   ├── signup.tsx          # Profile form
│   ├── studio.tsx          # Studio layout
│   ├── studio._index.tsx   # Studio home redirect
│   └── studio.$appId.tsx   # App detail view
└── stores/
    ├── use-app-store.ts    # Application state
    ├── use-signup-store.ts # Signup form data
    └── use-viewport-store.ts # Responsive viewport state
```

## User Flow

1. **Landing** (`/`) - Enter a prompt describing your backend
2. **Email Signup** (`/email-signup`) - Create account with email/password
3. **About You** (`/signup`) - Provide name, role, and company
4. **Studio** (`/studio/:appId`) - View generated backend with streaming code animation

## License

Proprietary - Sutro, Inc.
