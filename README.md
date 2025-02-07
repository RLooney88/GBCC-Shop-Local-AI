# Using psql
createdb your_database_name

# Or using PostgreSQL command
psql -c "CREATE DATABASE your_database_name;"
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials. You'll need:
```env
# Database Configuration
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
PGUSER=your_username
PGPASSWORD=your_password
PGHOST=localhost     # Use localhost for local development
PGPORT=5432         # Default PostgreSQL port
PGDATABASE=your_database_name

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# GHL Configuration
GHL_WEBHOOK_URL=your_ghl_webhook_url
```

4. Install project dependencies:
```bash
npm install
```

5. Push the database schema:
```bash
npm run db:push
```

This will create two tables in your database:
- `users`: Stores user information (id, name, email)
- `chats`: Stores chat sessions and messages (id, user_id, messages, created_at, last_activity_at, sent_to_ghl)

## Verification

To verify your setup:

1. Connect to your database:
```bash
psql your_database_name
```

2. Check if tables were created:
```sql
\dt
```
You should see `users` and `chats` tables listed.

3. View table structures:
```sql
\d users
\d chats
```

The schemas should match:

### Users Table
- `id`: serial (auto-incrementing integer), primary key
- `name`: text, not null
- `email`: text, not null

### Chats Table
- `id`: serial (auto-incrementing integer), primary key
- `user_id`: integer, not null, references users(id)
- `messages`: jsonb, not null, default '[]'
- `created_at`: timestamp, not null, default now()
- `last_activity_at`: timestamp, not null, default now()
- `sent_to_ghl`: boolean, not null, default false

## Troubleshooting

If you encounter any issues:

1. Ensure PostgreSQL is running:
```bash
pg_isready
```

2. Check database connection:
```bash
psql -d your_database_name -c "SELECT 1"
```

3. If schema push fails, you can try:
```bash
# Clear any existing tables (careful, this deletes all data!)
psql your_database_name -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then try pushing the schema again
npm run db:push
```

## Running the Application

After database setup is complete:

```bash
npm run dev
```

The application should now be running with a properly configured database.

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