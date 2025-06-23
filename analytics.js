/**
 * GA4 Analytics Tracking for Gaza Crisis Tracker
 * Comprehensive tracking of user engagement with humanitarian data
 */

class CrisisAnalytics {
    constructor() {
        this.startTime = Date.now();
        this.timeEngaged = 0;
        this.maxScroll = 0;
        this.scrollPoints = [25, 50, 75, 90, 100];
        this.firedScrollPoints = [];
        this.donationClicks = 0;
        this.sectionsViewed = new Set();
        
        this.init();
    }

    init() {
        if (typeof gtag === 'undefined') {
            console.warn('GA4 not loaded');
            return;
        }

        this.setupEngagementTracking();
        this.setupSectionTracking();
        this.setupScrollTracking();
        this.setupDonationTracking();
        this.setupSocialTracking();
        this.setupStatisticTracking();
        this.setupPerformanceTracking();
        this.setupErrorTracking();
        this.setupExitTracking();
    }

    // Track time-based engagement with crisis data
    setupEngagementTracking() {
        setInterval(() => {
            if (document.hasFocus() && !document.hidden) {
                this.timeEngaged += 30;
                const countdownElement = document.querySelector('.time-remaining');
                
                gtag('event', 'crisis_data_engagement', {
                    'engagement_time_seconds': this.timeEngaged,
                    'countdown_value': countdownElement ? countdownElement.textContent : 'loading',
                    'current_death_toll': this.getCurrentDeathToll()
                });
            }
        }, 30000);
    }

    // Track when users view each major section
    setupSectionTracking() {
        const sections = [
            'extinction-timeline',
            'casualty-tracker', 
            'take-action'
        ];

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.sectionsViewed.has(entry.target.id)) {
                    this.sectionsViewed.add(entry.target.id);
                    
                    gtag('event', 'section_viewed', {
                        'section_name': entry.target.id,
                        'percentage_viewed': Math.round(entry.intersectionRatio * 100),
                        'time_to_section': Math.floor((Date.now() - this.startTime) / 1000)
                    });
                }
            });
        }, observerOptions);

        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) sectionObserver.observe(element);
        });
    }

    // Track scroll depth to measure engagement
    setupScrollTracking() {
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > this.maxScroll) {
                this.maxScroll = scrollPercent;
                
                this.scrollPoints.forEach(point => {
                    if (scrollPercent >= point && !this.firedScrollPoints.includes(point)) {
                        this.firedScrollPoints.push(point);
                        
                        gtag('event', 'scroll', {
                            'percent_scrolled': point,
                            'time_to_scroll': Math.floor((Date.now() - this.startTime) / 1000)
                        });
                    }
                });
            }
        });
    }

    // Track donation and aid organization clicks
    setupDonationTracking() {
        // Use event delegation to catch dynamically added elements
        document.addEventListener('click', (e) => {
            const donateButton = e.target.closest('.donate-button');
            if (donateButton) {
                this.donationClicks++;
                
                const orgCard = donateButton.closest('.organization');
                const orgName = orgCard ? (
                    orgCard.querySelector('.org-name')?.textContent ||
                    orgCard.querySelector('h4')?.textContent ||
                    'unknown'
                ) : 'unknown';
                
                const section = donateButton.closest('section')?.id || 'unknown';
                
                gtag('event', 'donation_click', {
                    'organization': orgName,
                    'section_type': section,
                    'current_death_toll': this.getCurrentDeathToll(),
                    'time_on_page': Math.floor((Date.now() - this.startTime) / 1000),
                    'donation_sequence': this.donationClicks
                });

                // Enhanced e-commerce tracking
                gtag('event', 'view_item', {
                    'currency': 'USD',
                    'value': 25, // Default suggested amount
                    'items': [{
                        'item_id': orgName.toLowerCase().replace(/\s+/g, '_'),
                        'item_name': orgName,
                        'item_category': 'humanitarian_aid',
                        'price': 25,
                        'quantity': 1
                    }]
                });
            }
        });
    }

    // Track social sharing interactions
    setupSocialTracking() {
        document.addEventListener('click', (e) => {
            const shareButton = e.target.closest('.share-btn, .share-button');
            if (shareButton) {
                const platform = shareButton.className.includes('twitter') ? 'twitter' :
                               shareButton.className.includes('facebook') ? 'facebook' :
                               shareButton.className.includes('linkedin') ? 'linkedin' :
                               shareButton.className.includes('copy') ? 'copy_link' :
                               'unknown';
                
                gtag('event', 'share', {
                    'method': platform,
                    'content_type': 'humanitarian_crisis',
                    'item_id': 'gaza_crisis_tracker',
                    'current_casualties': this.getCurrentDeathToll()
                });
            }
        });
    }

    // Track interaction with critical statistics
    setupStatisticTracking() {
        const criticalStats = {
            'total-killed': 'total_casualties',
            'children-killed': 'children_casualties',
            'hospitals-destroyed': 'hospitals_destroyed',
            'schools-destroyed': 'schools_destroyed',
            'mosques-destroyed': 'mosques_destroyed',
            'homes-destroyed': 'homes_destroyed'
        };

        Object.keys(criticalStats).forEach(statId => {
            const element = document.getElementById(statId);
            if (element) {
                element.addEventListener('mouseenter', () => {
                    gtag('event', 'statistic_focus', {
                        'statistic_type': criticalStats[statId],
                        'current_value': element.textContent,
                        'focus_time': Math.floor((Date.now() - this.startTime) / 1000)
                    });
                });
            }
        });
    }

    // Track page performance metrics
    setupPerformanceTracking() {
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domInteractiveTime = perfData.domInteractive - perfData.navigationStart;
                
                gtag('event', 'page_timing', {
                    'page_load_time': pageLoadTime,
                    'dom_interactive_time': domInteractiveTime,
                    'page_type': 'crisis_tracker'
                });
            }
        });
    }

    // Track JavaScript errors and API failures
    setupErrorTracking() {
        window.addEventListener('error', (e) => {
            gtag('event', 'exception', {
                'description': e.message,
                'fatal': false,
                'error_type': 'javascript_error',
                'filename': e.filename,
                'line_number': e.lineno
            });
        });

        // Expose method for API error tracking
        window.trackAPIError = (endpoint, error) => {
            gtag('event', 'api_error', {
                'endpoint': endpoint,
                'error_message': error.message || 'Unknown error',
                'error_code': error.code || 'unknown'
            });
        };
    }

    // Track user exit intent and session summary
    setupExitTracking() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                gtag('event', 'page_exit_intent', {
                    'time_on_page': Math.floor((Date.now() - this.startTime) / 1000),
                    'max_scroll_depth': this.maxScroll,
                    'donations_clicked': this.donationClicks,
                    'sections_viewed': this.sectionsViewed.size,
                    'engagement_level': this.calculateEngagementLevel()
                });
            }
        });

        // Track page unload
        window.addEventListener('beforeunload', () => {
            gtag('event', 'session_end', {
                'session_duration': Math.floor((Date.now() - this.startTime) / 1000),
                'final_scroll_depth': this.maxScroll,
                'total_donations_clicked': this.donationClicks
            });
        });
    }

    // Utility methods
    getCurrentDeathToll() {
        const totalKilledElement = document.getElementById('total-killed');
        return totalKilledElement ? totalKilledElement.textContent.replace(/,/g, '') : '0';
    }

    calculateEngagementLevel() {
        let score = 0;
        if (this.timeEngaged >= 60) score += 2; // Spent more than 1 minute
        if (this.maxScroll >= 75) score += 2; // Scrolled past 75%
        if (this.donationClicks > 0) score += 3; // Clicked donations
        if (this.sectionsViewed.size >= 2) score += 1; // Viewed multiple sections
        
        if (score >= 6) return 'high';
        if (score >= 3) return 'medium';
        return 'low';
    }

    calculateSeverityScore() {
        const currentToll = parseInt(this.getCurrentDeathToll()) || 0;
        if (currentToll > 40000) return 'critical';
        if (currentToll > 30000) return 'severe';
        if (currentToll > 20000) return 'high';
        return 'moderate';
    }

    // Method to track data updates from API
    trackDataUpdate(newData) {
        gtag('event', 'data_refresh', {
            'total_casualties': newData.killed?.total || 0,
            'children_casualties': newData.killed?.children || 0,
            'daily_rate': newData.daily_average || 0,
            'data_source': 'tech_for_palestine'
        });
    }
}

// Initialize analytics when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.crisisAnalytics = new CrisisAnalytics();
    });
} else {
    window.crisisAnalytics = new CrisisAnalytics();
}

// Configure GA4 with custom dimensions
if (typeof gtag !== 'undefined') {
    gtag('config', 'G-CB4PGRSSCB', {
        'custom_map.dimension1': 'crisis_severity',
        'custom_map.dimension2': 'user_action_taken',
        'crisis_severity': 'critical',
        'user_action_taken': 'viewing'
    });
}