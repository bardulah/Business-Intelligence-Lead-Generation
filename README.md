# 🔍 Lead Discovery & Research Tool

A powerful, intelligent business intelligence tool for automated lead discovery, research, and qualification. This tool combines GitHub repository analysis, website technology detection, contact extraction, and AI-powered lead scoring to help you identify and prioritize the best business opportunities.

![Lead Discovery Tool](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Core Features

### 🎯 Lead Discovery
- **GitHub Repository Scanning**: Analyze repositories, contributors, activity, and technology stack
- **Website Technology Detection**: Identify frameworks, hosting, analytics, CMS, and more
- **Company Profile Research**: Extract business information, industry, size, and social proof
- **Contact Information Extraction**: Find emails, phone numbers, and social media profiles

### 📊 Lead Intelligence
- **AI-Powered Lead Scoring**: Multi-factor scoring algorithm (0-100 scale)
- **Priority Ranking**: Automatic categorization (High, Medium, Low)
- **Confidence Indicators**: Data quality and reliability metrics
- **Reasoning Engine**: Detailed insights explaining each lead's score

### 🎨 User Interface
- **Detective-Style Dashboard**: Professional, data-driven design
- **Visual Lead Cards**: Quick-scan interface with key metrics
- **Detailed Analysis Views**: Comprehensive lead profiles
- **Interactive Charts**: Score breakdowns and visualizations
- **Real-time Filtering**: Sort and filter by score, priority, and more

### 📥 Export & Integration
- **Multiple Export Formats**: CSV, JSON, PDF
- **Professional Reports**: Formatted PDF lead reports
- **CRM Integration Ready**: Prepared for HubSpot, Salesforce integration

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- GitHub Personal Access Token (optional, for higher rate limits)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Business-Intelligence-Lead-Generation.git
cd Business-Intelligence-Lead-Generation
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env and add your API keys (optional)
```

4. **Start the application**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001

# Optional: GitHub API (for higher rate limits)
GITHUB_TOKEN=your_github_token_here

# Optional: Third-party APIs for enhanced data
CLEARBIT_API_KEY=your_clearbit_api_key_here
HUNTER_API_KEY=your_hunter_api_key_here
```

### API Keys Setup

#### GitHub Token (Recommended)
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token with `public_repo` scope
3. Add to `.env` file

## 📖 Usage Guide

### Analyzing a Single Lead

**Option 1: GitHub Repository**
```
Input: facebook/react
or: https://github.com/facebook/react
```

**Option 2: Website URL**
```
Input: example.com
or: https://example.com
```

### Searching GitHub

Use the Search mode to discover multiple leads at once:
```
Search: "ai tools"
Search: "react framework"
Search: "machine learning python"
```

### Understanding Lead Scores

**Score Components (0-100)**
- **GitHub Activity** (25%): Repository engagement, stars, commits
- **Technology Stack** (20%): Modern frameworks, tools, architecture
- **Company Profile** (25%): Size, maturity, online presence
- **Contact Information** (15%): Availability of contact channels
- **Engagement** (15%): Recent activity, social proof

**Priority Levels**
- 🔥 **High** (70-100): Hot leads with strong potential
- ⚡ **Medium** (50-69): Warm leads worth pursuing
- ✓ **Low** (30-49): Cold leads, lower priority
- · **Very Low** (0-29): Minimal potential

### Filtering & Sorting

Use the filter panel to:
- Set minimum score threshold
- Filter by priority level
- Sort by score or recency

### Exporting Leads

1. Click the **Export** button in the header
2. Choose format:
   - **CSV**: For spreadsheet analysis
   - **JSON**: For programmatic use
   - **PDF**: For professional reports

## 🏗️ Architecture

### Backend Stack
- **Node.js** + Express: RESTful API server
- **Axios**: HTTP client for external APIs
- **Cheerio**: Web scraping and HTML parsing
- **PDFKit**: PDF report generation
- **Node-Cache**: In-memory caching

### Frontend Stack
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualizations
- **Axios**: API communication

### Services Architecture

```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  - Search Interface                 │
│  - Lead Cards & Details             │
│  - Filters & Visualizations         │
└────────────┬────────────────────────┘
             │
    ┌────────▼────────┐
    │   API Layer     │
    │   (Express)     │
    └────────┬────────┘
             │
    ┌────────▼─────────────────────────┐
    │        Core Services             │
    ├──────────────────────────────────┤
    │ • GitHub Scanner                 │
    │ • Technology Detector            │
    │ • Contact Extractor              │
    │ • Company Research               │
    │ • Lead Scoring Engine            │
    └──────────────────────────────────┘
```

## 🔌 API Reference

### Lead Analysis
```http
POST /api/leads/analyze
Content-Type: application/json

{
  "github": "owner/repo",
  "website": "example.com"
}
```

### GitHub Search
```http
GET /api/github/search?q=react&limit=10
```

### Technology Detection
```http
POST /api/technology/detect
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Contact Extraction
```http
POST /api/contacts/extract
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Export Leads
```http
POST /api/export/csv
POST /api/export/json
POST /api/export/pdf
Content-Type: application/json

{
  "leads": [...]
}
```

## 🎯 Use Cases

### For Sales Teams
- Identify high-potential prospects
- Prioritize outreach based on lead scores
- Extract contact information automatically
- Generate professional lead reports

### For Marketing
- Research competitor technology stacks
- Identify market trends and popular tools
- Build targeted prospect lists
- Analyze company profiles and social proof

### For Business Development
- Discover potential partnership opportunities
- Evaluate company technical sophistication
- Track GitHub activity and engagement
- Export leads to CRM systems

### For Investors
- Research startup technical capabilities
- Evaluate development activity
- Assess team size and engagement
- Analyze technology choices

## 🔒 Privacy & Ethics

This tool is designed for legitimate business intelligence and research purposes:
- Respects robots.txt and rate limits
- Only collects publicly available information
- No unauthorized data access
- Compliant with ethical web scraping practices

**Please use responsibly and in accordance with applicable laws and terms of service.**

## 🛠️ Development

### Project Structure
```
Business-Intelligence-Lead-Generation/
├── server/                 # Backend API
│   ├── index.js           # Server entry point
│   ├── routes/            # API endpoints
│   │   ├── leads.js
│   │   ├── github.js
│   │   ├── technology.js
│   │   ├── contacts.js
│   │   └── export.js
│   └── services/          # Core business logic
│       ├── githubScanner.js
│       ├── technologyDetector.js
│       ├── contactExtractor.js
│       ├── companyResearch.js
│       └── leadScoring.js
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

### Running Tests
```bash
# Coming soon
npm test
```

### Building for Production
```bash
# Build frontend
cd client && npm run build

# Start production server
npm start
```

## 🚧 Roadmap

### Version 1.1
- [ ] Advanced filtering options
- [ ] Lead notes and tagging
- [ ] Export history and templates
- [ ] Batch import from CSV

### Version 1.2
- [ ] CRM integrations (HubSpot, Salesforce)
- [ ] Email verification API integration
- [ ] LinkedIn profile enrichment
- [ ] Automated lead monitoring

### Version 2.0
- [ ] Machine learning-based scoring
- [ ] Custom scoring models
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- GitHub API for repository data
- Open source community for amazing tools
- All contributors to this project

## 📧 Contact & Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check existing documentation
- Review closed issues for solutions

---

**Built with ❤️ for better business intelligence**

*Lead Discovery Tool - Finding the right opportunities, intelligently.*
