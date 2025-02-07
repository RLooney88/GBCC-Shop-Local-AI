# Using psql
createdb your_database_name

# Or using PostgreSQL command
psql -c "CREATE DATABASE your_database_name;"
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials:
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

4. Install dependencies:
```bash
npm install
```

5. Push the schema to create all tables:
```bash
npm run db:push
```

This will create the following tables according to `shared/schema.ts`:
- `users`: Stores user information (id, name, email)
- `chats`: Stores chat sessions and messages

To verify the setup:
```bash
# Connect to your database
psql your_database_name

# List tables
\dt

# View table schemas
\d users
\d chats
```

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Follow the Database Setup From Scratch steps above

3. Start the development server:
```bash
npm run dev
```

## Widget Integration

Add the widget to any website with a single line of code:

```html
<script src="https://your-domain/widget.js"></script>