/**
 * Gaza Crisis Timeline - Main JavaScript
 * Performance-optimized vanilla JS for real-time data visualization
 */

class GazaCrisisApp {
    constructor() {
        this.API_URL = 'https://data.techforpalestine.org/api/v3/summary_latest.json';
        this.CACHE_KEY = 'gaza_crisis_data';
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        this.REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
        this.GAZA_POPULATION = 2300000;
        
        this.data = null;
        this.countdownInterval = null;
        this.refreshInterval = null;
        this.animationsPaused = false;
        this.hasAnimated = new Set();
        
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
            this.hideLoading();
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showError('Failed to initialize application');
            this.hideLoading();
        }
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
        const casualties = this.data.gaza || {};
        
        // Safely extract numbers with fallbacks
        const totalKilled = this.extractNumber(casualties.killed) || 0;
        const childrenKilled = this.extractNumber(casualties.killed_children) || 0;
        const womenKilled = this.extractNumber(casualties.killed_women) || 0;
        const injured = this.extractNumber(casualties.injured) || 0;
        const missing = this.extractNumber(casualties.missing) || 0;

        // Update DOM elements
        this.updateElement('total-killed', totalKilled);
        this.updateElement('children-killed', childrenKilled);
        this.updateElement('women-killed', womenKilled);
        this.updateElement('injured', injured);
        this.updateElement('missing', missing);

        // Update percentages and context
        if (totalKilled > 0) {
            const childrenPercentage = Math.round((childrenKilled / totalKilled) * 100);
            this.updateElement('children-percentage', `${childrenPercentage}% of all casualties`);
        }
    }

    updateInfrastructure() {
        const infrastructure = this.data.gaza || {};
        
        // Extract infrastructure damage data
        const hospitalsDestroyed = this.extractNumber(infrastructure.hospitals_destroyed) || 0;
        const schoolsDestroyed = this.extractNumber(infrastructure.schools_destroyed) || 0;
        const mosquesDestroyed = this.extractNumber(infrastructure.mosques_destroyed) || 0;
        const homesDestroyed = this.extractNumber(infrastructure.homes_destroyed) || 0;

        this.updateElement('hospitals-destroyed', hospitalsDestroyed);
        this.updateElement('schools-destroyed', schoolsDestroyed);
        this.updateElement('mosques-destroyed', mosquesDestroyed);
        this.updateElement('homes-destroyed', homesDestroyed);
    }

    updatePopulationVisualization() {
        const casualties = this.data.gaza || {};
        const totalKilled = this.extractNumber(casualties.killed) || 0;
        const missing = this.extractNumber(casualties.missing) || 0;
        
        const currentPopulation = this.GAZA_POPULATION - totalKilled - missing;
        const percentageLost = ((totalKilled + missing) / this.GAZA_POPULATION * 100).toFixed(2);
        const percentageRemaining = (currentPopulation / this.GAZA_POPULATION * 100);

        this.updateElement('current-population', this.formatNumber(currentPopulation));
        this.updateElement('percentage-lost', `${percentageLost}%`);

        // Update population bar
        const populationBar = document.getElementById('population-bar');
        if (populationBar) {
            populationBar.style.width = `${percentageRemaining}%`;
        }
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

        const casualties = this.data.gaza || {};
        const totalKilled = this.extractNumber(casualties.killed) || 0;
        
        // Calculate daily death rate (simplified - would need historical data for accuracy)
        // Using a conservative estimate based on conflict duration
        const conflictStartDate = new Date('2023-10-07');
        const daysSinceStart = Math.floor((Date.now() - conflictStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const dailyDeathRate = totalKilled / daysSinceStart;

        // Update death rate info
        const deathRateInfo = document.getElementById('death-rate-info');
        if (deathRateInfo) {
            deathRateInfo.textContent = `Based on ${Math.round(dailyDeathRate)} deaths per day average`;
        }

        // Calculate extinction timeline
        const remainingPopulation = this.GAZA_POPULATION - totalKilled;
        const daysUntilExtinction = Math.floor(remainingPopulation / dailyDeathRate);

        this.updateCountdownDisplay(daysUntilExtinction);
        
        // Update countdown every minute
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.countdownInterval = setInterval(() => {
            this.updateCountdownDisplay(daysUntilExtinction);
        }, 60000); // Update every minute
    }

    updateCountdownDisplay(totalDays) {
        const years = Math.floor(totalDays / 365);
        const remainingDaysAfterYears = totalDays % 365;
        const months = Math.floor(remainingDaysAfterYears / 30);
        const days = remainingDaysAfterYears % 30;
        const hours = Math.floor((Date.now() % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((Date.now() % (1000 * 60 * 60)) / (1000 * 60));

        const countdownTimer = document.getElementById('countdown-timer');
        if (countdownTimer) {
            const formattedTime = `${years.toString().padStart(2, '0')}:${months.toString().padStart(2, '0')}:${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            countdownTimer.textContent = formattedTime;
            countdownTimer.classList.remove('loading');
            
            // Update ARIA label for accessibility
            countdownTimer.setAttribute('aria-label', 
                `${years} years, ${months} months, ${days} days, ${hours} hours, ${minutes} minutes until estimated population extinction at current rate`
            );
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

        // Pause animations button
        const pauseButton = document.getElementById('pause-animations');
        if (pauseButton) {
            pauseButton.addEventListener('click', this.toggleAnimations.bind(this));
        }

        // Retry button
        const retryButton = document.getElementById('retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', async () => {
                this.hideError();
                await this.loadData();
            });
        }

        // Error message auto-hide
        setTimeout(() => {
            this.hideError();
        }, 10000);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideError();
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

    toggleAnimations() {
        this.animationsPaused = !this.animationsPaused;
        const pauseButton = document.getElementById('pause-animations');
        const countdownTimer = document.querySelector('.countdown-timer');
        
        if (this.animationsPaused) {
            pauseButton.textContent = '▶ Resume Animations';
            document.body.style.setProperty('--animation-play-state', 'paused');
            if (countdownTimer) countdownTimer.classList.add('paused');
        } else {
            pauseButton.textContent = '⏸ Pause Animations';
            document.body.style.setProperty('--animation-play-state', 'running');
            if (countdownTimer) countdownTimer.classList.remove('paused');
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
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.querySelector('p').textContent = message;
            errorElement.classList.add('show');
        }
    }

    hideError() {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
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
        window.gazaCrisisApp.showError('Connection lost - using cached data');
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
