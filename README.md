├── client/               # Frontend React application
│   ├── public/          # Static assets and widget files
│   └── src/             # React source code
├── server/              # Express.js backend
│   ├── routes.ts        # API routes
│   ├── openai.ts        # OpenAI integration
│   └── index.ts         # Server entry point
├── shared/              # Shared types and utilities
└── static/              # Compiled static files
```

## Database Setup

The project uses PostgreSQL with Drizzle ORM for database management. To set up the database:

1. Create a PostgreSQL database
2. Copy `.env.example` to `.env` and update with your database credentials:
```env
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
PGUSER=your_username
PGPASSWORD=your_password
PGHOST=your_host
PGPORT=5432
PGDATABASE=your_database_name
```

3. Run database migrations:
```bash
npm run db:push
```

This will create all necessary tables according to the schema defined in `shared/schema.ts`.

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
PGUSER=your_username
PGPASSWORD=your_password
PGHOST=your_host
PGPORT=5432
PGDATABASE=your_database_name

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# GHL Configuration
GHL_WEBHOOK_URL=your_ghl_webhook_url
```

## Setup Instructions

1. Clone the repository:
```bash
git clone <your-repository-url>
cd shop-local-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Fill in your environment variables

4. Start the development server:
```bash
npm run dev
```

## Widget Integration

Add the widget to any website with a single line of code:

```html
<script src="https://your-domain/widget.js"></script>