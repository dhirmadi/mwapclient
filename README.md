# MWAP Client

Frontend client for the Modular Web Application Platform (MWAP).

## Features

- User authentication with Auth0
- Role-based access control
- Tenant management
- Project management
- Cloud provider integration
- Project type configuration
- File management

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Mantine UI
- TanStack Query (React Query)
- Zod
- Tailwind CSS
- Auth0

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mwapclient.git
cd mwapclient
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the `.env` file with your Auth0 credentials and API URL.

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

### Building for Production

Build the application for production:

```bash
npm run build
# or
yarn build
```

## Project Structure

```
src/
  ├── assets/           # Static assets
  ├── components/       # Reusable UI components
  │   ├── common/       # Common UI components
  │   └── layout/       # Layout components
  ├── context/          # React context providers
  ├── features/         # Feature-based modules
  ├── hooks/            # Custom React hooks
  ├── pages/            # Page components
  ├── router/           # Routing configuration
  ├── types/            # TypeScript type definitions
  ├── utils/            # Utility functions
  ├── App.tsx           # Main App component
  └── main.tsx          # Entry point
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
