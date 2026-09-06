export function createGenesisWorldState(currentWorldYear = 0) { return { serial: 0, simulatedUntilWorldYear: currentWorldYear, worlds: {} }; }
function hydrateGenesisWorld(world) {
    return {
        ...world,
        creatorRelation: world.creatorRelation ?? Math.max(20, Math.min(100, 52 + world.autonomy * 0.32)),
        rebellionPressure: world.rebellionPressure ?? 0,
        notableSerial: world.notableSerial ?? 0,
        sectSerial: world.sectSerial ?? 0,
        daoSerial: world.daoSerial ?? 0,
        transcendedCount: world.transcendedCount ?? 0,
        notables: Object.fromEntries(Object.entries(world.notables ?? {}).map(([id, v]) => [id, { ...v }])),
        sects: Object.fromEntries(Object.entries(world.sects ?? {}).map(([id, v]) => [id, { ...v }])),
        emergentDaos: Object.fromEntries(Object.entries(world.emergentDaos ?? {}).map(([id, v]) => [id, { ...v }])),
        laws: { ...world.laws },
        chronicle: world.chronicle.map(event => ({ ...event })),
    };
}
export function cloneGenesisWorldState(state) {
    return {
        serial: state?.serial ?? 0,
        simulatedUntilWorldYear: state?.simulatedUntilWorldYear ?? 0,
        worlds: Object.fromEntries(Object.entries(state?.worlds ?? {}).map(([id, world]) => [id, hydrateGenesisWorld(world)])),
    };
}
function clamp100(value) { return Math.max(0, Math.min(100, value)); }
function unitFrom(value) { let x = value | 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 1_000_000) / 1_000_000; }
function hashText(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
} return h >>> 0; }
export function genesisWorldCapacity(creationEpochs, genesisAuthority) { return 1 + Math.floor(Math.max(0, creationEpochs) / 2) + Math.floor(Math.max(0, genesisAuthority) / 40); }
export function createGenesisWorld(state, creatorLifeId, worldYear, name, lifePotential, authority, laws) {
    const id = `genesis.world.${state.serial++}`;
    const worldName = name.trim() || `Vô Danh Giới ${state.serial}`;
    const world = {
        id, name: worldName, creatorLifeId, createdAtWorldYear: worldYear, ageYears: 0,
        laws: { order: clamp100(laws?.order ?? (45 + authority * 0.15)), freedom: clamp100(laws?.freedom ?? (45 + lifePotential * 0.15)), energy: clamp100(laws?.energy ?? (35 + authority * 0.22)), cycle: clamp100(laws?.cycle ?? 55) },
        stability: clamp100(38 + authority * 0.38), autonomy: 58, creatorRelation: 68, rebellionPressure: 0, lifePotential: clamp100(lifePotential),
        civilizationLevel: 0, civilizationStage: 'seed', populationScale: 0.001, calamityPressure: 0, insightStored: 0, eras: 1, extinct: false,
        notableSerial: 0, sectSerial: 0, daoSerial: 0, transcendedCount: 0, notables: {}, sects: {}, emergentDaos: {},
        chronicle: [{ worldAgeYears: 0, type: 'birth', significance: 100, message: `${worldName} khai sinh; luật nền bắt đầu tự ổn định.` }],
    };
    state.worlds[id] = world;
    return world;
}
function civilizationStageFor(level) {
    if (level < 8)
        return 'seed';
    if (level < 22)
        return 'tribal';
    if (level < 40)
        return 'kingdom';
    if (level < 58)
        return 'cultivation';
    if (level < 74)
        return 'stellar';
    if (level < 90)
        return 'law';
    return 'transcendent';
}
const stageNames = { seed: 'Mầm Sống', tribal: 'Bộ Lạc', kingdom: 'Vương Triều', cultivation: 'Tu Hành Văn Minh', stellar: 'Tinh Hải Văn Minh', law: 'Pháp Tắc Văn Minh', transcendent: 'Siêu Thoát Văn Minh' };
const notableSurnames = ['Lạc', 'Tần', 'Mặc', 'Tô', 'Yến', 'Bạch', 'Hàn', 'Cố', 'Sở', 'Ninh', 'Vân', 'Diệp'];
const notableNames = ['Thiên Minh', 'Vô Trần', 'Thanh Dao', 'Trường Phong', 'Tinh Hà', 'Tử Yên', 'Kiếm Tâm', 'Huyền Cơ', 'Linh Nguyệt', 'Đạo Sinh', 'Vấn Thiên', 'Mộng Ly'];
const sectPrefixes = ['Thái Sơ', 'Vạn Kiếm', 'Thiên Luật', 'Huyền Minh', 'Tinh Hải', 'Vô Cực', 'Tử Tiêu', 'Sinh Diệt'];
const sectSuffixes = ['Tông', 'Cung', 'Điện', 'Đạo Viện', 'Thiên Đình', 'Học Cung'];
function pushEvent(world, events, event) { world.chronicle.push(event); events.push(event); if (world.chronicle.length > 320)
    world.chronicle.splice(0, world.chronicle.length - 320); }
function emergentDaoPrinciple(world, seed) {
    const weights = [['Thiên Luật Đạo', 'Trật tự trở thành lực lượng có thể tu luyện', world.laws.order], ['Tự Tại Đạo', 'Tự do ý chí chống lại định luật cứng', world.laws.freedom], ['Tinh Nguyên Đạo', 'Năng lượng và vật chất đồng nguyên', world.laws.energy], ['Luân Hồi Đạo', 'Sinh diệt được xem như một vòng chuyển hóa', world.laws.cycle]];
    const sorted = [...weights].sort((a, b) => b[2] - a[2]);
    const pick = sorted[Math.floor(unitFrom(seed) * Math.min(3, sorted.length))] ?? sorted[0];
    return { name: pick[0], principle: pick[1] };
}
function maybeCreateEmergentDao(world, events, seed) {
    if (world.civilizationLevel < 46)
        return undefined;
    const targetCount = Math.min(8, 1 + Math.floor((world.civilizationLevel - 46) / 9) + Math.floor(world.ageYears / 300000));
    if (Object.keys(world.emergentDaos).length >= targetCount)
        return undefined;
    if (unitFrom(seed ^ 0x3c6ef372) > 0.72)
        return undefined;
    const basis = emergentDaoPrinciple(world, seed);
    const id = `${world.id}.dao.${world.daoSerial++}`;
    const suffix = world.daoSerial > 1 ? ` · Biến ${world.daoSerial}` : '';
    const dao = { id, name: `${basis.name}${suffix}`, principle: basis.principle, maturity: 8 + unitFrom(seed ^ 0x91e10da5) * 18, bornAtWorldAge: world.ageYears };
    world.emergentDaos[id] = dao;
    pushEvent(world, events, { worldAgeYears: world.ageYears, type: 'dao', significance: 70, message: `Chúng sinh ${world.name} tự diễn hóa ${dao.name}: ${dao.principle}. Đây không phải Đạo do Sáng Thế Chủ trực tiếp truyền xuống.` });
    return dao;
}
function maybeCreateSect(world, events, seed) {
    if (world.civilizationLevel < 42)
        return undefined;
    const targetCount = Math.min(12, 1 + Math.floor((world.civilizationLevel - 42) / 7));
    if (Object.keys(world.sects).length >= targetCount || unitFrom(seed ^ 0xa54ff53a) > 0.68)
        return undefined;
    const id = `${world.id}.sect.${world.sectSerial++}`;
    const name = `${sectPrefixes[Math.floor(unitFrom(seed) * sectPrefixes.length)]} ${sectSuffixes[Math.floor(unitFrom(seed ^ 0x510e527f) * sectSuffixes.length)]}`;
    const daos = Object.keys(world.emergentDaos);
    const doctrineDaoId = daos.length ? daos[Math.floor(unitFrom(seed ^ 0x1f83d9ab) * daos.length)] : undefined;
    const sect = { id, name, doctrineDaoId, influence: 12 + unitFrom(seed ^ 0x5be0cd19) * 28, membersScale: Math.max(1, world.populationScale * 0.000001 * (0.2 + unitFrom(seed ^ 0xcbbb9d5d))), foundedAtWorldAge: world.ageYears, independent: world.autonomy > 55 };
    world.sects[id] = sect;
    pushEvent(world, events, { worldAgeYears: world.ageYears, type: 'sect', significance: 58, message: `${name} được chúng sinh tự lập trong ${world.name}${doctrineDaoId ? `, lấy ${world.emergentDaos[doctrineDaoId]?.name ?? 'một Đạo mới'} làm truyền thừa` : ''}.` });
    return sect;
}
function maybeCreateNotable(world, events, seed, policy) {
    if (world.civilizationLevel < 26)
        return undefined;
    const active = Object.values(world.notables).filter(n => n.status === 'active').length;
    const target = Math.min(18, 2 + Math.floor(world.civilizationLevel / 8));
    if (active >= target || unitFrom(seed ^ 0x6a09e667) > 0.62)
        return undefined;
    const id = `${world.id}.notable.${world.notableSerial++}`;
    const name = `${notableSurnames[Math.floor(unitFrom(seed ^ 0xbb67ae85) * notableSurnames.length)]} ${notableNames[Math.floor(unitFrom(seed ^ 0x3c6ef372) * notableNames.length)]}`;
    const aptitude = clamp100(35 + world.lifePotential * 0.35 + unitFrom(seed ^ 0xa54ff53a) * 35);
    const insight = clamp100(12 + world.civilizationLevel * 0.45 + unitFrom(seed ^ 0x510e527f) * 26);
    let stance = 'independent';
    const rebellionBias = world.rebellionPressure + world.laws.freedom * 0.3 - world.creatorRelation * 0.25 + (policy === 'intervene' ? 18 : 0);
    if (rebellionBias > 42 && unitFrom(seed ^ 0x9b05688c) > 0.44)
        stance = 'rebellious';
    else if (world.creatorRelation > 70 && unitFrom(seed ^ 0x1f83d9ab) > 0.42)
        stance = 'reverent';
    const sects = Object.keys(world.sects);
    const daos = Object.keys(world.emergentDaos);
    const person = { id, name, bornAtWorldAge: world.ageYears, aptitude, insight, power: Math.max(1, world.civilizationLevel * 0.4 + aptitude * 0.25), stance, status: 'active', sectId: sects.length ? sects[Math.floor(unitFrom(seed ^ 0x5be0cd19) * sects.length)] : undefined, daoId: daos.length ? daos[Math.floor(unitFrom(seed ^ 0xcbbb9d5d) * daos.length)] : undefined };
    world.notables[id] = person;
    pushEvent(world, events, { worldAgeYears: world.ageYears, type: 'notable', significance: 48 + Math.round(aptitude * 0.25), message: `${name} xuất thế trong ${world.name}; tư chất ${aptitude.toFixed(0)}, lập trường với Sáng Thế Chủ: ${stance === 'reverent' ? 'kính thuận' : stance === 'rebellious' ? 'nghịch ý' : 'độc lập'}.` });
    return person;
}
function evolveInternalActors(world, events, years, policy, seed) {
    const scale = Math.min(40, Math.log10(Math.max(10, years + 10)) * 5);
    const rebelliousBefore = Object.values(world.notables).some(n => n.status === 'active' && n.stance === 'rebellious');
    if (world.rebellionPressure >= 72 && rebelliousBefore && unitFrom(seed ^ 0x428a2f98) < Math.min(0.6, years / 80000)) {
        world.stability = clamp100(world.stability - (8 + scale * 0.25));
        world.creatorRelation = clamp100(world.creatorRelation - 12);
        world.rebellionPressure *= 0.48;
        pushEvent(world, events, { worldAgeYears: world.ageYears, type: 'rebellion', significance: 112, message: `Một liên minh thiên tài và tông môn trong ${world.name} dựng cờ Nghịch Thiên, phản đối việc Sáng Thế Chủ can thiệp quá sâu vào vận mệnh chúng sinh.` });
    }
    for (const dao of Object.values(world.emergentDaos))
        dao.maturity = clamp100(dao.maturity + years * 0.00008 * (0.6 + world.civilizationLevel / 120));
    for (const sect of Object.values(world.sects)) {
        sect.influence = clamp100(sect.influence + years * 0.00005 * (0.5 + world.stability / 120));
        sect.membersScale = Math.min(1e15, sect.membersScale * Math.exp(Math.min(2, years * 0.000006)));
    }
    for (const person of Object.values(world.notables).filter(n => n.status === 'active')) {
        person.insight = clamp100(person.insight + years * 0.00009 * (0.5 + person.aptitude / 100));
        person.power = clamp100(person.power + years * 0.00008 * (0.5 + person.insight / 100));
        if (person.stance === 'rebellious')
            world.rebellionPressure = clamp100(world.rebellionPressure + years * 0.000025 * (0.5 + person.power / 100));
        if (world.civilizationStage === 'transcendent' && person.power >= 72 && person.insight >= 78) {
            const chance = Math.min(0.55, years / 120000) * (0.25 + person.aptitude / 130);
            if (unitFrom(seed ^ hashText(person.id)) < chance) {
                person.status = 'transcended';
                person.transcendedAtWorldAge = world.ageYears;
                world.transcendedCount += 1;
                pushEvent(world, events, { worldAgeYears: world.ageYears, type: 'ascension', significance: 130, message: `${person.name} tự phá giới hạn của ${world.name} và Siêu Thoát khỏi thế giới do ngươi sáng tạo. Con đường này do chính chúng sinh hoàn thành.` });
            }
        }
    }
}
export function evolveGenesisWorld(world, years, policy, seedRoll) {
    if (world.extinct)
        throw new Error('This created world is extinct');
    const safeYears = Math.max(1, Math.min(1_000_000, years));
    const stageBefore = world.civilizationStage;
    const events = [];
    world.ageYears += safeYears;
    const intervention = policy === 'intervene' ? 1 : policy === 'nurture' ? 0.45 : 0;
    const observation = policy === 'observe' ? 1 : 0.35;
    world.autonomy = clamp100(world.autonomy + safeYears * (0.0008 * observation - 0.0012 * intervention));
    world.creatorRelation = clamp100(world.creatorRelation + safeYears * (policy === 'nurture' ? 0.00035 : policy === 'observe' ? 0.00012 : -0.00048));
    world.rebellionPressure = clamp100(world.rebellionPressure + safeYears * (policy === 'intervene' ? 0.00052 : policy === 'observe' ? -0.00018 : -0.00006));
    world.stability = clamp100(world.stability + safeYears * (0.0005 + 0.0004 * intervention) - world.calamityPressure * 0.00005 * safeYears);
    const balance = 1 - Math.abs(world.laws.order - world.laws.freedom) / 140;
    const growth = safeYears * 0.00055 * (0.45 + world.lifePotential / 140) * (0.45 + world.stability / 160) * Math.max(0.2, balance) * (policy === 'nurture' ? 1.12 : policy === 'intervene' ? 1.05 : 0.96);
    world.civilizationLevel = clamp100(world.civilizationLevel + growth);
    world.populationScale = Math.min(1e18, world.populationScale * Math.exp(Math.min(16, safeYears * 0.000025 * (0.3 + world.lifePotential / 100))) + safeYears * 0.0001);
    world.calamityPressure = Math.max(0, world.calamityPressure + safeYears * (0.00045 + world.civilizationLevel * 0.000007) - (policy === 'intervene' ? safeYears * 0.0002 : 0));
    const insightGained = safeYears * 0.00022 * (0.35 + world.civilizationLevel / 90) * (0.45 + world.autonomy / 120);
    world.insightStored += insightGained;
    const stageAfter = civilizationStageFor(world.civilizationLevel);
    if (stageAfter !== stageBefore) {
        world.civilizationStage = stageAfter;
        pushEvent(world, events, { worldAgeYears: world.ageYears, type: 'civilization', significance: 50 + Math.round(world.civilizationLevel), message: `${world.name} bước vào giai đoạn ${stageNames[stageAfter]}.` });
    }
    const seed = (Math.floor(seedRoll * 1_000_000) ^ hashText(world.id) ^ Math.floor(world.ageYears)) >>> 0;
    maybeCreateEmergentDao(world, events, seed ^ 0x243f6a88);
    maybeCreateSect(world, events, seed ^ 0x85a308d3);
    maybeCreateNotable(world, events, seed ^ 0x13198a2e, policy);
    evolveInternalActors(world, events, safeYears, policy, seed ^ 0x03707344);
    let calamityTriggered = false;
    const calamityChance = Math.min(0.42, world.calamityPressure / 260) * Math.min(1, safeYears / 2000);
    if (seedRoll < calamityChance) {
        calamityTriggered = true;
        const severity = 6 + world.calamityPressure * 0.16;
        world.stability = clamp100(world.stability - severity);
        world.populationScale *= Math.max(0.05, 1 - severity / 110);
        world.calamityPressure *= 0.42;
        pushEvent(world, events, { worldAgeYears: world.ageYears, type: 'calamity', significance: Math.round(45 + severity), message: `${world.name} trải qua đại kiếp văn minh; sinh linh buộc phải tự thích nghi với luật thế giới.` });
        if (world.stability < 4 && world.populationScale < 0.02) {
            world.extinct = true;
            pushEvent(world, events, { worldAgeYears: world.ageYears, type: 'calamity', significance: 150, message: `${world.name} lâm vào tịch diệt; Kỷ Nguyên sinh linh chấm dứt.` });
        }
    }
    if (world.ageYears / world.eras >= 100_000)
        world.eras += 1;
    return { years: safeYears, stageBefore, stageAfter: world.civilizationStage, insightGained, calamityTriggered, extinct: world.extinct, chronicleEvents: events };
}
export function harvestGenesisInsight(world, requested) { const take = Math.max(0, Math.min(world.insightStored, requested)); world.insightStored -= take; return take; }
function deterministicUnit(seed) { let x = seed | 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 1_000_000) / 1_000_000; }
export function syncGenesisWorlds(state, targetWorldYear, seed, timeDilation = 120) {
    const elapsed = Math.max(0, targetWorldYear - state.simulatedUntilWorldYear);
    if (elapsed <= 1e-9)
        return [];
    const emitted = [];
    let index = 0;
    for (const world of Object.values(state.worlds)) {
        if (world.extinct) {
            index++;
            continue;
        }
        const internalYears = Math.max(1, elapsed * Math.max(1, timeDilation));
        const roll = deterministicUnit(seed ^ ((index + 1) * 0x9e3779b1) ^ Math.floor(targetWorldYear * 1000));
        const result = evolveGenesisWorld(world, internalYears, 'observe', roll);
        emitted.push(...result.chronicleEvents);
        index++;
    }
    state.simulatedUntilWorldYear = targetWorldYear;
    return emitted;
}
//# sourceMappingURL=genesis-world.js.map