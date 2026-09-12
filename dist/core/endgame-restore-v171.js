const V171_BOUNDED_IMMORTAL_FIELDS = Object.freeze([
  'daoSuy', 'essencePurity', 'immortalBody', 'lawAdaptation',
  'earthAnchor', 'earthVeinHarmony', 'heavenResonance', 'celestialCirculation',
  'trueLawBody', 'trueLawAuthority', 'mysticLawWeave', 'mysticLawStability',
  'goldenImmortalSeal', 'indestructibleEssence', 'taiyiEpochRiver', 'causalStability',
  'grandLuoDaoFruit', 'timelineFreedom', 'kingDomainAuthority', 'orthodoxyWeight',
  'emperorMandate', 'worldAuthority', 'extremityPressure', 'supremeDaoCore',
  'supremeLawConsistency', 'chaosAffinity', 'chaosBody', 'hongmengSeed',
  'primordialVitality', 'heavenOpeningAuthority', 'innerCosmosStability',
  'worldCore', 'worldLifePotential', 'eternityAnchor', 'deathlessContinuity',
  'creationSource', 'genesisAuthority',
]);
const V171_NONNEGATIVE_IMMORTAL_FIELDS = Object.freeze([
  'immortalEssence', 'extremityInsight', 'extremityAuthority', 'creationEpochAuthority',
]);
const V171_NONNEGATIVE_INT_IMMORTAL_FIELDS = Object.freeze([
  'refinedBatches', 'earthRefinements', 'heavenRefinements', 'trueRefinements',
  'mysticRefinements', 'goldenRefinements', 'taiyiRefinements', 'grandLuoRefinements',
  'kingRefinements', 'emperorRefinements', 'extremityLayers', 'extremityRefinements',
  'supremeDaoRefinements', 'chaosRefinements', 'hongmengRefinements',
  'heavenOpeningRefinements', 'worldLordRefinements', 'eternityRefinements',
  'creationRefinements', 'creationEpochs', 'daoSuyTribulationsPassed', 'daoSuyTribulationsFailed',
]);
const V171_MANIFESTATION_CAPACITY_STEPS = Object.freeze([
  [114, 15], [110, 14], [106, 13], [102, 12], [98, 11], [94, 10],
  [90, 9], [86, 8], [82, 7], [78, 6], [74, 5], [66, 4], [62, 3],
]);
function finiteNonNegative(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}
function nonNegativeInt(value) {
  return Math.floor(finiteNonNegative(value));
}
function clamp100(value) {
  return Math.min(100, finiteNonNegative(value));
}
export function immortalManifestationCapacityV171(realmOrder) {
  const order = nonNegativeInt(realmOrder);
  for (const [minOrder, capacity] of V171_MANIFESTATION_CAPACITY_STEPS)
    if (order >= minOrder) return capacity;
  return 0;
}
function availableManifestationsV171(state, currentLife) {
  const available = new Set();
  if (nonNegativeInt(state?.realm?.maxRealmOrder) < 62) return available;
  available.add('law');
  if (state?.dao?.mainDaoId) available.add('dao');
  if (state?.dao?.domain?.active) available.add('domain');
  if (state?.soul?.awakened) available.add('soul');
  if ((state?.artifacts?.activeIds?.length ?? 0) > 0) available.add('artifact');
  if ((state?.character?.bloodlines?.length ?? 0) > 0) available.add('bloodline');
  if ((state?.character?.physiqueIds?.length ?? 0) > 0) available.add('physique');
  if (state?.character?.activeTechniqueId) available.add('technique');
  const lifeId = currentLife?.lifeId;
  if (lifeId && Object.values(state?.factions?.playerMemberships ?? {}).some(m => m?.lifeId === lifeId && m?.active))
    available.add('faction');
  if (Object.keys(state?.inheritedOrigins ?? {}).length > 0) available.add('origin');
  return available;
}
export function normalizeCanonicalEndgameAfterRestore(state, currentLife) {
  const immortal = state?.immortal;
  if (!immortal) return state;
  const realmOrder = nonNegativeInt(state?.realm?.maxRealmOrder);
  immortal.awakened = realmOrder >= 46;
  for (const key of V171_BOUNDED_IMMORTAL_FIELDS) immortal[key] = clamp100(immortal[key]);
  for (const key of V171_NONNEGATIVE_IMMORTAL_FIELDS) immortal[key] = finiteNonNegative(immortal[key]);
  for (const key of V171_NONNEGATIVE_INT_IMMORTAL_FIELDS) immortal[key] = nonNegativeInt(immortal[key]);

  const byMajor = {};
  for (const [key, value] of Object.entries(immortal.daoSuyTribulationsPassedByMajor ?? {}))
    byMajor[String(key)] = Math.min(5, nonNegativeInt(value));
  immortal.daoSuyTribulationsPassedByMajor = byMajor;
  const accountedPasses = Object.values(byMajor).reduce((sum, value) => sum + value, 0);
  immortal.daoSuyTribulationsPassed = Math.max(immortal.daoSuyTribulationsPassed, accountedPasses);

  const capacity = immortalManifestationCapacityV171(realmOrder);
  immortal.manifestationCapacity = capacity;
  const available = availableManifestationsV171(state, currentLife);
  immortal.activeManifestationIds = [...new Set((immortal.activeManifestationIds ?? []).filter(id => typeof id === 'string' && available.has(id)))].slice(0, capacity);
  return state;
}
