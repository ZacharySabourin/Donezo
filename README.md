
# Donezo

A modern, high-performance, security-conscious single-page application (SPA) for multi-user task management built with React, TypeScript, and Vite. Designed as the frontend client for the Donezo-API, this application provides a responsive UI featuring custom context-driven state management, debounced actions, dark/light theme toggling, and cookie-based authentication integration.

## Key Features

- Context-Driven State Architecture: Global client state management modularized across `AuthContext`, `TodoContext`, and `ToastContext`.  
- Performant UI Operations: Optimized user inputs and search using custom hooks like `useDebounce` and `useUpdateEffect`.  
- Modular Component Design: Granular component structure including dedicated forms, todo item options, list displays, and system notifications.  
- Secure API Integration: Typed API abstractions (`authAPI`, `todoAPI`) engineered to seamlessly interface with backend JWT and CSRF security headers.  
- Dynamic Theme Engine: Built-in theme toggling supporting smooth visual switching and responsive CSS design.
- Type Safety & Linting: End-to-end static typing powered by TypeScript and enforced via ESLint.

## Tech Stack

- **Language**: TypeScript  
- **UI Library**: React 18+  
- **Build Tool**: Vite  
- **State Management**: React Context API & Custom Hooks  
- **Styling**: CSS3  
- **Linting**: ESLint

## Useful Commands

| Command              | Description                                                     |
|----------------------|-----------------------------------------------------------------|
| `npm run dev`        | Starts the Vite local development server with HMR               |
| `npm run build`      | Compiles TypeScript and builds the app for production output    |
| `npm run preview`    | Locally previews the compiled production build                  |
| `npm run lint`       | Runs ESLint across the codebase to check for style/type issues  |
