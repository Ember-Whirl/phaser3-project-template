/**
 * Portal Manager - Unified API for game portals
 *
 * This manager provides a single, consistent API for interacting with
 * different game portals (Poki, CrazyGames, etc.). It automatically
 * detects the platform and routes calls to the appropriate SDK.
 *
 * Usage:
 *   import PortalManager from './scripts/adapters/portals/portalManager';
 *
 *   // In your Boot scene
 *   await PortalManager.init();
 *
 *   // When gameplay starts
 *   PortalManager.gameplayStart();
 *
 *   // When gameplay stops
 *   PortalManager.gameplayStop();
 *
 *   // Show an ad
 *   await PortalManager.showAd();
 *
 *   // Show a rewarded ad
 *   const granted = await PortalManager.showRewardedAd();
 *   if (granted) {
 *       // Give player reward
 *   }
 */

import PokiSDK from '../poki/pokiSDK.js';
import CrazySDK from '../crazygames/crazySDK.js';

class PortalManager {
    constructor() {
        this.platform = 'none';
        this.activeSDK = null;
        this.initialized = false;
    }

    /**
     * Detect the current platform
     * @returns {string} Platform name: 'poki', 'crazygames', or 'web'
     */
    detectPlatform() {
        // Check for Poki
        if (typeof window.PokiSDK !== 'undefined') {
            return 'poki';
        }

        // Check for CrazyGames
        if (typeof window.CrazyGames !== 'undefined') {
            return 'crazygames';
        }

        // Check URL for hints
        const hostname = window.location.hostname;
        if (hostname.includes('poki.com') || hostname.includes('poki.nl')) {
            return 'poki';
        }
        if (hostname.includes('crazygames.com')) {
            return 'crazygames';
        }

        // Default to web/standalone
        return 'web';
    }

    /**
     * Initialize the portal manager and appropriate SDK
     * @returns {Promise<boolean>} True if SDK initialized successfully
     */
    async init() {
        if (this.initialized) {
            console.warn('[PortalManager] Already initialized');
            return true;
        }

        this.platform = this.detectPlatform();
        console.log('[PortalManager] Detected platform:', this.platform);

        let success = false;

        switch (this.platform) {
            case 'poki':
                this.activeSDK = PokiSDK;
                success = await PokiSDK.init();
                break;

            case 'crazygames':
                this.activeSDK = CrazySDK;
                success = await CrazySDK.init();
                break;

            case 'web':
                console.log('[PortalManager] Running in standalone web mode');
                success = true;
                break;

            default:
                console.warn('[PortalManager] Unknown platform');
                success = false;
        }

        this.initialized = success;
        return success;
    }

    /**
     * Notify the portal that gameplay has started
     */
    gameplayStart() {
        if (!this.activeSDK) return;
        this.activeSDK.gameplayStart();
    }

    /**
     * Notify the portal that gameplay has stopped
     */
    gameplayStop() {
        if (!this.activeSDK) return;
        this.activeSDK.gameplayStop();
    }

    /**
     * Show a commercial/midgame ad
     * @returns {Promise<void>}
     */
    async showAd() {
        if (!this.activeSDK) {
            console.log('[PortalManager] No SDK available - skipping ad');
            return Promise.resolve();
        }

        switch (this.platform) {
            case 'poki':
                return await PokiSDK.showCommercialBreak();
            case 'crazygames':
                return await CrazySDK.showMidgameAd();
            default:
                return Promise.resolve();
        }
    }

    /**
     * Show a rewarded ad
     * @returns {Promise<boolean>} True if reward should be granted
     */
    async showRewardedAd() {
        if (!this.activeSDK) {
            console.log('[PortalManager] No SDK available - granting reward (dev mode)');
            return Promise.resolve(true);
        }

        return await this.activeSDK.showRewardedAd();
    }

    /**
     * Track a custom event (analytics)
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {string} label - Event label (optional)
     * @param {number} value - Event value (optional)
     */
    trackEvent(category, action, label = '', value = 0) {
        if (!this.activeSDK) return;

        if (this.platform === 'crazygames') {
            this.activeSDK.trackEvent(category, { action, label, value });
        } else {
            this.activeSDK.trackEvent(category, action, label, value);
        }
    }

    /**
     * Get the current platform name
     * @returns {string} 'poki', 'crazygames', or 'web'
     */
    getPlatform() {
        return this.platform;
    }

    /**
     * Check if running on a portal (not standalone web)
     * @returns {boolean}
     */
    isPortal() {
        return this.platform !== 'web';
    }

    /**
     * Check if SDK is available and initialized
     * @returns {boolean}
     */
    isAvailable() {
        return this.initialized && this.activeSDK !== null;
    }

    /**
     * Check if gameplay is currently active
     * @returns {boolean}
     */
    isGameplayActive() {
        if (!this.activeSDK) return false;
        return this.activeSDK.isGameplayActive();
    }

    /**
     * Platform-specific: Happy time (Poki only)
     * Notifies Poki of exciting gameplay moments
     */
    happyTime() {
        if (this.platform === 'poki' && this.activeSDK) {
            this.activeSDK.happyTime();
        }
    }

    /**
     * Platform-specific: Get user info (CrazyGames only)
     * @returns {object|null}
     */
    getUser() {
        if (this.platform === 'crazygames' && this.activeSDK) {
            return this.activeSDK.getUser();
        }
        return null;
    }

    /**
     * Platform-specific: Check if user is logged in (CrazyGames only)
     * @returns {boolean}
     */
    isUserLoggedIn() {
        if (this.platform === 'crazygames' && this.activeSDK) {
            return this.activeSDK.isUserLoggedIn();
        }
        return false;
    }

    /**
     * Platform-specific: Show banner ad (CrazyGames only)
     * @param {string} containerId - DOM element ID
     * @param {string} size - Banner size
     */
    showBanner(containerId, size = '728x90') {
        if (this.platform === 'crazygames' && this.activeSDK) {
            this.activeSDK.showBannerAd(containerId, size);
        }
    }

    /**
     * Platform-specific: Clear banner ads (CrazyGames only)
     */
    clearBanners() {
        if (this.platform === 'crazygames' && this.activeSDK) {
            this.activeSDK.clearBannerAds();
        }
    }

    /**
     * Platform-specific: Game loading complete (CrazyGames only)
     * Call this when game is ready to remove loading screen
     */
    gameLoadingStop() {
        if (this.platform === 'crazygames' && this.activeSDK) {
            this.activeSDK.gameLoadingStop();
        }
    }

    /**
     * Get a summary of portal capabilities
     * @returns {object} Capabilities object
     */
    getCapabilities() {
        return {
            platform: this.platform,
            ads: this.isPortal(),
            rewardedAds: this.isPortal(),
            bannerAds: this.platform === 'crazygames',
            userAccounts: this.platform === 'crazygames',
            analytics: this.isPortal(),
            invites: this.platform === 'crazygames'
        };
    }
}

// Export singleton instance
export default new PortalManager();
