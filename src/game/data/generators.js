export const GENERATOR_DEFS = [
    {
        id: 'basic',
        name: 'Small Bubble Spawner',
        description: 'Spawns small bubbles worth $1 each',
        baseCost: 0.25,
        costMultiplier: 20,
        cooldown: 2000,
        bubbleValue: 1,
        bubbleColor: 0x87ceeb,
        bubbleRadius: 40,
        tier: 'basic',
        unlock: null,
    },
    {
        id: 'medium',
        name: 'Medium Bubble Spawner',
        description: 'Spawns medium bubbles worth $8 each',
        baseCost: 500,
        costMultiplier: 4,
        cooldown: 5000,
        bubbleValue: 8,
        bubbleColor: 0x98fb98,
        bubbleRadius: 65,
        tier: 'medium',
        unlock: { type: 'generator', id: 'basic', count: 3 },
    },
    {
        id: 'large',
        name: 'Large Bubble Spawner',
        description: 'Spawns large bubbles worth $50 each',
        baseCost: 5000,
        costMultiplier: 4,
        cooldown: 10000,
        bubbleValue: 50,
        bubbleColor: 0xdda0dd,
        bubbleRadius: 95,
        tier: 'large',
        unlock: { type: 'generator', id: 'medium', count: 2 },
    },
];

export function getGeneratorCost(def, owned) {
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, owned));
}

/**
 * Check if a generator's unlock condition is met.
 * Once unlocked, adds to permanentUnlocks so it stays unlocked forever.
 * @param {Object} def - Generator definition with unlock field
 * @param {Object} gameState - { generators, permanentUnlocks }
 * @returns {boolean}
 */
export function isGeneratorUnlocked(def, gameState) {
    if (gameState.permanentUnlocks && gameState.permanentUnlocks.has(def.id)) return true;
    if (!def.unlock) {
        if (gameState.permanentUnlocks) gameState.permanentUnlocks.add(def.id);
        return true;
    }
    const { type } = def.unlock;
    let met = false;
    if (type === 'generator') {
        met = (gameState.generators[def.unlock.id] || 0) >= def.unlock.count;
    }
    if (met && gameState.permanentUnlocks) gameState.permanentUnlocks.add(def.id);
    return met;
}

/**
 * Get human-readable text describing a generator's unlock condition.
 * @param {Object} def - Generator definition
 * @returns {string}
 */
export function getGeneratorUnlockText(def) {
    if (!def.unlock) return '';
    const { type } = def.unlock;
    if (type === 'generator') {
        const reqGen = GENERATOR_DEFS.find(g => g.id === def.unlock.id);
        const name = reqGen ? reqGen.name : def.unlock.id;
        return `Own ${def.unlock.count} ${name}s`;
    }
    return '';
}
