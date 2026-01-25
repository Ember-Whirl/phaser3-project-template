/**
 * CrazyGames SDK Adapter
 * Official documentation: https://docs.crazygames.com/sdk/
 *
 * This adapter provides a unified interface for CrazyGames platform features:
 * - Gameplay events (start/stop)
 * - Midgame ads
 * - Rewarded ads
 * - User account features
 * - In-game purchases
 */

class CrazySDK {
    constructor() {
        this.sdkLoaded = false;
        this.gameplayStarted = false;
        this.SDK = null;
        this.user = null;
    }

    /**
     * Initialize the CrazyGames SDK
     * Should be called during game boot
     */
    async init() {
        if (typeof window.CrazyGames !== 'undefined') {
            this.SDK = window.CrazyGames.SDK;
            this.sdkLoaded = true;

            try {
                await this.SDK.init();
                console.log('[CrazyGames] SDK initialized successfully');

                // Get user info if available
                this.user = await this.SDK.user.getUser();
                if (this.user) {
                    console.log('[CrazyGames] User logged in:', this.user.username);
                }

                return true;
            } catch (error) {
                console.error('[CrazyGames] SDK initialization failed:', error);
                return false;
            }
        } else {
            console.warn('[CrazyGames] SDK not found - running in standalone mode');
            return false;
        }
    }

    /**
     * Call when gameplay starts
     * Notifies CrazyGames that gameplay has begun
     */
    gameplayStart() {
        if (!this.sdkLoaded) return;

        if (!this.gameplayStarted) {
            this.SDK.game.gameplayStart();
            this.gameplayStarted = true;
            console.log('[CrazyGames] Gameplay started');
        }
    }

    /**
     * Call when gameplay stops (menu, game over, etc.)
     * Notifies CrazyGames that gameplay has stopped
     */
    gameplayStop() {
        if (!this.sdkLoaded) return;

        if (this.gameplayStarted) {
            this.SDK.game.gameplayStop();
            this.gameplayStarted = false;
            console.log('[CrazyGames] Gameplay stopped');
        }
    }

    /**
     * Show a midgame ad (similar to commercial break)
     * @returns {Promise} Resolves when ad is complete
     */
    async showMidgameAd() {
        if (!this.sdkLoaded) {
            console.log('[CrazyGames] Midgame ad skipped (SDK not loaded)');
            return Promise.resolve();
        }

        try {
            await this.SDK.ad.requestAd('midgame');
            console.log('[CrazyGames] Midgame ad completed');
        } catch (error) {
            console.error('[CrazyGames] Midgame ad failed:', error);
        }
    }

    /**
     * Show a rewarded ad
     * @returns {Promise<boolean>} True if reward should be granted
     */
    async showRewardedAd() {
        if (!this.sdkLoaded) {
            console.log('[CrazyGames] Rewarded ad skipped (SDK not loaded)');
            // In development, always grant reward
            return Promise.resolve(true);
        }

        try {
            await this.SDK.ad.requestAd('rewarded');
            console.log('[CrazyGames] Rewarded ad completed - granting reward');
            return true;
        } catch (error) {
            console.error('[CrazyGames] Rewarded ad failed or was dismissed:', error);
            return false;
        }
    }

    /**
     * Display a banner ad
     * @param {string} containerId - DOM element ID for banner container
     * @param {string} size - Banner size: '728x90', '300x250', '320x50', '468x60', '970x90', '160x600'
     */
    showBannerAd(containerId, size = '728x90') {
        if (!this.sdkLoaded) return;

        try {
            this.SDK.banner.requestBanner({
                id: containerId,
                size: size
            });
            console.log('[CrazyGames] Banner ad requested:', size);
        } catch (error) {
            console.error('[CrazyGames] Banner ad failed:', error);
        }
    }

    /**
     * Clear/hide banner ads
     */
    clearBannerAds() {
        if (!this.sdkLoaded) return;

        try {
            this.SDK.banner.clearAllBanners();
            console.log('[CrazyGames] Banner ads cleared');
        } catch (error) {
            console.error('[CrazyGames] Clear banners failed:', error);
        }
    }

    /**
     * Track a custom event
     * @param {string} eventName - Event name
     * @param {object} eventData - Event data
     */
    trackEvent(eventName, eventData = {}) {
        if (!this.sdkLoaded) return;

        try {
            this.SDK.game.sdkGameLoadingStart();
            console.log('[CrazyGames] Track event:', eventName, eventData);
        } catch (error) {
            console.error('[CrazyGames] Track event failed:', error);
        }
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
     * Get user information
     * @returns {object|null} User object or null if not logged in
     */
    getUser() {
        return this.user;
    }

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isUserLoggedIn() {
        return this.user !== null;
    }

    /**
     * Show user account dialog
     */
    async showUserAccountDialog() {
        if (!this.sdkLoaded) return;

        try {
            await this.SDK.user.showAccountLinkPrompt();
            // Refresh user info after dialog
            this.user = await this.SDK.user.getUser();
            console.log('[CrazyGames] User account dialog shown');
        } catch (error) {
            console.error('[CrazyGames] Show account dialog failed:', error);
        }
    }

    /**
     * Invite a friend to play
     */
    async inviteLink() {
        if (!this.sdkLoaded) return null;

        try {
            const link = await this.SDK.game.inviteLink({
                roomId: 'game-room-' + Date.now()
            });
            console.log('[CrazyGames] Invite link generated:', link);
            return link;
        } catch (error) {
            console.error('[CrazyGames] Invite link failed:', error);
            return null;
        }
    }

    /**
     * Call when game is ready to be played
     * This removes the loading screen
     */
    gameLoadingStop() {
        if (!this.sdkLoaded) return;

        try {
            this.SDK.game.sdkGameLoadingStop();
            console.log('[CrazyGames] Game loading stopped');
        } catch (error) {
            console.error('[CrazyGames] Game loading stop failed:', error);
        }
    }

    /**
     * Show an invite button
     * @param {string} roomId - Room identifier
     */
    showInviteButton(roomId) {
        if (!this.sdkLoaded) return;

        try {
            this.SDK.game.showInviteButton({ roomId });
            console.log('[CrazyGames] Invite button shown');
        } catch (error) {
            console.error('[CrazyGames] Show invite button failed:', error);
        }
    }

    /**
     * Hide the invite button
     */
    hideInviteButton() {
        if (!this.sdkLoaded) return;

        try {
            this.SDK.game.hideInviteButton();
            console.log('[CrazyGames] Invite button hidden');
        } catch (error) {
            console.error('[CrazyGames] Hide invite button failed:', error);
        }
    }
}

// Export singleton instance
export default new CrazySDK();
