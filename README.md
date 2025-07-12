# Gaza Population Crisis Tracker

## Overview
A comprehensive real-time visualization platform showing the humanitarian crisis in Gaza through authenticated data sources. This project calculates population trajectory based on current casualty rates and provides actionable humanitarian aid connections.

## Purpose
- Raise global awareness about the ongoing humanitarian crisis
- Present verified data from reliable international sources
- Connect users with legitimate humanitarian organizations
- Create urgent understanding through data-driven visualization
- Maintain digital dignity while showcasing critical statistics

## Data Sources
- **Primary API**: Tech for Palestine (`https://data.techforpalestine.org/api/v2/summary.json`)
- **Population Statistics**: UN demographic sources
- **Infrastructure Data**: International humanitarian organizations
- **Update Frequency**: Real-time with 5-minute caching for performance

## Key Features

### 1. Extinction Timeline Calculator
- Shows estimated time until complete population loss at current rates
- Real-time countdown with years, months, days, hours, minutes
- Based on daily death rate calculations from authentic data

### 2. Live Crisis Dashboard
- Real-time casualty statistics (total killed, children, women)
- Infrastructure destruction metrics (hospitals, schools, homes, mosques)
- Population loss visualization with progress indicators
- Days since October 7th, 2023 tracking

### 3. Humanitarian Action Center
- Direct links to verified aid organizations (UNRWA, Islamic Relief, PCRF)
- Medical support connections (Doctors Without Borders)
- Advocacy platforms (Jewish Voice for Peace)
- Social sharing functionality for awareness

## Technical Architecture

### Frontend Stack
- **Core**: Vanilla JavaScript (no frameworks for maximum performance)
- **Styling**: CSS3 with custom properties and responsive design
- **Analytics**: Google Analytics 4 with crisis-specific tracking
- **Security**: Comprehensive CSP headers and HTTPS enforcement

### Performance Optimizations
- Critical CSS inlined for immediate rendering
- DNS prefetching for external API calls
- Intersection Observer for efficient scroll animations
- Local storage caching with 5-minute expiration
- Progressive Web App capabilities with manifest.json

### Security Features
- Content Security Policy (CSP) headers
- X-Frame-Options protection
- HTTPS Strict Transport Security (HSTS)
- XSS protection and content type validation
- Referrer policy and permissions restrictions

### Accessibility
- ARIA live regions for screen reader compatibility
- Semantic HTML structure with proper roles
- Keyboard navigation support
- Reduced motion preferences respected
- High contrast color scheme for readability

## File Structure
```
├── index.html              # Main application page
├── styles.css              # Comprehensive styling
├── script.js               # Core application logic
├── analytics.js            # GA4 tracking implementation
├── manifest.json           # PWA configuration
├── robots.txt              # Search engine directives
├── sitemap.xml             # SEO sitemap with hourly updates
├── .htaccess               # Production security headers
├── favicon.ico             # Site icon
└── README.md               # This documentation
```

## Deployment Options

### Static Hosting (Recommended)
- **Netlify**: Deploy directly from repository
- **Vercel**: Automatic HTTPS and global CDN
- **GitHub Pages**: Free hosting with custom domains
- **Replit**: Current development environment

### Server Requirements
- Static file serving capability
- HTTPS support (required for API access)
- Gzip compression support (recommended)
- Custom header configuration (.htaccess support)

### Environment Setup
1. Clone repository
2. Verify API endpoint accessibility
3. Update domain references in meta tags
4. Configure security headers via .htaccess
5. Test GA4 tracking with your measurement ID
6. Deploy to HTTPS-enabled hosting

## Security Considerations
- All external API calls use HTTPS
- No sensitive data stored locally
- CSP headers prevent XSS attacks
- HSTS enforces secure connections
- Regular security header audits

## Performance Metrics
- **Target LCP**: < 2.5 seconds
- **Target FID**: < 100 milliseconds  
- **Target CLS**: < 0.1
- **Cache Strategy**: 5-minute API caching
- **Bundle Size**: < 50KB total (no external frameworks)

## Contributing Guidelines
This humanitarian project welcomes contributions that:
- Improve data accuracy and reliability
- Enhance accessibility and user experience
- Optimize performance and security
- Maintain dignity and respect for the crisis
- Follow established coding standards

## Data Integrity
- All statistics sourced from verified humanitarian organizations
- No synthetic or placeholder data used
- Real-time API integration with fallback caching
- Transparent data attribution and source links

## License & Attribution
Data provided by Tech for Palestine. This project serves humanitarian purposes and maintains data integrity from verified sources.

## Support
For technical issues or humanitarian resource additions, please ensure suggestions align with verified data sources and maintain the project's humanitarian focus.

## Disclaimer
This project focuses on humanitarian data and does not take political positions. All statistics are from verified international sources.

## License
MIT License - Free to use and modify for humanitarian purposes

## Contact
For data verification or humanitarian partnerships: contact@techforpalestine.org

---
*"Every donation, every voice, every action slows the countdown"*