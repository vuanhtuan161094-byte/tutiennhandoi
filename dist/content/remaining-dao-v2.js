import { fistDaoV2 } from './fist-dao-v2.js';
import { bodyDaoV2 } from './body-dao-v2.js';
import { spellDaoV2 } from './spell-dao-v2.js';
import { poisonDaoV2 } from './poison-dao-v2.js';
import { artifactDaoV2 } from './artifact-dao-v2.js';
import { formationDaoV2 } from './formation-dao-v2.js';
import { mindDaoV2 } from './mind-dao-v2.js';
export const remainingDaoPacksV2 = [fistDaoV2, bodyDaoV2, spellDaoV2, poisonDaoV2, artifactDaoV2, formationDaoV2, mindDaoV2];
export const REMAINING_DAO_V2_COUNTS = { daos: remainingDaoPacksV2.length, passives: remainingDaoPacksV2.reduce((n, d) => n + d.passives.length, 0), mastery: remainingDaoPacksV2.reduce((n, d) => n + d.mastery.length, 0) };
//# sourceMappingURL=remaining-dao-v2.js.map