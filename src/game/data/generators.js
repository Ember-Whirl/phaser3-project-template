export const GENERATOR_DEFS = [
    {
        id: 'basic',
        name: 'Basic Blower',
        description: 'A simple bubble blower',
        baseCost: 10,
        costMultiplier: 1.15,
        cooldown: 2000,
        bubbleValue: 1,
        bubbleColor: 0x87ceeb,
        bubbleRadius: 40,
        tier: 'basic',
    },
    {
        id: 'medium',
        name: 'Medium Machine',
        description: 'Automated bubble production',
        baseCost: 100,
        costMultiplier: 1.15,
        cooldown: 5000,
        bubbleValue: 8,
        bubbleColor: 0x98fb98,
        bubbleRadius: 65,
        tier: 'medium',
    },
    {
        id: 'large',
        name: 'Large Launcher',
        description: 'Industrial-grade bubble launcher',
        baseCost: 1000,
        costMultiplier: 1.15,
        cooldown: 10000,
        bubbleValue: 50,
        bubbleColor: 0xdda0dd,
        bubbleRadius: 95,
        tier: 'large',
    },
];

export function getGeneratorCost(def, owned) {
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, owned));
}
