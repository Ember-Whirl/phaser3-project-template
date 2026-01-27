import { tweenPresets } from '../../animations/presets/tweenPresets.js';
import ResponsiveManager from '../../managers/ResponsiveManager.js';

/**
 * UIContainer Component
 * Layout container that organizes UI children with automatic scaling and alignment.
 * Children scale uniformly to fit within the container, preventing overlap.
 *
 * Usage:
 *   import UIContainer from './ui/components/UIContainer';
 *
 *   const container = new UIContainer(scene, x, y, {
 *       width: 600,
 *       height: 80,
 *       layout: 'horizontal',
 *       spacing: 20
 *   });
 *
 *   container.addChild(button1, { anchor: 'start' });
 *   container.addChild(button2, { anchor: 'center' });
 *   container.addChild(button3, { anchor: 'end' });
 */

export default class UIContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);

        // Default configuration
        this.config = {
            // Dimensions
            width: config.width || 400,
            height: config.height || 300,
            // Layout mode
            layout: config.layout || 'horizontal', // 'horizontal' | 'vertical'
            // Spacing between children
            spacing: config.spacing ?? 10,
            flexibleSpacing: config.flexibleSpacing || false, // true = evenly distribute
            // Child alignment (perpendicular to layout direction)
            childAlign: config.childAlign || 'center', // 'start' | 'center' | 'end'
            // Default anchor for children along layout direction
            defaultAnchor: config.defaultAnchor || 'start', // 'start' | 'center' | 'end'
            // Scaling behavior
            scaleMode: config.scaleMode || 'shrink', // 'shrink' | 'fit' | 'none'
            minScaleFactor: config.minScaleFactor ?? 0.5,
            maxScaleFactor: config.maxScaleFactor ?? 1.0,
            // Padding inside container
            padding: this._normalizePadding(config.padding),
            // Optional background (NineSlice)
            showBackground: config.showBackground || false,
            texture: config.texture || 'kenney-ui',
            frame: config.frame || 'input_rectangle.png',
            sliceLeft: config.sliceLeft || 12,
            sliceRight: config.sliceRight || 12,
            sliceTop: config.sliceTop || 12,
            sliceBottom: config.sliceBottom || 12,
            tint: config.tint || 0xffffff,
            // Responsive options
            alignment: config.alignment || null,
            margin: config.margin || { x: 20, y: 20 },
            autoReposition: config.autoReposition !== false,
            responsiveScale: config.responsiveScale || false,
            // Screen-fit scaling (scales entire container to fit screen)
            fitScreen: config.fitScreen || false,
            fitScreenAxis: config.fitScreenAxis || 'both', // 'width' | 'height' | 'both'
            fitScreenMargin: this._normalizeMargin(config.fitScreenMargin),
            minContainerScale: config.minContainerScale ?? 0.5,
            // Minimum spacing before scaling kicks in
            minSpacing: config.minSpacing ?? 0
        };

        // Child tracking: { element, anchor, originalWidth, originalHeight, originalScaleX, originalScaleY }
        this.children = [];
        this.currentScaleFactor = 1;
        this.containerScaleFactor = 1; // Scale applied to entire container for screen-fit

        // Effective dimensions when fitScreen shrinks the container (before scaling)
        this.effectiveWidth = this.config.width;
        this.effectiveHeight = this.config.height;

        // Content bounds
        this.contentBounds = null;

        // Background (optional)
        this.background = null;

        // Create background if enabled
        if (this.config.showBackground) {
            this._createBackground();
        }

        // Calculate content bounds
        this._updateContentBounds();

        // Set container size for interaction
        this.setSize(this.config.width, this.config.height);

        // Add to scene
        scene.add.existing(this);

        // Auto-position if alignment provided
        if (this.config.alignment) {
            this.reposition();

            if (this.config.autoReposition) {
                ResponsiveManager.trackElement(this, this.config.alignment, this.config.margin, {
                    autoOrigin: false // Container origin is always 0.5, 0.5
                });
            }
        }

        // Setup screen-fit scaling if enabled
        if (this.config.fitScreen) {
            this._applyScreenFitScale();
            this._resizeHandler = this._onScreenResize.bind(this);
            this.scene.scale.on('resize', this._resizeHandler);
        }
    }

    /**
     * Normalize padding to object format
     * @private
     */
    _normalizePadding(padding) {
        if (padding === undefined || padding === null) {
            return { top: 0, right: 0, bottom: 0, left: 0 };
        }
        if (typeof padding === 'number') {
            return { top: padding, right: padding, bottom: padding, left: padding };
        }
        return {
            top: padding.top ?? 0,
            right: padding.right ?? 0,
            bottom: padding.bottom ?? 0,
            left: padding.left ?? 0
        };
    }

    /**
     * Normalize margin to object format
     * @private
     */
    _normalizeMargin(margin) {
        if (margin === undefined || margin === null) {
            return { x: 0, y: 0 };
        }
        if (typeof margin === 'number') {
            return { x: margin, y: margin };
        }
        return {
            x: margin.x ?? 0,
            y: margin.y ?? 0
        };
    }

    /**
     * Create NineSlice background
     * @private
     */
    _createBackground() {
        this.background = this.scene.add.nineslice(
            0, 0,
            this.config.texture,
            this.config.frame,
            this.config.width,
            this.config.height,
            this.config.sliceLeft,
            this.config.sliceRight,
            this.config.sliceTop,
            this.config.sliceBottom
        );
        this.background.setOrigin(0.5);

        if (this.config.tint !== 0xffffff) {
            this.background.setTint(this.config.tint);
        }

        this.add(this.background);
        this.sendToBack(this.background);
    }

    /**
     * Update content bounds based on padding
     * @param {number} width - Optional width override (for fitScreen effective size)
     * @param {number} height - Optional height override (for fitScreen effective size)
     * @private
     */
    _updateContentBounds(width, height) {
        const w = width ?? this.config.width;
        const h = height ?? this.config.height;
        const p = this.config.padding;
        this.contentBounds = {
            top: -h / 2 + p.top,
            bottom: h / 2 - p.bottom,
            left: -w / 2 + p.left,
            right: w / 2 - p.right,
            width: w - p.left - p.right,
            height: h - p.top - p.bottom
        };
    }

    /**
     * Add a child element to the container
     * @param {Phaser.GameObjects.GameObject} element - Element to add
     * @param {object} options - Child-specific options
     * @param {string} options.anchor - 'start' | 'center' | 'end' (along layout direction)
     * @returns {UIContainer} This container for chaining
     */
    addChild(element, options = {}) {
        // Get original dimensions
        const originalWidth = element.width ?? element.displayWidth ?? 0;
        const originalHeight = element.height ?? element.displayHeight ?? 0;
        const originalScaleX = element.scaleX ?? 1;
        const originalScaleY = element.scaleY ?? 1;

        const childData = {
            element: element,
            anchor: options.anchor || this.config.defaultAnchor,
            originalWidth: originalWidth,
            originalHeight: originalHeight,
            originalScaleX: originalScaleX,
            originalScaleY: originalScaleY
        };

        this.children.push(childData);
        this.add(element); // Add to Phaser container

        this._recalculateLayout();
        return this;
    }

    /**
     * Remove a child element
     * @param {Phaser.GameObjects.GameObject} element - Element to remove
     * @returns {UIContainer} This container for chaining
     */
    removeChild(element) {
        const index = this.children.findIndex(c => c.element === element);
        if (index > -1) {
            const childData = this.children[index];
            // Restore original scale
            if (childData.element.setScale) {
                childData.element.setScale(childData.originalScaleX, childData.originalScaleY);
            }
            this.children.splice(index, 1);
            this.remove(element);
            this._recalculateLayout();
        }
        return this;
    }

    /**
     * Remove all children
     * @returns {UIContainer} This container for chaining
     */
    clearChildren() {
        this.children.forEach(({ element, originalScaleX, originalScaleY }) => {
            // Restore original scale
            if (element.setScale) {
                element.setScale(originalScaleX, originalScaleY);
            }
            this.remove(element);
        });
        this.children = [];
        this.currentScaleFactor = 1;
        return this;
    }

    /**
     * Set container dimensions
     * @param {number} width - New width
     * @param {number} height - New height
     * @returns {UIContainer} This container for chaining
     */
    setContainerSize(width, height) {
        this.config.width = width;
        this.config.height = height;

        if (this.background) {
            this.background.setSize(width, height);
        }

        this.setSize(width, height);
        this._updateContentBounds();
        this._recalculateLayout();

        return this;
    }

    /**
     * Main layout recalculation
     * @private
     */
    _recalculateLayout() {
        if (this.children.length === 0) return;

        // When fitScreen is active, skip internal child scaling
        // The container's setScale() handles all scaling uniformly
        if (this.config.fitScreen) {
            this.currentScaleFactor = 1;
            this._applyLayout();
            return;
        }

        // Step 1: Calculate total required space at scale 1.0
        const { requiredMainAxis, requiredCrossAxis } = this._calculateRequiredSpace();

        // Step 2: Determine available space
        const isHorizontal = this.config.layout === 'horizontal';
        const availableMainAxis = isHorizontal
            ? this.contentBounds.width
            : this.contentBounds.height;
        const availableCrossAxis = isHorizontal
            ? this.contentBounds.height
            : this.contentBounds.width;

        // Step 3: Calculate scale factor
        this.currentScaleFactor = this._calculateScaleFactor(
            requiredMainAxis,
            requiredCrossAxis,
            availableMainAxis,
            availableCrossAxis
        );

        // Step 4: Apply scale and position children
        this._applyLayout();
    }

    /**
     * Calculate total space required by all children
     * @private
     */
    _calculateRequiredSpace() {
        const spacing = this.config.spacing;
        const numChildren = this.children.length;
        const isHorizontal = this.config.layout === 'horizontal';

        let totalMainAxis = 0;
        let maxCrossAxis = 0;

        this.children.forEach(({ originalWidth, originalHeight }) => {
            if (isHorizontal) {
                totalMainAxis += originalWidth;
                maxCrossAxis = Math.max(maxCrossAxis, originalHeight);
            } else {
                totalMainAxis += originalHeight;
                maxCrossAxis = Math.max(maxCrossAxis, originalWidth);
            }
        });

        // Add spacing between children (n-1 gaps) for fixed spacing
        if (!this.config.flexibleSpacing && numChildren > 1) {
            totalMainAxis += spacing * (numChildren - 1);
        }

        return {
            requiredMainAxis: totalMainAxis,
            requiredCrossAxis: maxCrossAxis
        };
    }

    /**
     * Calculate uniform scale factor for all children
     * @private
     */
    _calculateScaleFactor(requiredMain, requiredCross, availableMain, availableCross) {
        if (this.config.scaleMode === 'none') {
            return 1.0;
        }

        let scaleFactor = 1.0;

        // Prevent division by zero
        if (requiredMain <= 0 || requiredCross <= 0) {
            return 1.0;
        }

        // Calculate scale needed to fit in both axes
        const scaleMain = availableMain / requiredMain;
        const scaleCross = availableCross / requiredCross;

        // Use the smaller scale to ensure everything fits
        const fitScale = Math.min(scaleMain, scaleCross);

        if (this.config.scaleMode === 'shrink') {
            // Only scale down, never up
            scaleFactor = Math.min(1.0, fitScale);
        } else if (this.config.scaleMode === 'fit') {
            // Scale to fill (both up and down)
            scaleFactor = fitScale;
        }

        // Apply min/max constraints
        scaleFactor = Phaser.Math.Clamp(
            scaleFactor,
            this.config.minScaleFactor,
            this.config.maxScaleFactor
        );

        return scaleFactor;
    }

    /**
     * Apply calculated layout to children
     * @private
     */
    _applyLayout() {
        const scale = this.currentScaleFactor;
        const spacing = this.config.flexibleSpacing
            ? this._calculateFlexibleSpacing(scale)
            : this.config.spacing * scale;

        // Group children by anchor
        const startChildren = [];
        const centerChildren = [];
        const endChildren = [];

        this.children.forEach(child => {
            switch (child.anchor) {
                case 'start':
                    startChildren.push(child);
                    break;
                case 'center':
                    centerChildren.push(child);
                    break;
                case 'end':
                    endChildren.push(child);
                    break;
                default:
                    startChildren.push(child);
            }
        });

        // Position each group
        this._positionGroup(startChildren, 'start', scale, spacing);
        this._positionGroup(centerChildren, 'center', scale, spacing);
        this._positionGroup(endChildren, 'end', scale, spacing);
    }

    /**
     * Position a group of children with same anchor
     * @private
     */
    _positionGroup(group, anchor, scale, spacing) {
        if (group.length === 0) return;

        const isHorizontal = this.config.layout === 'horizontal';
        const bounds = this.contentBounds;

        // Calculate group total size
        let groupSize = 0;
        group.forEach(({ originalWidth, originalHeight }) => {
            groupSize += isHorizontal
                ? originalWidth * scale
                : originalHeight * scale;
        });
        groupSize += spacing * (group.length - 1);

        // Determine starting position based on anchor
        let mainAxisPos;

        switch (anchor) {
            case 'start':
                mainAxisPos = isHorizontal ? bounds.left : bounds.top;
                break;
            case 'center':
                mainAxisPos = isHorizontal
                    ? -groupSize / 2
                    : -groupSize / 2;
                break;
            case 'end':
                mainAxisPos = isHorizontal
                    ? bounds.right - groupSize
                    : bounds.bottom - groupSize;
                break;
        }

        // Position each child in the group
        group.forEach(({ element, originalWidth, originalHeight, originalScaleX, originalScaleY }) => {
            const scaledWidth = originalWidth * scale;
            const scaledHeight = originalHeight * scale;

            // Apply scale (relative to original scale)
            if (element.setScale) {
                element.setScale(originalScaleX * scale, originalScaleY * scale);
            }

            // Calculate cross-axis position based on childAlign
            let crossAxisPos;
            switch (this.config.childAlign) {
                case 'start':
                    crossAxisPos = isHorizontal
                        ? bounds.top + scaledHeight / 2
                        : bounds.left + scaledWidth / 2;
                    break;
                case 'center':
                    crossAxisPos = 0; // Center of container
                    break;
                case 'end':
                    crossAxisPos = isHorizontal
                        ? bounds.bottom - scaledHeight / 2
                        : bounds.right - scaledWidth / 2;
                    break;
            }

            // Set position (assuming elements have origin 0.5)
            if (isHorizontal) {
                element.x = mainAxisPos + scaledWidth / 2;
                element.y = crossAxisPos;
                mainAxisPos += scaledWidth + spacing;
            } else {
                element.x = crossAxisPos;
                element.y = mainAxisPos + scaledHeight / 2;
                mainAxisPos += scaledHeight + spacing;
            }
        });
    }

    /**
     * Calculate flexible spacing to distribute children evenly
     * @private
     */
    _calculateFlexibleSpacing(scale) {
        if (this.children.length <= 1) return 0;

        const isHorizontal = this.config.layout === 'horizontal';
        const availableSpace = isHorizontal
            ? this.contentBounds.width
            : this.contentBounds.height;

        // Calculate total child size
        let totalChildSize = 0;
        this.children.forEach(({ originalWidth, originalHeight }) => {
            totalChildSize += isHorizontal
                ? originalWidth * scale
                : originalHeight * scale;
        });

        // Remaining space divided by gaps
        const remainingSpace = availableSpace - totalChildSize;
        return Math.max(0, remainingSpace / (this.children.length - 1));
    }

    /**
     * Reposition based on alignment
     * @returns {UIContainer} This container for chaining
     */
    reposition() {
        if (!this.config.alignment) return this;

        const pos = ResponsiveManager.getAlignmentPosition(
            this.config.alignment,
            this.config.margin
        );

        this.x = pos.x;
        this.y = pos.y;

        return this;
    }

    /**
     * Set alignment and auto-reposition
     * @param {string} alignment - Alignment: 'top-left', 'center', 'bottom-right', etc.
     * @param {object|number} margin - Margin from edges { x, y } or number
     * @returns {UIContainer} This container for chaining
     */
    setAlignment(alignment, margin) {
        this.config.alignment = alignment;
        this.config.margin = margin || this.config.margin;
        this.reposition();

        // Update tracking if auto-reposition is enabled
        if (this.config.autoReposition) {
            ResponsiveManager.untrackElement(this);
            ResponsiveManager.trackElement(this, alignment, this.config.margin, {
                autoOrigin: false
            });
        }

        return this;
    }

    /**
     * Show the container with animation
     * @param {string} direction - Animation direction: 'fade', 'top', 'bottom', 'left', 'right'
     * @param {number} duration - Animation duration
     * @returns {UIContainer} This container for chaining
     */
    show(direction = 'fade', duration = 300) {
        if (direction === 'fade') {
            tweenPresets.fadeIn(this.scene, this, duration);
        } else {
            tweenPresets.slideIn(this.scene, this, direction, duration);
        }
        return this;
    }

    /**
     * Hide the container with animation
     * @param {string} direction - Animation direction: 'fade', 'top', 'bottom', 'left', 'right'
     * @param {number} duration - Animation duration
     * @returns {UIContainer} This container for chaining
     */
    hide(direction = 'fade', duration = 300) {
        if (direction === 'fade') {
            tweenPresets.fadeOut(this.scene, this, duration);
        } else {
            tweenPresets.slideOut(this.scene, this, direction, duration);
        }
        return this;
    }

    /**
     * Get the current scale factor applied to children
     * @returns {number} Current scale factor
     */
    getScaleFactor() {
        return this.currentScaleFactor;
    }

    /**
     * Get content bounds for external layout
     * @returns {object} Bounds { top, bottom, left, right, width, height }
     */
    getContentBounds() {
        return { ...this.contentBounds };
    }

    /**
     * Get the container scale factor (screen-fit scaling)
     * @returns {number} Container scale factor
     */
    getContainerScaleFactor() {
        return this.containerScaleFactor;
    }

    /**
     * Get the effective container dimensions (may be smaller than config when fitScreen is active)
     * @returns {object} { width, height } - Current effective dimensions
     */
    getEffectiveDimensions() {
        return {
            width: this.effectiveWidth,
            height: this.effectiveHeight
        };
    }

    /**
     * Handle screen resize for fitScreen mode
     * @private
     */
    _onScreenResize() {
        if (this.config.fitScreen) {
            this._applyScreenFitScale();
        }
    }

    /**
     * Calculate and apply screen-fit scaling
     * Two-phase approach:
     * 1. First shrink the container (background), reducing spacing between children
     * 2. Only scale everything when spacing would go below minSpacing
     * @private
     */
    _applyScreenFitScale() {
        const { width: screenWidth, height: screenHeight } = this.scene.scale;
        const margin = this.config.fitScreenMargin;
        const axis = this.config.fitScreenAxis;

        // Calculate available space based on container position and alignment
        const { availableWidth, availableHeight } = this._calculateAvailableSpace(screenWidth, screenHeight, margin);

        // Original container dimensions
        const originalWidth = this.config.width;
        const originalHeight = this.config.height;

        // Calculate minimum container size (children + minSpacing + padding)
        const minWidth = this._calculateMinContainerSize('width');
        const minHeight = this._calculateMinContainerSize('height');

        let effectiveWidth = originalWidth;
        let effectiveHeight = originalHeight;
        let scaleFactor = 1.0;

        // Handle width
        if (axis === 'width' || axis === 'both') {
            if (availableWidth < originalWidth) {
                if (availableWidth >= minWidth) {
                    // Phase 1: Shrink container only, no scaling
                    effectiveWidth = availableWidth;
                } else {
                    // Phase 2: Container at minimum, scale everything
                    effectiveWidth = minWidth;
                    scaleFactor = Math.min(scaleFactor, availableWidth / minWidth);
                }
            }
        }

        // Handle height
        if (axis === 'height' || axis === 'both') {
            if (availableHeight < originalHeight) {
                if (availableHeight >= minHeight) {
                    // Phase 1: Shrink container only, no scaling
                    effectiveHeight = availableHeight;
                } else {
                    // Phase 2: Container at minimum, scale everything
                    effectiveHeight = minHeight;
                    scaleFactor = Math.min(scaleFactor, availableHeight / minHeight);
                }
            }
        }

        // Apply minimum scale constraint
        scaleFactor = Math.max(scaleFactor, this.config.minContainerScale);

        // Track changes
        const sizeChanged = effectiveWidth !== this.effectiveWidth || effectiveHeight !== this.effectiveHeight;
        const scaleChanged = scaleFactor !== this.containerScaleFactor;

        // Update effective dimensions
        this.effectiveWidth = effectiveWidth;
        this.effectiveHeight = effectiveHeight;
        this.containerScaleFactor = scaleFactor;

        // Update background size to effective dimensions
        // The container's setScale will scale this uniformly
        if (this.background) {
            this.background.setSize(effectiveWidth, effectiveHeight);
        }

        // Update content bounds based on effective size
        // Children will be laid out in this space, then scaled with the container
        this._updateContentBounds(effectiveWidth, effectiveHeight);

        // Apply scale to the entire container (background + children scale together)
        if (scaleChanged) {
            this.setScale(scaleFactor);
        }

        // Recalculate child layout if anything changed
        if (sizeChanged || scaleChanged) {
            this._recalculateLayout();
        }
    }

    /**
     * Calculate minimum container size where children fit with minSpacing
     * @private
     */
    _calculateMinContainerSize(axis) {
        const isMainAxis = (this.config.layout === 'horizontal' && axis === 'width') ||
                          (this.config.layout === 'vertical' && axis === 'height');

        if (!isMainAxis) {
            // For cross axis, use original size
            return axis === 'width' ? this.config.width : this.config.height;
        }

        // Calculate total children size along main axis
        const isHorizontal = this.config.layout === 'horizontal';
        let totalChildrenSize = 0;

        this.children.forEach(({ originalWidth, originalHeight }) => {
            totalChildrenSize += isHorizontal ? originalWidth : originalHeight;
        });

        // Add minimum spacing and padding
        const numGaps = Math.max(0, this.children.length - 1);
        const p = this.config.padding;
        const padding = isHorizontal ? (p.left + p.right) : (p.top + p.bottom);

        return totalChildrenSize + (this.config.minSpacing * numGaps) + padding;
    }

    /**
     * Calculate available space for the container based on its alignment position
     * For edge-aligned containers, available space is limited by how close they are to edges
     * @private
     */
    _calculateAvailableSpace(screenWidth, screenHeight, margin) {
        // If no alignment, assume full screen (minus margins on both sides)
        if (!this.config.alignment) {
            return {
                availableWidth: screenWidth - (margin.x * 2),
                availableHeight: screenHeight - (margin.y * 2)
            };
        }

        // Get the container's position based on alignment
        const pos = ResponsiveManager.getAlignmentPosition(
            this.config.alignment,
            this.config.margin
        );

        // Calculate available space on each side from container center position
        // Container has origin 0.5, so it extends equally in both directions
        const leftSpace = pos.x - margin.x;
        const rightSpace = screenWidth - pos.x - margin.x;
        const topSpace = pos.y - margin.y;
        const bottomSpace = screenHeight - pos.y - margin.y;

        // Available width/height is double the minimum side space (since container is centered)
        // This ensures the container fits within bounds on both sides
        return {
            availableWidth: Math.min(leftSpace, rightSpace) * 2,
            availableHeight: Math.min(topSpace, bottomSpace) * 2
        };
    }

    /**
     * Enable or disable screen-fit scaling
     * @param {boolean} enabled - Whether to enable fitScreen
     * @param {object} options - Optional configuration updates
     * @returns {UIContainer} This container for chaining
     */
    setFitScreen(enabled, options = {}) {
        const wasEnabled = this.config.fitScreen;
        this.config.fitScreen = enabled;

        // Update options if provided
        if (options.axis !== undefined) this.config.fitScreenAxis = options.axis;
        if (options.margin !== undefined) this.config.fitScreenMargin = this._normalizeMargin(options.margin);
        if (options.minScale !== undefined) this.config.minContainerScale = options.minScale;
        if (options.minSpacing !== undefined) this.config.minSpacing = options.minSpacing;

        if (enabled && !wasEnabled) {
            // Enable: add listener and apply scale
            this._resizeHandler = this._onScreenResize.bind(this);
            this.scene.scale.on('resize', this._resizeHandler);
            this._applyScreenFitScale();
        } else if (!enabled && wasEnabled) {
            // Disable: remove listener and reset everything
            if (this._resizeHandler) {
                this.scene.scale.off('resize', this._resizeHandler);
                this._resizeHandler = null;
            }
            // Reset to original dimensions
            this.containerScaleFactor = 1;
            this.effectiveWidth = this.config.width;
            this.effectiveHeight = this.config.height;
            this.setScale(1);
            if (this.background) {
                this.background.setSize(this.config.width, this.config.height);
            }
            this._updateContentBounds();
            this._recalculateLayout();
        } else if (enabled) {
            // Already enabled, just reapply with new options
            this._applyScreenFitScale();
        }

        return this;
    }

    /**
     * Get all child data
     * @returns {Array} Array of child data objects
     */
    getChildren() {
        return this.children.map(c => c.element);
    }

    /**
     * Update layout configuration
     * @param {object} config - Configuration to update
     * @returns {UIContainer} This container for chaining
     */
    updateConfig(config) {
        if (config.layout !== undefined) this.config.layout = config.layout;
        if (config.spacing !== undefined) this.config.spacing = config.spacing;
        if (config.flexibleSpacing !== undefined) this.config.flexibleSpacing = config.flexibleSpacing;
        if (config.childAlign !== undefined) this.config.childAlign = config.childAlign;
        if (config.scaleMode !== undefined) this.config.scaleMode = config.scaleMode;
        if (config.minScaleFactor !== undefined) this.config.minScaleFactor = config.minScaleFactor;
        if (config.maxScaleFactor !== undefined) this.config.maxScaleFactor = config.maxScaleFactor;
        if (config.padding !== undefined) {
            this.config.padding = this._normalizePadding(config.padding);
            this._updateContentBounds();
        }

        this._recalculateLayout();
        return this;
    }

    /**
     * Cleanup
     */
    destroy(fromScene) {
        // Untrack from responsive manager
        if (this.config.alignment && this.config.autoReposition) {
            ResponsiveManager.untrackElement(this);
        }

        // Remove resize listener for fitScreen
        if (this._resizeHandler) {
            this.scene.scale.off('resize', this._resizeHandler);
            this._resizeHandler = null;
        }

        this.children = [];
        super.destroy(fromScene);
    }
}
