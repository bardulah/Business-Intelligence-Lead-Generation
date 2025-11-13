# Apollo.io Setup Guide
**Company Enrichment for Lead Generation**

Apollo.io has replaced Clearbit as our B2B data enrichment provider because:
- ✅ **10,000 free credits/year** (vs Clearbit's old 50 credits)
- ✅ **200M+ company profiles** with verified data
- ✅ **Better free tier** than any Clearbit alternative
- ✅ **Still actively maintained** (Clearbit was acquired and discontinued)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Sign Up for Apollo.io

1. Visit: https://www.apollo.io/sign-up
2. Choose "**Free Forever**" plan
3. Complete email verification
4. Fill out basic profile (company name, role, etc.)

**Free Tier Includes:**
- 10,000 email credits per year
- Unlimited email finder searches
- Company enrichment data
- Technology stack detection
- Employee count & revenue data

---

### Step 2: Get Your API Key

1. Log into Apollo.io: https://app.apollo.io
2. Click your profile icon (bottom left)
3. Go to **Settings** → **Integrations** → **API**
4. Or direct link: https://app.apollo.io/#/settings/integrations/api
5. Click "**Create New Key**"
6. Name it: `Lead Generation App`
7. Copy the API key (starts with: `...`)

**⚠️ Security Note**: Keep this key private! Never commit it to Git.

---

### Step 3: Add to Environment Variables

#### Option A: Local Development
```bash
# In Business-Intelligence-Lead-Generation/.env
APOLLO_API_KEY=your_apollo_api_key_here
```

#### Option B: Production (VPS/Vercel)
```bash
# Add to your deployment platform's environment variables
export APOLLO_API_KEY=your_apollo_api_key_here
```

---

### Step 4: Test the Integration

```bash
cd Business-Intelligence-Lead-Generation
npm install
npm run dev

# In another terminal, test the API:
curl -X POST http://localhost:3002/api/leads/research \
  -H "Content-Type: application/json" \
  -d '{"domain": "stripe.com"}'
```

**Expected Response:**
```json
{
  "domain": "stripe.com",
  "name": "Stripe",
  "description": "Online payment processing for internet businesses",
  "industry": "Fintech",
  "employeeCount": 8000,
  "revenue": "$1B-$10B",
  "location": "San Francisco, CA, United States",
  "technologies": ["React", "Node.js", "Ruby", "AWS"],
  "metadata": {
    "dataSource": "apollo.io",
    "confidence": 0.95
  }
}
```

---

## 📊 What Data Does Apollo.io Provide?

### Company Information
- ✅ Company name & description
- ✅ Industry classification
- ✅ Headquarters location
- ✅ Founded year
- ✅ Employee count (estimated)
- ✅ Annual revenue range
- ✅ Company website & domain
- ✅ LinkedIn, Twitter, Facebook URLs

### Contact Discovery
- ✅ Decision maker emails (Founders, CEOs, CTOs, VPs)
- ✅ Job titles & seniority levels
- ✅ LinkedIn profiles
- ✅ Phone numbers (when available)

### Technology Stack
- ✅ Technologies used (React, AWS, Stripe, etc.)
- ✅ Tool categories (CRM, Analytics, etc.)
- ✅ Technology adoption timeline

---

## 🔄 How It Works in Our App

### Without Apollo.io (Fallback Mode)
```
Company Domain → Web Scraping → Basic Info
                 ↓
            Cheerio Parsing → Company profile (low confidence)
```

### With Apollo.io (Enhanced Mode)
```
Company Domain → Apollo.io API → Rich B2B Data
                 ↓
            Merge with Web Scraping → Complete profile (high confidence)
```

**Smart Fallback**: If Apollo.io fails or is not configured, the app automatically falls back to web scraping. No errors, just less detailed data.

---

## 💡 Usage Examples

### Example 1: Basic Company Enrichment
```javascript
const apolloEnrichment = require('./server/services/apolloEnrichment');

const companyData = await apolloEnrichment.enrichCompany('stripe.com');

console.log(companyData.name);          // "Stripe"
console.log(companyData.employeeCount);  // 8000
console.log(companyData.revenue);        // "$1B-$10B"
console.log(companyData.technologies);   // ["React", "Node.js", ...]
```

### Example 2: Find Decision Makers
```javascript
const contacts = await apolloEnrichment.findContacts('stripe.com', {
  titles: ['CEO', 'CTO', 'VP Engineering'],
  seniorities: ['c_suite', 'vp'],
  limit: 10
});

contacts.forEach(contact => {
  console.log(`${contact.name} - ${contact.title}`);
  console.log(`Email: ${contact.email}`);
  console.log(`LinkedIn: ${contact.linkedin}`);
});
```

### Example 3: Check Credits Remaining
```javascript
const credits = await apolloEnrichment.getCreditsRemaining();
console.log(credits.message); // "Check credits at: https://app.apollo.io/#/settings/credits"
```

---

## 📈 Credit Management

### How Credits Work
- **1 credit** = 1 company enrichment API call
- **1 credit** = 1 contact email reveal
- **Free tier**: 10,000 credits/year
- **Resets**: Annually on your signup date

### Check Credit Usage
1. Go to: https://app.apollo.io/#/settings/credits
2. View remaining credits
3. See usage history

### Tips to Save Credits
1. **Enable caching**: Company data is cached for 24 hours automatically
2. **Batch requests**: Process multiple leads before enrichment
3. **Use fallback mode**: Web scraping works for basic data without using credits
4. **Target carefully**: Only enrich high-quality leads

---

## ⚙️ Configuration Options

### Environment Variables

```bash
# Required
APOLLO_API_KEY=your_api_key_here

# Optional - Configure in companyResearch.js
APOLLO_TIMEOUT=15000           # API timeout (ms)
APOLLO_CACHE_TTL=86400000      # Cache duration (24 hours)
APOLLO_MAX_RETRIES=2           # Retry failed requests
```

### Service Configuration

Edit `server/services/apolloEnrichment.js` to customize:

```javascript
class ApolloEnrichment {
  constructor() {
    this.apiKey = process.env.APOLLO_API_KEY;
    this.baseUrl = 'https://api.apollo.io/v1';
    this.timeout = 15000;  // ← Change timeout here
  }
}
```

---

## 🐛 Troubleshooting

### Error: "APOLLO_API_KEY not set"
**Solution**: Add your API key to `.env` file:
```bash
APOLLO_API_KEY=your_actual_key_here
```

### Error: "401 Unauthorized"
**Cause**: Invalid or expired API key
**Solution**:
1. Check key is correct in `.env`
2. Regenerate key at: https://app.apollo.io/#/settings/integrations/api
3. Ensure no extra spaces/quotes in `.env`

### Error: "429 Too Many Requests"
**Cause**: Rate limit exceeded
**Solution**:
1. Apollo.io limits: 200 requests/minute
2. Wait 1 minute and retry
3. Enable request queuing (add p-retry)

### Error: "404 Not Found"
**Cause**: Company not in Apollo's database
**Solution**: This is normal! App automatically falls back to web scraping.

### No Data Returned
**Debugging steps**:
```bash
# 1. Check if Apollo is configured
node -e "console.log(require('./server/services/apolloEnrichment').isConfigured())"

# 2. Test API key directly
curl -H "X-Api-Key: YOUR_KEY" https://api.apollo.io/v1/organizations/enrich \
  -X POST -d '{"domain":"stripe.com"}' -H "Content-Type: application/json"

# 3. Check logs for error messages
npm run dev  # Look for Apollo enrichment errors
```

---

## 📚 API Documentation

### Apollo.io Official Docs
- API Reference: https://apolloio.github.io/apollo-api-docs/
- Rate Limits: https://apolloio.github.io/apollo-api-docs/#rate-limiting
- Authentication: https://apolloio.github.io/apollo-api-docs/#authentication

### Key Endpoints We Use

#### 1. Organization Enrichment
```
POST /v1/organizations/enrich
Body: { "domain": "stripe.com" }
Returns: Full company profile
```

#### 2. People Search
```
POST /v1/mixed_people/search
Body: {
  "organization_domains": ["stripe.com"],
  "person_titles": ["CEO", "CTO"],
  "per_page": 10
}
Returns: List of contacts
```

---

## 🔄 Upgrading from Free Tier

### When to Upgrade?
- Using >10,000 credits/year
- Need phone numbers for all contacts
- Want advanced filtering options
- Need CRM integrations

### Paid Plans
- **Basic**: $49/month (12,000 credits)
- **Professional**: $99/month (24,000 credits)
- **Organization**: $149/month (unlimited credits)

**Note**: Free tier is perfect for most startups and side projects!

---

## 🆚 Apollo.io vs Clearbit

| Feature | Apollo.io (Free) | Clearbit (Discontinued) |
|---------|------------------|------------------------|
| Free Credits | 10,000/year | 50 total (old) |
| Company Data | ✅ Yes | ❌ No longer available |
| Employee Count | ✅ Yes | ✅ Was available |
| Revenue Data | ✅ Yes | ✅ Was available |
| Tech Stack | ✅ Yes | ❌ No |
| Contact Discovery | ✅ Yes | ❌ No |
| Active Development | ✅ Yes | ❌ Acquired/shut down |
| Cost | Free tier rocks | $$$$ Enterprise only |

**Winner**: Apollo.io 🎉

---

## 🤝 Support

### Apollo.io Support
- Help Center: https://help.apollo.io/
- Email: support@apollo.io
- Community: Apollo Slack (invite on their site)

### Our Implementation Support
- Check `server/services/apolloEnrichment.js` for code
- Check `server/services/companyResearch.js` for integration
- See logs for debugging: `tail -f logs/app.log`

---

## ✅ Checklist

Setup complete when you can check all these:

- [ ] Signed up for Apollo.io free account
- [ ] Created API key at https://app.apollo.io/#/settings/integrations/api
- [ ] Added `APOLLO_API_KEY` to `.env` file
- [ ] Tested enrichment with `stripe.com` or similar company
- [ ] Verified data source shows "apollo.io" in response metadata
- [ ] Checked credit usage at https://app.apollo.io/#/settings/credits

---

**🎉 You're all set!** Apollo.io will now provide rich B2B data for your lead generation app.

Need help? Open an issue or check the logs at `logs/app.log`
