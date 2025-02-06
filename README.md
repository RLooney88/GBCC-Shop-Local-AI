# Shop Local Assistant

A powerful AI-powered business discovery platform that offers intelligent matching through a responsive, user-friendly chat interface.

## Features

- AI-powered chat interface for business discovery
- Responsive widget design
- Cross-origin iframe support
- Multiple embedding options
- OpenAI integration for intelligent matching
- Real-time chat capabilities

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js/Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API
- **Styling**: Tailwind CSS + shadcn/ui

## Project Structure

```
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

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
GHL_WEBHOOK_URL=https://...
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
```

For more embedding options, see the `/client/public/embed-instructions.md` file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details
