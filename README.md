# Horizon Banking App

![Horizon Banking](public/icons/logo.svg)

Horizon is a modern banking application that allows users to manage their bank accounts, view transactions, and transfer funds securely. Built with Next.js 14, Shadcn UI, Appwrite, Plaid, and Dwolla.

## Features

- **Secure Authentication**

  - Email & password authentication
  - Session management
  - Protected routes

- **Bank Account Management**

  - Connect multiple bank accounts securely via Plaid
  - View account balances
  - Monitor account activities
  - Real-time bank data synchronization

- **Transaction Management**

  - View detailed transaction history
  - Filter and search transactions
  - Transaction categorization
  - Real-time transaction updates

- **Money Transfers**
  - Transfer funds between connected accounts
  - Secure payment processing via Dwolla
  - Real-time transfer status updates
  - Transfer history tracking

## Tech Stack

- **Frontend**

  - [Next.js 14](https://nextjs.org/) - React framework with App Router
  - [Shadcn UI](https://ui.shadcn.com/) - Beautifully designed components
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [TypeScript](https://www.typescriptlang.org/) - Static type checking
  - [React Hook Form](https://react-hook-form.com/) - Form validation
  - [Zod](https://zod.dev/) - Schema validation

- **Backend & Infrastructure**
  - [Appwrite](https://appwrite.io/) - Backend server
  - [Plaid](https://plaid.com/) - Banking data integration
  - [Dwolla](https://www.dwolla.com/) - Payment processing

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- An Appwrite account and project
- Plaid developer account
- Dwolla developer account

## Environment Variables

Create a `.env.local` file with:

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_endpoint
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_USER_COLLECTION_ID=your_user_collection_id
APPWRITE_BANK_COLLECTION_ID=your_bank_collection_id
APPWRITE_TRANSACTION_COLLECTION_ID=your_transaction_collection_id

# Plaid
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox

# Dwolla
DWOLLA_API_KEY=your_api_key
DWOLLA_API_SECRET=your_api_secret
DWOLLA_ENVIRONMENT=sandbox
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/horizon-banking.git
cd horizon-banking
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your credentials.

4. Run the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
horizon-banking/
├── app/                   # Next.js app directory
│   ├── (auth)/           # Authentication routes
│   ├── (root)/           # Main application routes
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── ui/              # Shadcn UI components
│   └── ...              # Custom components
├── lib/                 # Utilities and helpers
│   ├── actions/         # Server actions
│   ├── utils/           # Utility functions
│   └── ...             # Other helpers
├── public/              # Static assets
└── types/               # TypeScript types
```

## Key Features Implementation

### Authentication

- Utilizes Appwrite's authentication system
- Server-side session validation
- Protected route middleware

### Bank Connection

- Plaid Link integration for secure bank connection
- OAuth support for major banks
- Real-time balance updates

### Transactions

- Real-time transaction syncing
- Transaction categorization
- Search and filtering capabilities

### Transfers

- Secure fund transfers via Dwolla
- Multi-bank account support
- Transfer status tracking


## Acknowledgments

- Thanks to [Plaid](https://plaid.com) for banking integration
- Thanks to [Dwolla](https://www.dwolla.com) for payment processing
- Thanks to [Appwrite](https://appwrite.io) for backend services
- Thanks to [Shadcn](https://ui.shadcn.com) for UI components

## Contact
Aditya Krishna: (https://itsmeadeektya.com/)
