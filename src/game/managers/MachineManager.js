import BubbleMachine from '../objects/BubbleMachine.js';
import { GENERATOR_DEFS } from '../data/generators.js';
import { PLAY_WIDTH, PLAY_HEIGHT } from '../PlayAreaConfig.js';

/**
 * Machine Manager
 * Manages bubble machine visual objects — their creation, layout, and selection
 * for bubble spawning.
 *
 * All positions use the fixed PLAY_WIDTH x PLAY_HEIGHT coordinate space.
 * The gameplay container handles scaling to screen.
 *
 * @example
 * const machines = new MachineManager(scene, gameplayContainer);
 * machines.rebuild(generators);
 * machines.layout();
 * const machine = machines.pickSpawnMachine('basic', 0);
 */
export default class MachineManager {
    /**
     * @param {Phaser.Scene} scene - The parent Phaser scene
     * @param {Phaser.GameObjects.Container} container - Gameplay container
     */
    constructor(scene, container) {
        this.scene = scene;
        this.container = container;

        /** @type {BubbleMachine[]} */
        this.machineVisuals = [];
    }

    /**
     * Destroy and recreate all machine visuals based on current generator ownership.
     * @param {Object<string, number>} generators - Map of generator id → owned count
     */
    rebuild(generators) {
        // Destroy existing
        this.machineVisuals.forEach(m => { if (m) m.destroy(); });
        this.machineVisuals = [];

        // Collect all owned machines: one visual per owned unit
        const entries = [];
        GENERATOR_DEFS.forEach(def => {
            const count = generators[def.id];
            for (let i = 0; i < count; i++) {
                entries.push({ def, index: i });
            }
        });

        if (entries.length === 0) return;

        const totalMachines = entries.length;
        const spacing = PLAY_WIDTH / (totalMachines + 1);

        entries.forEach((entry, i) => {
            const mx = spacing * (i + 1);
            const my = PLAY_HEIGHT - 8;

            const machine = new BubbleMachine(this.scene, mx, my, {
                tier: entry.def.tier,
                color: entry.def.bubbleColor,
                machineIndex: entry.index,
            });
            this.container.add(machine);
            machine._generatorId = entry.def.id;
            machine._unitIndex = entry.index;
            this.machineVisuals.push(machine);
        });
    }

    /**
     * Reposition all machines evenly across the play area bottom.
     */
    layout() {
        if (this.machineVisuals.length === 0) return;

        const total = this.machineVisuals.length;
        const spacing = PLAY_WIDTH / (total + 1);

        this.machineVisuals.forEach((machine, i) => {
            machine.x = spacing * (i + 1);
            machine.y = PLAY_HEIGHT - 8;
        });
    }

    /**
     * Get all machine visuals for a specific generator type.
     * @param {string} generatorId - Generator definition id
     * @returns {BubbleMachine[]}
     * @private
     */
    getMachinesForGenerator(generatorId) {
        return this.machineVisuals.filter(m => m._generatorId === generatorId);
    }

    /**
     * Pick the machine visual that should animate for a given spawn event.
     * Matches by unit index when possible, otherwise picks randomly.
     * @param {string} generatorId - Generator definition id
     * @param {number} unitIndex - Which owned unit is spawning
     * @returns {BubbleMachine|null}
     */
    pickSpawnMachine(generatorId, unitIndex) {
        const machines = this.getMachinesForGenerator(generatorId);
        if (machines.length === 0) return null;
        const match = machines.find(m => m._unitIndex === unitIndex);
        return match || machines[Math.floor(Math.random() * machines.length)];
    }

    /**
     * Update all machine visuals (animation frames).
     * @param {number} time - Scene time
     * @param {number} delta - Delta ms
     */
    update(time, delta) {
        this.machineVisuals.forEach(m => {
            if (m && m.active) m.update(time, delta);
        });
    }

    /**
     * Destroy all machine visuals and clean up.
     */
    destroy() {
        this.machineVisuals.forEach(m => { if (m) m.destroy(); });
        this.machineVisuals = [];
    }
}
