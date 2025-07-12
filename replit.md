# Gaza Crisis Timeline - Replit Documentation

## Overview

This is a single-page website that visualizes the humanitarian crisis in Gaza through data-driven countdowns and real-time statistics. The application creates emotional impact while maintaining dignity, using vanilla JavaScript for performance optimization and mobile-first responsive design.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Vanilla JavaScript, HTML5, CSS3 (no heavy frameworks)
- **Design Approach**: Mobile-first responsive design with progressive enhancement
- **Performance**: Optimized for Core Web Vitals (LCP < 2.5s, FIP < 100ms, CLS < 0.1)
- **Asset Strategy**: Critical CSS inlined, minimal dependencies for maximum performance

### Data Architecture
- **Primary Data Source**: Tech for Palestine API (`https://data.techforpalestine.org/api/v3/summary_latest.json`)
- **Caching Strategy**: Local storage caching with 5-minute expiration
- **Refresh Pattern**: Auto-refresh every 5 minutes for real-time updates
- **Fallback**: Graceful degradation when API is unavailable

## Key Components

### 1. Countdown Timer System
- **Purpose**: Shows estimated time until total population loss based on current death rates
- **Calculation**: Uses daily death rate average from last 30 days against Gaza population (~2.3 million)
- **Display Format**: YEARS : MONTHS : DAYS : HOURS : MINUTES with smooth transitions
- **Visual Design**: Large monospace font with red accent color for urgency

### 2. Data Management Class (`GazaCrisisApp`)
- **Initialization**: Handles app startup, data loading, and event setup
- **Caching**: Implements client-side caching to reduce API calls
- **Error Handling**: Graceful fallbacks for network failures
- **Performance**: Intersection Observer for scroll-based animations

### 3. Visual Design System
- **Color Palette**: Dark backgrounds (#0a0a0a), red accents (#ff3333), white text
- **Typography**: System fonts for performance, monospace for countdown display
- **Animations**: Subtle pulse effects and smooth transitions
- **Responsive**: CSS custom properties for scalable design tokens

## Data Flow

1. **Application Initialization**
   - Load critical CSS inline for immediate rendering
   - Initialize GazaCrisisApp class
   - Show loading state while fetching data

2. **Data Fetching**
   - Check local cache first (5-minute expiration)
   - Fetch from Tech for Palestine API
   - Parse JSON response and extract casualty data
   - Store in cache for subsequent loads

3. **Countdown Calculation**
   - Calculate daily death rate from API data
   - Determine remaining population (2.3M - current deaths)
   - Compute time until extinction at current rate
   - Update display every second with smooth animations

4. **Auto-Refresh Cycle**
   - Refresh data every 5 minutes
   - Update calculations and display
   - Maintain user scroll position and state

## External Dependencies

### APIs
- **Tech for Palestine API**: Primary data source for Gaza casualty statistics
- **Endpoint**: `https://data.techforpalestine.org/api/v3/summary_latest.json`
- **Update Frequency**: Real-time data, cached locally for 5 minutes

### Performance Optimizations
- **DNS Prefetch**: Preconnect to data API domain
- **No External Libraries**: Vanilla JS for minimal bundle size
- **Critical CSS**: Inlined for above-the-fold content
- **Intersection Observer**: Efficient scroll-based animations

## Deployment Strategy

### Current Setup
- **Runtime**: Python HTTP server on port 5000
- **Static Hosting**: Simple file serving for HTML/CSS/JS assets
- **Environment**: Replit with Node.js 20 and Python 3.11 modules

### Production Considerations
- **CDN**: Can be deployed to any static hosting (Netlify, Vercel, GitHub Pages)
- **HTTPS**: Required for API access and modern browser features
- **Caching**: HTTP caching headers for static assets
- **Monitoring**: Consider API rate limiting and error tracking

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 12, 2025 - Comprehensive Security, Performance & Architecture Audit Fixes ✅ COMPLETED
- **Security**: Added comprehensive security headers (CSP, XFO, HSTS), verified API endpoint consistency (v2 working)
- **Performance**: Enhanced error handling with timeout controls, fixed memory leaks in intervals, added proper cleanup
- **SEO**: Updated sitemap with proper timestamps and hourly changefreq, unified domain references across all configs
- **Accessibility**: Added proper ARIA labels and live regions for screen readers
- **Infrastructure**: Created .htaccess for production deployment, added PWA manifest.json
- **Error Handling**: Improved graceful degradation and fallback mechanisms
- **User Confirmation**: All fixes applied successfully, site functionality maintained and verified

## Changelog

```
Changelog:
- June 23, 2025. Initial setup and comprehensive optimization
```