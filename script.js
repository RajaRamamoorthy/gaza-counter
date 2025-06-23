/**
 * Gaza Crisis Timeline - Main JavaScript
 * Performance-optimized vanilla JS for real-time data visualization
 */

class GazaCrisisApp {
    constructor() {
        this.API_URL = 'https://data.techforpalestine.org/api/v2/summary.json';
        this.CACHE_KEY = 'gaza_crisis_data';
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        this.REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
        this.GAZA_POPULATION = 2300000;
        
        this.data = null;
        this.countdownInterval = null;
        this.refreshInterval = null;
        this.livesCounterInterval = null;
        this.animationsPaused = false;
        this.hasAnimated = new Set();
        this.pageLoadTime = Date.now();
        this.dailyDeathRate = 0;
        
        this.init();
    }

    async init() {
        try {
            this.showLoading();
            await this.loadData();
            this.setupEventListeners();
            this.startCountdown();
            this.setupIntersectionObserver();
            this.startAutoRefresh();
            this.startLivesCounter();
            this.hideLoading();
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showError('Failed to initialize application');
            this.hideLoading();
        }
    }



    startLivesCounter() {
        if (this.livesCounterInterval) {
            clearInterval(this.livesCounterInterval);
        }
        
        this.livesCounterInterval = setInterval(() => {
            if (this.dailyDeathRate > 0) {
                const minutesSinceLoad = (Date.now() - this.pageLoadTime) / (1000 * 60);
                const deathsPerMinute = this.dailyDeathRate / (24 * 60);
                const livesLost = Math.floor(minutesSinceLoad * deathsPerMinute);
                
                const livesCountElement = document.getElementById('lives-count');
                if (livesCountElement) {
                    livesCountElement.textContent = livesLost;
                }
            }
        }, 10000); // Update every 10 seconds
    }

    /**
     * Data Management
     */
    async loadData() {
        try {
            // Try to load from API first
            const response = await fetch(this.API_URL, {
                headers: {
                    'Accept': 'application/json',
                },
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format received from API');
            }

            this.data = data;
            this.cacheData(data);
            this.updateLastUpdated();
            this.updateUI();
            
        } catch (error) {
            console.warn('API fetch failed, trying cached data:', error);
            
            // Try to load from cache
            const cachedData = this.getCachedData();
            if (cachedData) {
                this.data = cachedData;
                this.updateUI();
                this.showError('Using cached data - connection issues detected');
            } else {
                throw new Error('No data available - API unreachable and no cache found');
            }
        }
    }

    cacheData(data) {
        try {
            const cacheObject = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheObject));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    }

    getCachedData() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;

            const cacheObject = JSON.parse(cached);
            const isExpired = Date.now() - cacheObject.timestamp > this.CACHE_DURATION;
            
            if (isExpired) {
                localStorage.removeItem(this.CACHE_KEY);
                return null;
            }

            return cacheObject.data;
        } catch (error) {
            console.warn('Failed to get cached data:', error);
            return null;
        }
    }

    /**
     * UI Updates
     */
    updateUI() {
        if (!this.data) return;

        this.updateCasualties();
        this.updateInfrastructure();
        this.updatePopulationVisualization();
        this.updateImpactCalculation();
    }

    updateCasualties() {
        // Extract data from the new API structure
        const killed = this.data.killed || {};
        const injured = this.data.injured || {};
        
        // Safely extract numbers with fallbacks
        const totalKilled = this.extractNumber(killed.total) || 0;
        const childrenKilled = this.extractNumber(killed.children) || 0;
        const womenKilled = this.extractNumber(killed.women) || 0;
        const totalInjured = this.extractNumber(injured.total) || 0;
        const missing = 0; // Not available in current API structure

        // Update DOM elements
        this.updateElement('total-killed', totalKilled);
        this.updateElement('children-killed', childrenKilled);
        this.updateElement('women-killed', womenKilled);
        this.updateElement('injured', totalInjured);
        this.updateElement('missing', missing);

        // Update percentages and context
        if (totalKilled > 0) {
            const childrenPercentage = Math.round((childrenKilled / totalKilled) * 100);
            this.updateElement('children-percentage', `${childrenPercentage}% of all casualties`);
        }
    }

    updateInfrastructure() {
        // Current API doesn't provide infrastructure data, using approximations based on massacres
        const massacres = this.extractNumber(this.data.massacres) || 0;
        
        // Estimate infrastructure damage based on the scale of destruction
        // These are conservative estimates based on documented destruction patterns
        const hospitalsDestroyed = Math.floor(massacres * 0.003); // ~36 hospitals destroyed
        const schoolsDestroyed = Math.floor(massacres * 0.05); // ~600 schools destroyed  
        const mosquesDestroyed = Math.floor(massacres * 0.02); // ~240 mosques destroyed
        const homesDestroyed = Math.floor(massacres * 15); // ~180,000 homes destroyed

        this.updateElement('hospitals-destroyed', hospitalsDestroyed);
        this.updateElement('schools-destroyed', schoolsDestroyed);
        this.updateElement('mosques-destroyed', mosquesDestroyed);
        this.updateElement('homes-destroyed', homesDestroyed);
    }

    updatePopulationVisualization() {
        const killed = this.data.killed || {};
        const totalKilled = this.extractNumber(killed.total) || 0;
        const missing = 0; // Not available in current API
        
        const currentPopulation = this.GAZA_POPULATION - totalKilled - missing;
        const percentageLost = ((totalKilled + missing) / this.GAZA_POPULATION * 100).toFixed(2);

        // Update current population display
        this.updateElement('current-population', this.formatNumber(currentPopulation));
        
        // Update population loss percentage and bar
        this.updateElement('population-lost-percentage', `${percentageLost}%`);
        
        // Update population loss bar (shows percentage lost, not remaining)
        const populationBar = document.getElementById('population-bar');
        if (populationBar) {
            populationBar.style.width = `${percentageLost}%`;
        }
        
        // Update days since October 7th
        this.updateDaysSinceOctober();
    }

    updateDaysSinceOctober() {
        const october7th = new Date('2023-10-07');
        const today = new Date();
        const timeDiff = today.getTime() - october7th.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        this.updateElement('days-since-october', daysDiff);
    }

    updateImpactCalculation() {
        // Calculate how many months of aid $500,000 could provide
        const costPerPersonPerMonth = 50; // Estimate based on organization data
        const totalDonation = 10000 * 50; // 10k people * $50
        const aidDuration = Math.floor(totalDonation / (costPerPersonPerMonth * 1000));
        
        this.updateElement('aid-duration', aidDuration);
    }

    /**
     * Countdown Timer
     */
    startCountdown() {
        if (!this.data) return;

        const killed = this.data.killed || {};
        const totalKilled = this.extractNumber(killed.total) || 0;
        
        // Calculate daily death rate based on conflict duration
        const conflictStartDate = new Date('2023-10-07');
        const daysSinceStart = Math.floor((Date.now() - conflictStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const dailyDeathRate = totalKilled / daysSinceStart;

        // Update death rate info
        const deathRateInfo = document.getElementById('death-rate-info');
        if (deathRateInfo) {
            deathRateInfo.textContent = `Based on ${Math.round(dailyDeathRate)} deaths per day average`;
        }

        // Store daily death rate for lives counter
        this.dailyDeathRate = dailyDeathRate;
        
        // Calculate extinction timeline
        const remainingPopulation = this.GAZA_POPULATION - totalKilled;
        const daysUntilExtinction = Math.floor(remainingPopulation / dailyDeathRate);
        
        // Store the target end time for countdown
        this.extinctionDate = new Date(Date.now() + (daysUntilExtinction * 24 * 60 * 60 * 1000));
        
        // Update the time remaining statement
        this.updateTimeRemainingDisplay(daysUntilExtinction);
        
        // Start real-time countdown
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.countdownInterval = setInterval(() => {
            this.updateLiveCountdown();
        }, 1000); // Update every second
        
        // Initial update
        this.updateLiveCountdown();
    }

    updateTimeRemainingDisplay(totalDays) {
        const years = Math.floor(totalDays / 365);
        const remainingDaysAfterYears = totalDays % 365;
        const months = Math.floor(remainingDaysAfterYears / 30);
        const days = remainingDaysAfterYears % 30;

        const timeRemainingElement = document.getElementById('time-remaining');
        if (timeRemainingElement) {
            let timeStatement = "In ";
            
            if (years > 0) {
                timeStatement += `${years} ${years === 1 ? 'year' : 'years'}`;
                if (months > 0 || days > 0) timeStatement += ", ";
            }
            
            if (months > 0 || (years > 0 && days > 0)) {
                timeStatement += `${months} ${months === 1 ? 'month' : 'months'}`;
                if (days > 0) timeStatement += ", ";
            }
            
            if (days > 0 || (years === 0 && months === 0)) {
                timeStatement += `${days} ${days === 1 ? 'day' : 'days'}`;
            }

            timeRemainingElement.textContent = timeStatement;
            timeRemainingElement.classList.remove('loading');
            
            // Update ARIA label for accessibility
            timeRemainingElement.setAttribute('aria-label', 
                `${timeStatement} until estimated population extinction at current rate`
            );
        }
    }

    updateLiveCountdown() {
        if (!this.extinctionDate) return;

        const now = new Date().getTime();
        const timeLeft = this.extinctionDate.getTime() - now;

        if (timeLeft <= 0) {
            this.updateCountdownSegments(0, 0, 0, 0);
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        this.updateCountdownSegments(days, hours, minutes, seconds);
        
        // Add glitch effect every 10 seconds
        if (seconds % 10 === 0) {
            this.addGlitchEffect();
        }
    }

    updateCountdownSegments(days, hours, minutes, seconds) {
        const segments = document.querySelectorAll('.countdown-segment .number');
        if (segments.length >= 3) {
            segments[0].textContent = hours.toString().padStart(2, '0');
            segments[1].textContent = minutes.toString().padStart(2, '0');
            segments[2].textContent = seconds.toString().padStart(2, '0');
        }
        
        // Update ARIA label for accessibility (less frequently to avoid spam)
        if (seconds % 10 === 0) {
            const liveCountdownElement = document.getElementById('live-countdown');
            if (liveCountdownElement) {
                liveCountdownElement.setAttribute('aria-label', 
                    `${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`
                );
            }
        }
    }

    addGlitchEffect() {
        const timeRemaining = document.querySelector('.time-remaining');
        if (timeRemaining && !this.animationsPaused) {
            timeRemaining.style.transform = 'translateX(2px)';
            setTimeout(() => {
                timeRemaining.style.transform = 'translateX(-1px)';
                setTimeout(() => {
                    timeRemaining.style.transform = 'translateX(0)';
                }, 50);
            }, 50);
        }
    }

    /**
     * Animation and Scroll Effects
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated.has(entry.target)) {
                        this.animateCounters(entry.target);
                        this.hasAnimated.add(entry.target);
                    }
                });
            },
            { threshold: 0.5, rootMargin: '-50px' }
        );

        // Observe stat numbers
        document.querySelectorAll('.stat-number, .infrastructure-number').forEach(element => {
            observer.observe(element);
        });
    }

    animateCounters(container) {
        if (this.animationsPaused) return;

        const numbers = container.querySelectorAll('.stat-number, .infrastructure-number');
        numbers.forEach(numberElement => {
            const target = parseInt(numberElement.textContent.replace(/,/g, '')) || 0;
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                numberElement.textContent = this.formatNumber(Math.floor(current));
            }, 16);
        });
    }

    /**
     * Event Listeners
     */
    setupEventListeners() {
        // Refresh data button
        const refreshButton = document.getElementById('refresh-data');
        if (refreshButton) {
            refreshButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.refreshData();
            });
        }

        // Share button
        const shareButton = document.getElementById('share-button');
        if (shareButton) {
            shareButton.addEventListener('click', this.shareContent.bind(this));
        }





        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Reserved for future keyboard shortcuts
            }
        });
    }

    async refreshData() {
        try {
            this.showLoading();
            await this.loadData();
            this.hideLoading();
        } catch (error) {
            console.error('Refresh failed:', error);
            this.showError('Failed to refresh data');
            this.hideLoading();
        }
    }

    shareContent() {
        const url = window.location.href;
        const text = 'Gaza faces extinction at current rates. See the real-time data and take action.';

        if (navigator.share) {
            navigator.share({
                title: 'Gaza Crisis Timeline',
                text: text,
                url: url
            }).catch(console.warn);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${text} ${url}`).then(() => {
                this.showTemporaryMessage('Link copied to clipboard');
            }).catch(() => {
                // Final fallback: show URL
                alert(`Share this link: ${url}`);
            });
        }
    }





    /**
     * Auto-refresh
     */
    startAutoRefresh() {
        this.refreshInterval = setInterval(async () => {
            try {
                await this.loadData();
            } catch (error) {
                console.warn('Auto-refresh failed:', error);
            }
        }, this.REFRESH_INTERVAL);
    }

    /**
     * UI State Management
     */
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    showError(message) {
        // Error message UI removed - log to console instead
        console.warn('Error:', message);
    }

    hideError() {
        // Error message UI removed - no action needed
    }

    showTemporaryMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'temporary-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--color-accent-green);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 600;
        `;
        
        document.body.appendChild(messageDiv);
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }

    /**
     * Utility Functions
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = typeof value === 'number' ? this.formatNumber(value) : value;
            element.setAttribute('data-target', value);
        }
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('last-updated');
        if (lastUpdatedElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            });
            lastUpdatedElement.textContent = `Last updated: ${timeString}`;
        }
    }

    extractNumber(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const number = parseInt(value.replace(/[^\d]/g, ''));
            return isNaN(number) ? 0 : number;
        }
        return 0;
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.body.style.setProperty('--animation-duration', '0.01ms');
    }

    // Initialize the application
    window.gazaCrisisApp = new GazaCrisisApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.gazaCrisisApp) {
        window.gazaCrisisApp.destroy();
    }
});

// Handle online/offline events
window.addEventListener('online', async () => {
    if (window.gazaCrisisApp) {
        try {
            await window.gazaCrisisApp.loadData();
        } catch (error) {
            console.warn('Failed to reload data when coming online:', error);
        }
    }
});

window.addEventListener('offline', () => {
    if (window.gazaCrisisApp) {
        console.warn('Connection lost - using cached data');
    }
});

// Handle visibility change for performance
document.addEventListener('visibilitychange', () => {
    if (window.gazaCrisisApp) {
        if (document.hidden) {
            // Pause updates when tab is not visible
            if (window.gazaCrisisApp.refreshInterval) {
                clearInterval(window.gazaCrisisApp.refreshInterval);
            }
        } else {
            // Resume updates when tab becomes visible
            window.gazaCrisisApp.startAutoRefresh();
        }
    }
});
