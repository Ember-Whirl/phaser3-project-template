export const GENERATOR_DEFS = [
    {
        id: 'basic',
        name: 'Basic Blower',
        description: 'A simple bubble blower',
        baseCost: 10,
        costMultiplier: 1.15,
        cooldown: 500, // TODO: revert to 3000 after testing
        bubbleValue: 1,
        bubbleColor: 0x87ceeb,
        bubbleRadius: 60,
    },
    {
        id: 'machine',
        name: 'Bubble Machine',
        description: 'Automated bubble production',
        baseCost: 100,
        costMultiplier: 1.15,
        cooldown: 2000,
        bubbleValue: 5,
        bubbleColor: 0x98fb98,
        bubbleRadius: 75,
    },
    {
        id: 'super',
        name: 'Super Soaker',
        description: 'High pressure bubble stream',
        baseCost: 500,
        costMultiplier: 1.15,
        cooldown: 1500,
        bubbleValue: 15,
        bubbleColor: 0xdda0dd,
        bubbleRadius: 90,
    },
    {
        id: 'mega',
        name: 'Mega Blaster',
        description: 'Industrial bubble factory',
        baseCost: 2500,
        costMultiplier: 1.15,
        cooldown: 1000,
        bubbleValue: 50,
        bubbleColor: 0xffd700,
        bubbleRadius: 105,
    },
    {
        id: 'golden',
        name: 'Golden Fountain',
        description: 'Legendary golden bubbles',
        baseCost: 10000,
        costMultiplier: 1.15,
        cooldown: 2000,
        bubbleValue: 200,
        bubbleColor: 0xff6347,
        bubbleRadius: 120,
    }
];

export function getGeneratorCost(def, owned) {
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, owned));
}
