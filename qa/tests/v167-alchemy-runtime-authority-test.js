import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeCanonicalAlchemyInventoryAfterRestore } from '../../dist/core/session-restore.js';
import { alchemyPillResourceId, parseAlchemyPillResourceId } from '../../dist/core/alchemy-v112.js';
import {
  ALCHEMY_V146_RETIRED_FAMILY_IDS,
  alchemyPillResourceIdV146,
  parseAlchemyPillResourceIdV146,
  alchemyV146SourceSinkContract,
} from '../../dist/core/alchemy-v146.js';
import { migrateAlchemyV112ToV146 } from '../../dist/core/alchemy-production-v146.js';

// Restore must collapse all valid V112 pill inventory into V146 immediately, including future-tier pills.
const legacyFutureCultivation = alchemyPillResourceId('cultivation', 8, 'supreme');
const legacyFutureDaoPower = alchemyPillResourceId('daoPower', 8, 'low');
const legacyBuff = alchemyPillResourceId('buffPower', 5, 'mid');
const canonicalCultivation = alchemyPillResourceIdV146('cultivation', 25, 'supreme');
const canonicalLifePower = alchemyPillResourceIdV146('lifePower', 25, 'low');
const canonicalBuff = alchemyPillResourceIdV146('buffPower', 15, 'mid');
const state = { inventory: {
  [legacyFutureCultivation]: 3,
  [legacyFutureDaoPower]: 4,
  [legacyBuff]: 2,
  [canonicalCultivation]: 5,
} };
normalizeCanonicalAlchemyInventoryAfterRestore(state);
assert.equal(state.inventory[legacyFutureCultivation], undefined);
assert.equal(state.inventory[legacyFutureDaoPower], undefined);
assert.equal(state.inventory[legacyBuff], undefined);
assert.equal(state.inventory[canonicalCultivation], 8, 'canonical restore must merge quantities without loss');
assert.equal(state.inventory[canonicalLifePower], 4, 'retired Dao Dan must map to the V146 permanent-stat family');
assert.equal(state.inventory[canonicalBuff], 2);
assert(parseAlchemyPillResourceIdV146(canonicalCultivation));
assert.equal(parseAlchemyPillResourceIdV146(canonicalLifePower)?.family, 'lifePower');
assert.equal(parseAlchemyPillResourceId(legacyFutureCultivation)?.realmTier, 8);

// Running normal V146 migration afterward must not find a second legacy pill authority.
const container = {};
const migrated = migrateAlchemyV112ToV146({ container, inventory: state.inventory, currentMajorRealmIndex: 1 });
assert.equal(migrated.legacyPillsConverted, 0);
assert(Object.keys(state.inventory).filter(id => parseAlchemyPillResourceId(id)).length === 0);

// V146 owns the authored family/source-sink contract; Dao Dan families are retired aliases only.
const contract = alchemyV146SourceSinkContract();
assert.deepEqual([...ALCHEMY_V146_RETIRED_FAMILY_IDS], ['daoPower', 'daoBody', 'daoDefense']);
assert.deepEqual(contract.retiredFamilies, ['daoPower', 'daoBody', 'daoDefense']);
assert.deepEqual(contract.ingredients.map(x => x.family), ['herb', 'demonCore']);

// Production/read model is V146. Compatibility method names may remain, but UI inventory exposes V146 IDs only.
const bridge = fs.readFileSync('dist/core/alchemy-session-bridge-v146.js', 'utf8');
assert.match(bridge, /canonicalPillSystem: 'alchemy\.v146'/);
assert.match(bridge, /const desc = parseAlchemyPillResourceIdV146\(resourceId\)/);
assert.match(bridge, /proto\.startAlchemyV112 = function startAlchemyV146Compatibility/);

// Pill consumer may read old IDs for compatibility, but restore is now the authority barrier.
const consumer = fs.readFileSync('dist/core/session-alchemy-pill.js', 'utf8');
assert.match(consumer, /V146 canonical pill consumer/);
assert.match(consumer, /V112 compatibility only/);
const restore = fs.readFileSync('dist/core/session-restore.js', 'utf8');
assert.match(restore, /normalizeCanonicalAlchemyInventoryAfterRestore\(state\)/);

console.log('V167 Alchemy runtime authority PASS');
