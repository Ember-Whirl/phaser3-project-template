export const UPGRADE_DEFS = [
    // ── Basic Tier ──────────────────────────────────────
    {
        id: 'basicSpawnRate',
        name: 'Small Spawn Speed',
        description: 'Small spawner produces bubbles 12% faster per level',
        baseCost: 75,
        costMultiplier: 1.6,
        maxOwned: 5,
        color: 0x87ceeb,
        tier: 'basic',
        category: 'spawnRate',
        reductionPerLevel: 0.12,
        unlock: { type: 'upgrade', id: 'helperHand', level: 1 },
    },
    {
        id: 'basicMultiSpawn',
        name: 'Small Spawn Amount',
        description: 'Small spawner produces +1 extra bubble per cycle',
        baseCost: 15,
        costMultiplier: 3.0,
        maxOwned: 3,
        color: 0x87ceeb,
        tier: 'basic',
        category: 'multiSpawn',
        unlock: { type: 'money', amount: 10 },
    },
    {
        id: 'basicBubbleValue',
        name: 'Small Bubble Value',
        description: 'Small bubbles are worth +$1 more per level',
        baseCost: 30,
        costMultiplier: 2.5,
        maxOwned: 5,
        color: 0x87ceeb,
        tier: 'basic',
        category: 'bubbleValue',
        bonusPerLevel: 1,
        unlock: { type: 'upgrade', id: 'basicMultiSpawn', level: 1 },
    },
    // ── Helper ──────────────────────────────────────────
    {
        id: 'helperHand',
        name: 'Helping Hand',
        description: 'Summons an auto-popping hand that seeks and pops bubbles',
        baseCost: 40,
        costMultiplier: 1.8,
        maxOwned: 5,
        color: 0x44dd88,
        popInterval: 2000,
        moveSpeed: 120,
        unlock: { type: 'money', amount: 30 },
    },
    // ── Medium Tier ─────────────────────────────────────
    {
        id: 'mediumSpawnRate',
        name: 'Medium Spawn Speed',
        description: 'Medium spawner produces bubbles 12% faster per level',
        baseCost: 200,
        costMultiplier: 1.6,
        maxOwned: 5,
        color: 0x98fb98,
        tier: 'medium',
        category: 'spawnRate',
        reductionPerLevel: 0.12,
        unlock: { type: 'upgrade', id: 'basicSpawnRate', level: 2 },
    },
    {
        id: 'mediumMultiSpawn',
        name: 'Medium Spawn Amount',
        description: 'Medium spawner produces +1 extra bubble per cycle',
        baseCost: 400,
        costMultiplier: 2.0,
        maxOwned: 3,
        color: 0x98fb98,
        tier: 'medium',
        category: 'multiSpawn',
        unlock: { type: 'upgrade', id: 'mediumSpawnRate', level: 1 },
    },
    {
        id: 'mediumBubbleValue',
        name: 'Medium Bubble Value',
        description: 'Medium bubbles are worth +$3 more per level',
        baseCost: 600,
        costMultiplier: 2.5,
        maxOwned: 5,
        color: 0x98fb98,
        tier: 'medium',
        category: 'bubbleValue',
        bonusPerLevel: 3,
        unlock: { type: 'upgrade', id: 'mediumMultiSpawn', level: 1 },
    },
    {
        id: 'mediumCascade',
        name: 'Medium Chain',
        description: 'Popping a medium bubble may spawn 1-2 basic bubbles',
        baseCost: 300,
        costMultiplier: 1.8,
        maxOwned: 5,
        color: 0x98fb98,
        tier: 'medium',
        category: 'cascade',
        chancePerLevel: 0.05,
        minChildren: 1,
        maxChildren: 2,
        childTier: 'basic',
        unlock: { type: 'bubblesPopped', count: 150 },
    },
    // ── Lucky ───────────────────────────────────────────
    {
        id: 'luckyChance',
        name: 'Golden Touch',
        description: 'Increases the spawn rate of golden bubbles worth double',
        baseCost: 500,
        costMultiplier: 2.0,
        maxOwned: 5,
        color: 0xffd700,
        category: 'lucky',
        bonusPerLevel: 0.005,
        unlock: { type: 'money', amount: 500 },
    },
    // ── Large Tier ──────────────────────────────────────
    {
        id: 'largeSpawnRate',
        name: 'Large Spawn Speed',
        description: 'Large spawner produces bubbles 12% faster per level',
        baseCost: 1500,
        costMultiplier: 1.6,
        maxOwned: 5,
        color: 0xdda0dd,
        tier: 'large',
        category: 'spawnRate',
        reductionPerLevel: 0.12,
        unlock: { type: 'upgrade', id: 'mediumSpawnRate', level: 3 },
    },
    {
        id: 'largeMultiSpawn',
        name: 'Large Spawn Amount',
        description: 'Large spawner produces +1 extra bubble per cycle',
        baseCost: 3000,
        costMultiplier: 2.0,
        maxOwned: 3,
        color: 0xdda0dd,
        tier: 'large',
        category: 'multiSpawn',
        unlock: { type: 'upgrade', id: 'largeSpawnRate', level: 1 },
    },
    {
        id: 'largeCascade',
        name: 'Large Chain',
        description: 'Popping a large bubble may spawn 2-3 medium bubbles',
        baseCost: 2000,
        costMultiplier: 1.8,
        maxOwned: 5,
        color: 0xdda0dd,
        tier: 'large',
        category: 'cascade',
        chancePerLevel: 0.05,
        minChildren: 2,
        maxChildren: 3,
        childTier: 'medium',
        unlock: { type: 'upgrade', id: 'largeMultiSpawn', level: 1 },
    },
];

export function getUpgradeCost(def, owned) {
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, owned));
}

/**
 * Check if an upgrade's unlock condition is met.
 * @param {Object} def - Upgrade definition with unlock field
 * @param {Object} gameState - { money, upgrades, bubblesPopped }
 * @returns {boolean}
 */
export function isUpgradeUnlocked(def, gameState) {
    if (gameState.permanentUnlocks && gameState.permanentUnlocks.has(def.id)) return true;
    if (!def.unlock) {
        if (gameState.permanentUnlocks) gameState.permanentUnlocks.add(def.id);
        return true;
    }
    const { type } = def.unlock;
    let met = false;
    if (type === 'money') met = gameState.money >= def.unlock.amount;
    if (type === 'bubblesPopped') met = gameState.bubblesPopped >= def.unlock.count;
    if (type === 'upgrade') met = (gameState.upgrades[def.unlock.id] || 0) >= def.unlock.level;
    if (met && gameState.permanentUnlocks) gameState.permanentUnlocks.add(def.id);
    return met;
}

/**
 * Get human-readable text describing an upgrade's unlock condition.
 * @param {Object} def - Upgrade definition
 * @returns {string}
 */
export function getUnlockText(def) {
    if (!def.unlock) return '';
    const { type } = def.unlock;
    if (type === 'money') return `Have $${def.unlock.amount}`;
    if (type === 'bubblesPopped') return `Pop ${def.unlock.count} bubbles`;
    if (type === 'upgrade') {
        const reqDef = UPGRADE_DEFS.find(u => u.id === def.unlock.id);
        const name = reqDef ? reqDef.name : def.unlock.id;
        return `${name} Lv.${def.unlock.level}`;
    }
    return '';
}
