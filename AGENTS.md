# Agent Handoff Document: Business-Intelligence-Lead-Generation

**Last Updated**: 2025-11-10
**Current Agent**: Gemini

---

## 🎯 1. Current Status

### Project Overview
This is a full-stack web application designed to help users find and qualify business leads. It analyzes GitHub repositories and company websites, scores them using an AI-powered system, and presents the data in a web dashboard.

### Deployment Status
*   **Status**: ✅ **LIVE**
*   **Platform**: VPS (via PM2)
*   **Live URL**: [https://curak.xyz](https://curak.xyz)
*   **Internal Port**: `3002`

### Technology Stack
*   **Backend**: Node.js, TypeScript, Express, Prisma, PostgreSQL, Redis, Bull
*   **Frontend**: React, TypeScript, Vite, Tailwind CSS
*   **Database**: Neon PostgreSQL (Cloud)
*   **Infrastructure**: Deployed on a VPS, managed by PM2, with Nginx as a reverse proxy.

### Key Files
*   `INSTRUCTIONS.md`: User-facing guide on how to use the application.
*   `AGENTS.md`: This file.
*   `.env`: **Contains production API keys and credentials. This file is gitignored.**
*   `ecosystem.config.js`: (Located in `/opt/deployment/`) PM2 configuration file.

---

## 🚀 2. Recommended Improvements

This section outlines potential future enhancements for the project.

1.  **Real-time Notifications**: Implement real-time alerts (e.g., via WebSockets) to notify the user when a background job (like lead analysis) is complete.
2.  **Direct CRM Integration**: Build out a direct integration with a popular CRM like HubSpot or Salesforce to sync leads automatically, moving beyond the current "CRM Ready" status.
3.  **Historical Snapshots**: Allow users to save and compare snapshots of a company's technology stack or GitHub activity over time to track changes and identify trends.
4.  **Advanced Filtering**: Enhance the dashboard with more granular filtering options, such as filtering by specific technologies, GitHub star count, or company size.
5.  **User Accounts & Teams**: Implement a full user authentication system where users can save their searches, manage their own lead lists, and collaborate in teams.

---

## 🤝 3. Agent Handoff Notes

### How to Work on This Project

*   **Running Locally**: The recommended way to work on this project is to use the `docker-compose.yml` file for a consistent development environment. Run `docker-compose up -d` in the project root.
*   **Deployment**: The application is deployed using **PM2**. To restart the live service after making changes, you would typically run `pm2 restart lead-gen`.
*   **Database**: The production database is a cloud-hosted Neon PostgreSQL instance. The connection string is in the `.env` file.
*   **Updating Documentation**: If you make any user-facing changes, update the `INSTRUCTIONS.md` file. If you make architectural or deployment changes, update this `AGENTS.md` file.

### What to Watch Out For

*   **Environment Variables**: This project relies heavily on API keys and database credentials stored in a `.env` file. This file is gitignored and must be created manually from `.env.example` for local development. The production server has the correct variables configured for the PM2 process.
*   **Background Jobs**: The application uses Redis and Bull for background job processing. If leads are not being processed, check the status of the Redis service and the Bull queue.
*   **Deployment Mismatch**: Be aware that the live deployment method (PM2) is different from the local development setup (Docker).
