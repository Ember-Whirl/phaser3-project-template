/**
 * Poki SDK Adapter
 * Official documentation: https://sdk.poki.com/
 *
 * This adapter provides a unified interface for Poki platform features:
 * - Gameplay events (start/stop)
 * - Commercial breaks (ads)
 * - Rewarded ads
 * - Analytics
 */

class PokiSDK {
    constructor() {
        this.sdkLoaded = false;
        this.gameplayStarted = false;
        this.SDK = null;
    }

    /**
     * Initialize the Poki SDK
     * Should be called during game boot
     */
    async init() {
        if (typeof PokiSDK !== 'undefined' && window.PokiSDK) {
            this.SDK = window.PokiSDK;
            this.sdkLoaded = true;

            try {
                await this.SDK.init();
                console.log('[Poki] SDK initialized successfully');
                return true;
            } catch (error) {
                console.error('[Poki] SDK initialization failed:', error);
                return false;
            }
        } else {
            console.warn('[Poki] SDK not found - running in standalone mode');
            return false;
        }
    }

    /**
     * Call when gameplay starts
     * Stops ads from showing and starts tracking metrics
     */
    gameplayStart() {
        if (!this.sdkLoaded) return;

        if (!this.gameplayStarted) {
            this.SDK.gameplayStart();
            this.gameplayStarted = true;
            console.log('[Poki] Gameplay started');
        }
    }

    /**
     * Call when gameplay stops (menu, game over, etc.)
     * Allows ads to be shown again
     */
    gameplayStop() {
        if (!this.sdkLoaded) return;

        if (this.gameplayStarted) {
            this.SDK.gameplayStop();
            this.gameplayStarted = false;
            console.log('[Poki] Gameplay stopped');
        }
    }

    /**
     * Show a commercial break (ad)
     * @returns {Promise} Resolves when ad is complete
     */
    async showCommercialBreak() {
        if (!this.sdkLoaded) {
            console.log('[Poki] Commercial break skipped (SDK not loaded)');
            return Promise.resolve();
        }

        // Automatically stop gameplay before ad
        const wasPlaying = this.gameplayStarted;
        if (wasPlaying) {
            this.gameplayStop();
        }

        try {
            await this.SDK.commercialBreak();
            console.log('[Poki] Commercial break completed');

            // Resume gameplay if it was active
            if (wasPlaying) {
                this.gameplayStart();
            }
        } catch (error) {
            console.error('[Poki] Commercial break failed:', error);
            if (wasPlaying) {
                this.gameplayStart();
            }
        }
    }

    /**
     * Show a rewarded ad
     * @returns {Promise<boolean>} True if reward should be granted
     */
    async showRewardedAd() {
        if (!this.sdkLoaded) {
            console.log('[Poki] Rewarded ad skipped (SDK not loaded)');
            // In development, always grant reward
            return Promise.resolve(true);
        }

        // Automatically stop gameplay before ad
        const wasPlaying = this.gameplayStarted;
        if (wasPlaying) {
            this.gameplayStop();
        }

        try {
            const result = await this.SDK.rewardedBreak();
            console.log('[Poki] Rewarded ad result:', result);

            // Resume gameplay
            if (wasPlaying) {
                this.gameplayStart();
            }

            return result === true;
        } catch (error) {
            console.error('[Poki] Rewarded ad failed:', error);

            if (wasPlaying) {
                this.gameplayStart();
            }

            return false;
        }
    }

    /**
     * Track a custom event
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {string} label - Event label
     * @param {number} value - Event value
     */
    trackEvent(category, action, label, value) {
        if (!this.sdkLoaded) return;

        // Poki uses custom event tracking
        console.log('[Poki] Track event:', { category, action, label, value });

        // Poki automatically tracks gameplay events
        // Custom events can be added through their dashboard
    }

    /**
     * Check if SDK is available and loaded
     * @returns {boolean}
     */
    isAvailable() {
        return this.sdkLoaded;
    }

    /**
     * Get the current gameplay state
     * @returns {boolean}
     */
    isGameplayActive() {
        return this.gameplayStarted;
    }

    /**
     * Trigger happy time - notify Poki of exciting gameplay moment
     * This helps Poki optimize ad timing
     */
    happyTime() {
        if (!this.sdkLoaded) return;

        if (this.SDK.happyTime) {
            this.SDK.happyTime();
            console.log('[Poki] Happy time triggered');
        }
    }
}

// Export singleton instance
export default new PokiSDK();
