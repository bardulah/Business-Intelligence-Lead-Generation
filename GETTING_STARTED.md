# 🚀 Getting Started - Lead Discovery Tool v2.0

**This guide will get you up and running in 5 minutes.**

---

## ⚡ Quick Start (For the impatient)

```bash
# 1. Install dependencies
npm run install-all

# 2. Start Docker services (PostgreSQL + Redis)
npm run docker:up

# 3. Run setup script
npm run setup

# 4. Start development servers
npm run dev
```

**Done!** Open http://localhost:3000

---

## 📋 Detailed Setup

### Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git installed

### Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd Business-Intelligence-Lead-Generation
npm run install-all
```

This installs dependencies for both server and client.

### Step 2: Environment Configuration

```bash
# Copy example environment file
cp .env.example .env
```

**Edit `.env` and update these values:**

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/lead_discovery?schema=public"
JWT_SECRET="your-super-secret-key-change-this"  # Generate a random string!

# Optional (for better results)
GITHUB_TOKEN="your_github_personal_access_token"  # Higher rate limits
```

**To generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Start Database Services

```bash
npm run docker:up
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)

**Check they're running:**
```bash
docker ps
```

### Step 4: Setup Database

```bash
npm run setup
```

This script:
- Generates Prisma Client
- Runs database migrations
- Creates necessary directories
- Builds TypeScript

### Step 5: Start the Application

**Development mode (with hot reload):**
```bash
npm run dev
```

This starts 3 processes:
1. API Server (http://localhost:3001)
2. Background Worker (processes lead analysis jobs)
3. Frontend (http://localhost:3000)

**Production mode:**
```bash
# Build everything first
npm run build

# Start server and worker
npm run start:all
```

---

## 🎯 Usage

### 1. Create an Account

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "securepassword123",
    "name": "Your Name"
  }'
```

You'll get back a JWT token. Save it!

### 2. Analyze a Lead

```bash
curl -X POST http://localhost:3001/api/leads/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "github": "facebook/react"
  }'
```

You'll get a `jobId` back.

### 3. Check Job Status

```bash
curl http://localhost:3001/api/leads/job/JOB_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get Your Leads

```bash
curl http://localhost:3001/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎨 Frontend Usage

1. Open http://localhost:3000
2. Click "Sign Up" and create an account
3. You'll be automatically logged in
4. Use the search interface to analyze leads:
   - Enter a GitHub repo: `facebook/react` or `microsoft/vscode`
   - Or enter a website: `stripe.com` or `github.com`
5. View your leads, scores, and insights
6. Export leads to CSV, JSON, or PDF

---

## 🔧 Common Issues & Solutions

### "Connection refused" when starting

**Problem:** Docker services aren't running.

**Solution:**
```bash
npm run docker:up
# Wait 10 seconds for services to start
npm run dev
```

### "Prisma Client not generated"

**Solution:**
```bash
npm run prisma:generate
```

### "Migration failed"

**Solution:**
```bash
# Reset and recreate database
npm run prisma:reset
npm run setup
```

### Port already in use

**Solution:**
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill

# Or change PORT in .env
PORT=3002
```

### Worker not processing jobs

**Check worker is running:**
```bash
# In dev mode, it starts automatically with `npm run dev`
# Check logs for "Lead analyzer worker started"

# In production, start manually:
npm run start:worker
```

---

## 📊 Useful Commands

### Development
```bash
npm run dev              # Start everything
npm run server:dev       # Start server only
npm run worker:dev       # Start worker only
npm run client:dev       # Start frontend only
```

### Database
```bash
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Create new migration
npm run prisma:generate  # Regenerate Prisma Client
npm run prisma:reset     # Reset database (WARNING: deletes all data)
```

### Docker
```bash
npm run docker:up        # Start services
npm run docker:down      # Stop services
docker-compose logs -f   # View logs
```

### Code Quality
```bash
npm run lint             # Check code style
npm run format           # Auto-format code
npm test                 # Run tests
```

---

## 🎓 Understanding the Architecture

### How Lead Analysis Works

1. **You submit a lead** (GitHub repo or website)
2. **Job created** in Redis queue
3. **Worker picks up job** and starts analysis:
   - Analyzes GitHub repository (if provided)
   - Detects website technologies
   - Extracts contact information
   - Researches company profile
   - Calculates lead score
4. **Results saved** to PostgreSQL
5. **You retrieve** the analyzed lead

### Project Structure

```
├── server/               # Backend (TypeScript)
│   ├── config/          # Database, Redis, Queue
│   ├── middleware/      # Auth, Errors, Rate Limiting
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── workers/         # Background jobs
│   ├── utils/           # Helpers
│   └── index.ts         # Main server
├── client/              # Frontend (React + TypeScript)
│   └── src/
├── prisma/              # Database schema
└── docker-compose.yml   # Services
```

---

## 🔐 Security Notes

### Production Checklist

Before deploying to production:

1. ✅ Change `JWT_SECRET` to a strong random string
2. ✅ Use strong database passwords
3. ✅ Enable HTTPS
4. ✅ Set `NODE_ENV=production`
5. ✅ Configure `ALLOWED_ORIGINS` in .env
6. ✅ Set up Sentry (optional but recommended)
7. ✅ Enable database backups
8. ✅ Review rate limiting settings

---

## 💡 Tips & Tricks

### Speed up development

```bash
# Use nodemon config to watch specific files only
# Already configured in package.json
```

### Debug mode

```bash
# Set log level to debug
LOG_LEVEL=debug npm run dev
```

### Clear Redis cache

```bash
docker exec -it lead-discovery-redis redis-cli FLUSHALL
```

### View database directly

```bash
npm run prisma:studio
# Opens GUI at http://localhost:5555
```

### Export your leads

```bash
# From frontend: Click Export button
# Or via API:
curl http://localhost:3001/api/export/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"leads": [...]}' \
  > leads.csv
```

---

## 🆘 Getting Help

### Check Health

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### View Logs

```bash
# Server logs
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log

# Docker logs
docker-compose logs -f
```

### Reset Everything

```bash
# Nuclear option - resets database and clears cache
npm run docker:down
npm run docker:up
npm run prisma:reset
npm run setup
```

---

## 🚀 Next Steps

Once you're up and running:

1. **Try the examples** in the Usage section
2. **Explore the API** at http://localhost:3001/api
3. **Read the full README** for advanced features
4. **Check IMPROVEMENTS.md** to see what changed in v2.0
5. **Run tests** with `npm test`

---

## 📚 Additional Resources

- [Full README](./README.md) - Complete documentation
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - What's new in v2.0
- [Prisma Docs](https://www.prisma.io/docs/) - Database ORM
- [Bull Queue](https://github.com/OptimalBits/bull) - Job queue

---

**Happy lead hunting!** 🎯

If you encounter issues not covered here, check the logs first (`logs/error.log`), then review the environment configuration in `.env`.
