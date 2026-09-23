/**
 * Production Endless Hunt Combat facade after Phase-9 cutover.
 *
 * The shared bridge remains in the V2 compatibility module during the
 * strangler migration so historical V2 callers keep working unchanged.
 */
export { resolveEndlessHuntWithCombatKernelV3 } from './endless-hunt-combat-kernel-v2.js';
