/* ========================================
   AntigleForge - Command Generator
   Bedrock & Java Edition Commands
   ======================================== */

const CommandGenerator = (() => {
  let currentEdition = 'bedrock';

  // All Commands Database
  const COMMANDS = {
    // ========== BASIC COMMANDS ==========
    help: {
      name: '/help',
      category: 'basic',
      description: 'List available commands or get help for a specific command.',
      syntax: '/help [command]',
      permissions: 'All players',
      requiresCheats: false,
      options: [
        { id: 'command', type: 'text', label: 'Command Name (optional)', placeholder: 'e.g., give', required: false }
      ],
      build: (opts) => `/help ${opts.command || ''}`.trim()
    },
    me: {
      name: '/me',
      category: 'basic',
      description: 'Display an action message about yourself.',
      syntax: '/me <message>',
      permissions: 'All players',
      requiresCheats: false,
      options: [
        { id: 'message', type: 'text', label: 'Message', placeholder: 'is flying!', required: true }
      ],
      build: (opts) => `/me ${opts.message}`
    },
    say: {
      name: '/say',
      category: 'communication',
      description: 'Send a message in chat to all players.',
      syntax: '/say <message>',
      permissions: 'All players',
      requiresCheats: false,
      options: [
        { id: 'message', type: 'text', label: 'Message', placeholder: 'Hello world!', required: true }
      ],
      build: (opts) => `/say ${opts.message}`
    },
    tell: {
      name: '/tell',
      category: 'communication',
      description: 'Send a private message to one or more players.',
      syntax: '/tell <target> <message>',
      permissions: 'All players',
      requiresCheats: false,
      options: [
        { id: 'target', type: 'selector', label: 'Target Player', required: true },
        { id: 'message', type: 'text', label: 'Message', placeholder: 'Hello!', required: true }
      ],
      build: (opts) => `/tell ${opts.target} ${opts.message}`
    },
    msg: {
      name: '/msg',
      category: 'communication',
      description: 'Alias for /tell. Send a private message.',
      syntax: '/msg <target> <message>',
      permissions: 'All players',
      requiresCheats: false,
      options: [
        { id: 'target', type: 'selector', label: 'Target Player', required: true },
        { id: 'message', type: 'text', label: 'Message', placeholder: 'Hello!', required: true }
      ],
      build: (opts) => `/msg ${opts.target} ${opts.message}`
    },
    w: {
      name: '/w',
      category: 'communication',
      description: 'Alias for /tell. Send a private message.',
      syntax: '/w <target> <message>',
      permissions: 'All players',
      requiresCheats: false,
      options: [
        { id: 'target', type: 'selector', label: 'Target Player', required: true },
        { id: 'message', type: 'text', label: 'Message', placeholder: 'Hello!', required: true }
      ],
      build: (opts) => `/w ${opts.target} ${opts.message}`
    },
    tellraw: {
      name: '/tellraw',
      category: 'communication',
      description: 'Send a JSON message to players.',
      syntax: '/tellraw <target> <message: rawtext>',
      permissions: 'Operator',
      requiresCheats: false,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'message', type: 'text', label: 'JSON Message', placeholder: '{"rawtext":[{"text":"Hello!"}]}', required: true }
      ],
      build: (opts) => `/tellraw ${opts.target} ${opts.message}`
    },

    // ========== PLAYER & GAME MODE ==========
    gamemode: {
      name: '/gamemode',
      category: 'player',
      description: 'Set a player\'s game mode.',
      syntax: '/gamemode <mode> [player]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'mode', type: 'select', label: 'Game Mode', values: ['survival', 'creative', 'adventure', 'spectator', 's', 'c', 'a'], required: true },
        { id: 'target', type: 'selector', label: 'Target Player', placeholder: '@s', required: false }
      ],
      build: (opts) => `/gamemode ${opts.mode} ${opts.target || '@s'}`.trim()
    },
    give: {
      name: '/give',
      category: 'items',
      description: 'Give items to a player.',
      syntax: '/give <target> <item> [amount]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target Player', required: true },
        { id: 'item', type: 'item', label: 'Item ID', placeholder: 'diamond', required: true },
        { id: 'amount', type: 'number', label: 'Amount', placeholder: '1', min: 1, max: 64000, required: false }
      ],
      build: (opts) => `/give ${opts.target} ${opts.item}${opts.amount ? ' ' + opts.amount : ''}`
    },
    clear: {
      name: '/clear',
      category: 'items',
      description: 'Clear items from player inventory.',
      syntax: '/clear [target] [item] [data] [maxCount]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target Player', placeholder: '@s', required: false },
        { id: 'item', type: 'item', label: 'Item (optional)', placeholder: 'Leave empty to clear all', required: false },
        { id: 'amount', type: 'number', label: 'Max Count', placeholder: 'All', required: false }
      ],
      build: (opts) => {
        let cmd = `/clear ${opts.target || '@s'}`;
        if (opts.item) cmd += ` ${opts.item}`;
        if (opts.amount) cmd += ` ${opts.amount}`;
        return cmd;
      }
    },
    xp: {
      name: '/xp',
      category: 'player',
      description: 'Add or remove player experience.',
      syntax: '/xp <amount> [player]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'amount', type: 'text', label: 'Amount (use L for levels)', placeholder: '100 or 10L', required: true },
        { id: 'target', type: 'selector', label: 'Target Player', placeholder: '@s', required: false }
      ],
      build: (opts) => `/xp ${opts.amount} ${opts.target || '@s'}`.trim()
    },
    enchant: {
      name: '/enchant',
      category: 'player',
      description: 'Add an enchantment to player\'s held item.',
      syntax: '/enchant <target> <enchantment> [level]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target Player', required: true },
        { id: 'enchantment', type: 'select', label: 'Enchantment', values: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'efficiency', 'silk_touch', 'unbreaking', 'fortune', 'power', 'punch', 'flame', 'infinity', 'luck_of_the_sea', 'lure', 'depth_strider', 'frost_walker', 'loyalty', 'channeling', 'impaling', 'RIPTIDE', 'aqua_affinity', 'respiration', 'thorns', 'binding', 'vanishing', 'protection', 'fire_protection', 'feather_falling', 'blast_protection', 'projectile_protection', 'swift_sneak', 'soul_speed'], required: true },
        { id: 'level', type: 'number', label: 'Level', placeholder: '1', min: 1, max: 255, required: false }
      ],
      build: (opts) => `/enchant ${opts.target} ${opts.enchantment}${opts.level ? ' ' + opts.level : ''}`
    },
    effect: {
      name: '/effect',
      category: 'combat',
      description: 'Add or clear status effects.',
      syntax: '/effect <target> <effect> [seconds] [level] [hideParticles]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['give', 'clear'], required: true },
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'effect', type: 'select', label: 'Effect', values: ['speed', 'slowness', 'haste', 'mining_fatigue', 'strength', 'instant_health', 'instant_damage', 'jump_boost', 'nausea', 'regeneration', 'resistance', 'fire_resistance', 'water_breathing', 'invisibility', 'blindness', 'night_vision', 'hunger', 'weakness', 'poison', 'wither', 'health_boost', 'absorption', 'saturation', 'glowing', 'levitation', 'luck', 'unluck', 'slow_falling', 'conduit_power', 'dolphins_grace', 'bad_omen', 'hero_of_the_village', 'darkness', 'trial_ominous'], required: true, showIf: (opts) => opts.action === 'give' },
        { id: 'seconds', type: 'number', label: 'Duration (seconds)', placeholder: '30', min: 1, max: 1000000, required: false, showIf: (opts) => opts.action === 'give' },
        { id: 'level', type: 'number', label: 'Amplifier Level', placeholder: '0', min: 0, max: 255, required: false, showIf: (opts) => opts.action === 'give' },
        { id: 'hideParticles', type: 'select', label: 'Hide Particles', values: ['true', 'false'], required: false, showIf: (opts) => opts.action === 'give' }
      ],
      build: (opts) => {
        if (opts.action === 'clear') return `/effect clear ${opts.target}`;
        let cmd = `/effect ${opts.target} ${opts.effect}`;
        if (opts.seconds) cmd += ` ${opts.seconds}`;
        if (opts.level) cmd += ` ${opts.level}`;
        if (opts.hideParticles === 'true') cmd += ` true`;
        return cmd;
      }
    },
    difficulty: {
      name: '/difficulty',
      category: 'world',
      description: 'Set the world difficulty.',
      syntax: '/difficulty <peaceful|easy|normal|hard>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'level', type: 'select', label: 'Difficulty', values: ['peaceful', 'easy', 'normal', 'hard'], required: true }
      ],
      build: (opts) => `/difficulty ${opts.level}`
    },

    // ========== TELEPORTATION ==========
    tp: {
      name: '/tp',
      category: 'teleport',
      description: 'Teleport entities to coordinates or another entity.',
      syntax: '/tp <target> <destination> OR /tp <target> <x> <y> <z>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'mode', type: 'select', label: 'Teleport To', values: ['coordinates', 'entity'], required: true },
        { id: 'x', type: 'text', label: 'X', placeholder: '~ or 100', required: true, showIf: (opts) => opts.mode === 'coordinates' },
        { id: 'y', type: 'text', label: 'Y', placeholder: '~ or 64', required: true, showIf: (opts) => opts.mode === 'coordinates' },
        { id: 'z', type: 'text', label: 'Z', placeholder: '~ or 200', required: true, showIf: (opts) => opts.mode === 'coordinates' },
        { id: 'destination', type: 'selector', label: 'Destination Entity', required: true, showIf: (opts) => opts.mode === 'entity' }
      ],
      build: (opts) => {
        if (opts.mode === 'entity') return `/tp ${opts.target} ${opts.destination}`;
        return `/tp ${opts.target} ${opts.x} ${opts.y} ${opts.z}`;
      }
    },
    teleport: {
      name: '/teleport',
      category: 'teleport',
      description: 'Alias for /tp. Teleport entities.',
      syntax: '/teleport <target> <x> <y> <z>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'x', type: 'text', label: 'X', placeholder: '~', required: true },
        { id: 'y', type: 'text', label: 'Y', placeholder: '~', required: true },
        { id: 'z', type: 'text', label: 'Z', placeholder: '~', required: true }
      ],
      build: (opts) => `/teleport ${opts.target} ${opts.x} ${opts.y} ${opts.z}`
    },
    spawnpoint: {
      name: '/spawnpoint',
      category: 'teleport',
      description: 'Set a player\'s personal spawn point.',
      syntax: '/spawnpoint [target] [x] [y] [z]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target Player', placeholder: '@s', required: false },
        { id: 'x', type: 'text', label: 'X', placeholder: '~', required: false },
        { id: 'y', type: 'text', label: 'Y', placeholder: '~', required: false },
        { id: 'z', type: 'text', label: 'Z', placeholder: '~', required: false }
      ],
      build: (opts) => {
        let cmd = `/spawnpoint ${opts.target || '@s'}`;
        if (opts.x) cmd += ` ${opts.x} ${opts.y || '~'} ${opts.z || '~'}`;
        return cmd;
      }
    },
    setworldspawn: {
      name: '/setworldspawn',
      category: 'teleport',
      description: 'Set the world\'s global spawn point.',
      syntax: '/setworldspawn [x] [y] [z]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'x', type: 'text', label: 'X', placeholder: '~', required: false },
        { id: 'y', type: 'text', label: 'Y', placeholder: '~', required: false },
        { id: 'z', type: 'text', label: 'Z', placeholder: '~', required: false }
      ],
      build: (opts) => {
        if (!opts.x) return '/setworldspawn';
        return `/setworldspawn ${opts.x} ${opts.y || '~'} ${opts.z || '~'}`;
      }
    },
    spreadplayers: {
      name: '/spreadplayers',
      category: 'teleport',
      description: 'Teleport entities to random locations.',
      syntax: '/spreadplayers <x> <z> <spreadDistance> <maxRange> <target>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'x', type: 'text', label: 'Center X', placeholder: '0', required: true },
        { id: 'z', type: 'text', label: 'Center Z', placeholder: '0', required: true },
        { id: 'minDist', type: 'number', label: 'Min Distance', placeholder: '0', required: true },
        { id: 'maxDist', type: 'number', label: 'Max Distance', placeholder: '100', required: true },
        { id: 'target', type: 'selector', label: 'Target', required: true }
      ],
      build: (opts) => `/spreadplayers ${opts.x} ${opts.z} ${opts.minDist} ${opts.maxDist} ${opts.target}`
    },
    clearspawnpoint: {
      name: '/clearspawnpoint',
      category: 'teleport',
      description: 'Remove a player\'s spawn point.',
      syntax: '/clearspawnpoint [target]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target Player', placeholder: '@s', required: false }
      ],
      build: (opts) => `/clearspawnpoint ${opts.target || '@s'}`.trim()
    },

    // ========== WORLD & ENVIRONMENT ==========
    time: {
      name: '/time',
      category: 'world',
      description: 'Change or query the world time.',
      syntax: '/time <set|add|query> <value>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['set', 'add', 'query'], required: true },
        { id: 'value', type: 'select', label: 'Time', values: ['0', 'day', 'noon', 'sunrise', 'sunset', 'night', 'midnight', '1000', '6000', '12000', '13000', '18000'], required: true, showIf: (opts) => opts.action !== 'query' },
        { id: 'queryType', type: 'select', label: 'Query Type', values: ['daytime', 'gametime', 'day'], required: true, showIf: (opts) => opts.action === 'query' }
      ],
      build: (opts) => {
        if (opts.action === 'query') return `/time query ${opts.queryType}`;
        return `/time ${opts.action} ${opts.value}`;
      }
    },
    weather: {
      name: '/weather',
      category: 'world',
      description: 'Set the weather.',
      syntax: '/weather <type> [duration]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'type', type: 'select', label: 'Weather', values: ['clear', 'rain', 'thunder'], required: true },
        { id: 'duration', type: 'number', label: 'Duration (seconds)', placeholder: 'Infinite', required: false }
      ],
      build: (opts) => `/weather ${opts.type}${opts.duration ? ' ' + opts.duration : ''}`
    },
    toggledownfall: {
      name: '/toggledownfall',
      category: 'world',
      description: 'Toggle between rain and clear weather.',
      syntax: '/toggledownfall',
      permissions: 'Operator',
      requiresCheats: true,
      options: [],
      build: () => '/toggledownfall'
    },
    daylock: {
      name: '/daylock',
      category: 'world',
      description: 'Lock or unlock the day-night cycle (Bedrock only).',
      syntax: '/daylock <true|false>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'lock', type: 'select', label: 'Lock', values: ['true', 'false'], required: true }
      ],
      build: (opts) => `/daylock ${opts.lock}`
    },
    alwaysday: {
      name: '/alwaysday',
      category: 'world',
      description: 'Alias for /daylock. Lock/unlock day cycle.',
      syntax: '/alwaysday <true|false>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'lock', type: 'select', label: 'Lock', values: ['true', 'false'], required: true }
      ],
      build: (opts) => `/alwaysday ${opts.lock}`
    },
    locate: {
      name: '/locate',
      category: 'world',
      description: 'Find the nearest structure or biome.',
      syntax: '/locate <structure|biome> <type>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'type', type: 'select', label: 'Search Type', values: ['structure', 'biome'], required: true },
        { id: 'target', type: 'select', label: 'Structure/Biome', values: ['village', 'monument', 'stronghold', 'fortress', 'endcity', 'mansion', 'buried_treasure', 'mineshaft', 'shipwreck', 'ocean_ruin', 'ruined_portal', 'ancient_city', 'trail_ruins', 'pillager_outpost', 'mansion', 'jungle_temple', 'desert_temple', 'igloo', 'witch_hut', 'ocean_feature', 'nether_feature', 'overworld'], required: true }
      ],
      build: (opts) => `/locate ${opts.type} ${opts.target}`
    },
    fill: {
      name: '/fill',
      category: 'building',
      description: 'Fill a region with a specific block.',
      syntax: '/fill <from> <to> <tileName> [dataValue] [oldBlockHandling]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'x1', type: 'text', label: 'From X', placeholder: '~', required: true },
        { id: 'y1', type: 'text', label: 'From Y', placeholder: '~', required: true },
        { id: 'z1', type: 'text', label: 'From Z', placeholder: '~', required: true },
        { id: 'x2', type: 'text', label: 'To X', placeholder: '~', required: true },
        { id: 'y2', type: 'text', label: 'To Y', placeholder: '~', required: true },
        { id: 'z2', type: 'text', label: 'To Z', placeholder: '~', required: true },
        { id: 'block', type: 'block', label: 'Block', placeholder: 'stone', required: true },
        { id: 'oldBlockHandling', type: 'select', label: 'Replace Mode', values: ['replace', 'destroy', 'keep', 'hollow', 'outline'], required: false }
      ],
      build: (opts) => `/fill ${opts.x1} ${opts.y1} ${opts.z1} ${opts.x2} ${opts.y2} ${opts.z2} ${opts.block}${opts.oldBlockHandling ? ' ' + opts.oldBlockHandling : ''}`
    },
    setblock: {
      name: '/setblock',
      category: 'building',
      description: 'Place a single block at a position.',
      syntax: '/setblock <pos> <tileName> [dataValue] [replace|destroy|keep]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'x', type: 'text', label: 'X', placeholder: '~', required: true },
        { id: 'y', type: 'text', label: 'Y', placeholder: '~', required: true },
        { id: 'z', type: 'text', label: 'Z', placeholder: '~', required: true },
        { id: 'block', type: 'block', label: 'Block', placeholder: 'stone', required: true },
        { id: 'mode', type: 'select', label: 'Replace Mode', values: ['replace', 'destroy', 'keep'], required: false }
      ],
      build: (opts) => `/setblock ${opts.x} ${opts.y} ${opts.z} ${opts.block}${opts.mode ? ' ' + opts.mode : ''}`
    },
    clone: {
      name: '/clone',
      category: 'building',
      description: 'Copy blocks from one region to another.',
      syntax: '/clone <begin> <end> <destination> [replace|masked|filtered]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'x1', type: 'text', label: 'Begin X', required: true },
        { id: 'y1', type: 'text', label: 'Begin Y', required: true },
        { id: 'z1', type: 'text', label: 'Begin Z', required: true },
        { id: 'x2', type: 'text', label: 'End X', required: true },
        { id: 'y2', type: 'text', label: 'End Y', required: true },
        { id: 'z2', type: 'text', label: 'End Z', required: true },
        { id: 'dx', type: 'text', label: 'Dest X', required: true },
        { id: 'dy', type: 'text', label: 'Dest Y', required: true },
        { id: 'dz', type: 'text', label: 'Dest Z', required: true },
        { id: 'mode', type: 'select', label: 'Mode', values: ['replace', 'masked', 'filtered'], required: false }
      ],
      build: (opts) => `/clone ${opts.x1} ${opts.y1} ${opts.z1} ${opts.x2} ${opts.y2} ${opts.z2} ${opts.dx} ${opts.dy} ${opts.dz}${opts.mode ? ' ' + opts.mode : ''}`
    },
    structure: {
      name: '/structure',
      category: 'building',
      description: 'Save or load structures (Bedrock only).',
      syntax: '/structure <save|load|delete> <name> <pos>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['save', 'load', 'delete'], required: true },
        { id: 'name', type: 'text', label: 'Structure Name', placeholder: 'my_structure', required: true },
        { id: 'x', type: 'text', label: 'X', placeholder: '~', required: true, showIf: (opts) => opts.action !== 'delete' },
        { id: 'y', type: 'text', label: 'Y', placeholder: '~', required: true, showIf: (opts) => opts.action !== 'delete' },
        { id: 'z', type: 'text', label: 'Z', placeholder: '~', required: true, showIf: (opts) => opts.action !== 'delete' }
      ],
      build: (opts) => {
        if (opts.action === 'delete') return `/structure delete ${opts.name}`;
        return `/structure ${opts.action} ${opts.name} ${opts.x} ${opts.y} ${opts.z}`;
      }
    },

    // ========== ENTITIES & MOBS ==========
    summon: {
      name: '/summon',
      category: 'entities',
      description: 'Summon an entity.',
      syntax: '/summon <entity> [pos] [spawnEvent] [nameTag]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'entity', type: 'entity', label: 'Entity', placeholder: 'zombie', required: true },
        { id: 'x', type: 'text', label: 'X', placeholder: '~', required: false },
        { id: 'y', type: 'text', label: 'Y', placeholder: '~', required: false },
        { id: 'z', type: 'text', label: 'Z', placeholder: '~', required: false },
        { id: 'nameTag', type: 'text', label: 'Name Tag', placeholder: 'Optional', required: false }
      ],
      build: (opts) => {
        let cmd = `/summon ${opts.entity}`;
        if (opts.x) cmd += ` ${opts.x} ${opts.y || '~'} ${opts.z || '~'}`;
        if (opts.nameTag) cmd += ` ${opts.nameTag}`;
        return cmd;
      }
    },
    kill: {
      name: '/kill',
      category: 'entities',
      description: 'Kill entities (deal infinite damage).',
      syntax: '/kill [target]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', placeholder: '@s', required: false }
      ],
      build: (opts) => `/kill ${opts.target || '@s'}`.trim()
    },
    tag: {
      name: '/tag',
      category: 'entities',
      description: 'Manage tags stored in entities.',
      syntax: '/tag <target> <add|remove|list> [tagName]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'action', type: 'select', label: 'Action', values: ['add', 'remove', 'list'], required: true },
        { id: 'tag', type: 'text', label: 'Tag Name', placeholder: 'myTag', required: true, showIf: (opts) => opts.action !== 'list' }
      ],
      build: (opts) => {
        if (opts.action === 'list') return `/tag ${opts.target} list`;
        return `/tag ${opts.target} ${opts.action} ${opts.tag}`;
      }
    },
    damage: {
      name: '/damage',
      category: 'combat',
      description: 'Apply damage to entities.',
      syntax: '/damage <target> <amount> <cause> [entity]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'amount', type: 'number', label: 'Damage Amount', placeholder: '5', min: 0, max: 1000, required: true },
        { id: 'cause', type: 'select', label: 'Damage Cause', values: ['anvil', 'attack', 'block_explosion', 'charging', 'contact', 'drowning', 'entity_attack', 'entity_explosion', 'fall', 'falling_block', 'fire', 'fire_tick', 'fireworks', 'fly_into_wall', 'freezing', 'lava', 'lightning', 'magic', 'mob_attack', 'none', 'override', 'piston', 'projectile', 'sonic_boom', 'stalactite', 'stalagmite', 'starve', 'suffocation', 'temperature', 'thorns', 'void', 'wither'], required: true },
        { id: 'causeEntity', type: 'selector', label: 'Cause Entity (optional)', required: false }
      ],
      build: (opts) => `/damage ${opts.target} ${opts.amount} ${opts.cause}${opts.causeEntity ? ' ' + opts.causeEntity : ''}`
    },
    event: {
      name: '/event',
      category: 'entities',
      description: 'Trigger an entity event (Bedrock only).',
      syntax: '/event entity <target> <eventName>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target Entity', required: true },
        { id: 'event', type: 'text', label: 'Event Name', placeholder: 'minecraft:start_explosion', required: true }
      ],
      build: (opts) => `/event entity ${opts.target} ${opts.event}`
    },
    playanimation: {
      name: '/playanimation',
      category: 'entities',
      description: 'Play an animation on entities (Bedrock only).',
      syntax: '/playanimation <target> <animation> [nextAnimation] [blendOutTime]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'animation', type: 'text', label: 'Animation', placeholder: 'animation.player.sleeping', required: true },
        { id: 'nextAnim', type: 'text', label: 'Next Animation (optional)', required: false },
        { id: 'blendTime', type: 'text', label: 'Blend Out Time', placeholder: '0', required: false }
      ],
      build: (opts) => {
        let cmd = `/playanimation ${opts.target} ${opts.animation}`;
        if (opts.nextAnim) cmd += ` ${opts.nextAnim}`;
        if (opts.blendTime) cmd += ` ${opts.blendTime}`;
        return cmd;
      }
    },
    ride: {
      name: '/ride',
      category: 'entities',
      description: 'Make entities ride other entities (Bedrock only).',
      syntax: '/ride <target> <start_riding|stop_riding|evict_riders|summon_rider|summon_ride> [ride]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'action', type: 'select', label: 'Action', values: ['start_riding', 'stop_riding', 'evict_riders', 'summon_rider', 'summon_ride'], required: true },
        { id: 'ride', type: 'selector', label: 'Ride Entity', required: true, showIf: (opts) => ['start_riding', 'summon_rider', 'summon_ride'].includes(opts.action) }
      ],
      build: (opts) => {
        if (opts.action === 'stop_riding' || opts.action === 'evict_riders') return `/ride ${opts.target} ${opts.action}`;
        return `/ride ${opts.target} ${opts.action} ${opts.ride}`;
      }
    },

    // ========== SERVER & ADMIN ==========
    op: {
      name: '/op',
      category: 'admin',
      description: 'Grant operator status to a player.',
      syntax: '/op <player>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'player', type: 'text', label: 'Player Name', placeholder: 'Steve', required: true }
      ],
      build: (opts) => `/op ${opts.player}`
    },
    deop: {
      name: '/deop',
      category: 'admin',
      description: 'Revoke operator status from a player.',
      syntax: '/deop <player>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'player', type: 'text', label: 'Player Name', placeholder: 'Steve', required: true }
      ],
      build: (opts) => `/deop ${opts.player}`
    },
    kick: {
      name: '/kick',
      category: 'admin',
      description: 'Kick a player from the server.',
      syntax: '/kick <player> [reason]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'player', type: 'text', label: 'Player Name', placeholder: 'Steve', required: true },
        { id: 'reason', type: 'text', label: 'Reason (optional)', placeholder: 'Cheating', required: false }
      ],
      build: (opts) => `/kick ${opts.player}${opts.reason ? ' ' + opts.reason : ''}`
    },
    allowlist: {
      name: '/allowlist',
      category: 'admin',
      description: 'Manage the server allowlist (Bedrock only).',
      syntax: '/allowlist <add|remove|list> [player]',
      permissions: 'Server Owner',
      requiresCheats: true,
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['add', 'remove', 'list'], required: true },
        { id: 'player', type: 'text', label: 'Player Name', required: true, showIf: (opts) => opts.action !== 'list' }
      ],
      build: (opts) => {
        if (opts.action === 'list') return '/allowlist list';
        return `/allowlist ${opts.action} ${opts.player}`;
      }
    },
    whitelist: {
      name: '/whitelist',
      category: 'admin',
      description: 'Manage the server whitelist.',
      syntax: '/whitelist <add|remove|list> [player]',
      permissions: 'Server Owner',
      requiresCheats: true,
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['add', 'remove', 'list'], required: true },
        { id: 'player', type: 'text', label: 'Player Name', required: true, showIf: (opts) => opts.action !== 'list' }
      ],
      build: (opts) => {
        if (opts.action === 'list') return '/whitelist list';
        return `/whitelist ${opts.action} ${opts.player}`;
      }
    },
    list: {
      name: '/list',
      category: 'admin',
      description: 'List online players.',
      syntax: '/list [uuids]',
      permissions: 'All players',
      requiresCheats: false,
      options: [
        { id: 'showUuids', type: 'select', label: 'Show UUIDs', values: ['false', 'true'], required: false }
      ],
      build: (opts) => opts.showUuids === 'true' ? '/list uuids' : '/list'
    },
    setmaxplayers: {
      name: '/setmaxplayers',
      category: 'admin',
      description: 'Set max players for this session (Bedrock only).',
      syntax: '/setmaxplayers <maxPlayers>',
      permissions: 'Server Owner',
      requiresCheats: true,
      options: [
        { id: 'max', type: 'number', label: 'Max Players', placeholder: '10', min: 1, max: 1000, required: true }
      ],
      build: (opts) => `/setmaxplayers ${opts.max}`
    },
    stop: {
      name: '/stop',
      category: 'admin',
      description: 'Stop the server.',
      syntax: '/stop',
      permissions: 'Server Owner',
      requiresCheats: true,
      options: [],
      build: () => '/stop'
    },
    transfer: {
      name: '/transfer',
      category: 'admin',
      description: 'Transfer a player to another server (Bedrock only).',
      syntax: '/transfer <target> <ip> [port]',
      permissions: 'Server Owner',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target Player', required: true },
        { id: 'ip', type: 'text', label: 'Server IP', placeholder: '192.168.1.1', required: true },
        { id: 'port', type: 'number', label: 'Port', placeholder: '19132', required: false }
      ],
      build: (opts) => `/transfer ${opts.target} ${opts.ip}${opts.port ? ' ' + opts.port : ''}`
    },
    reload: {
      name: '/reload',
      category: 'admin',
      description: 'Reload all function and script files.',
      syntax: '/reload',
      permissions: 'Server Owner',
      requiresCheats: true,
      options: [],
      build: () => '/reload'
    },
    save: {
      name: '/save',
      category: 'admin',
      description: 'Control server save (Bedrock only).',
      syntax: '/save <hold|query|resume>',
      permissions: 'Server Owner',
      requiresCheats: true,
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['hold', 'query', 'resume'], required: true }
      ],
      build: (opts) => `/save ${opts.action}`
    },

    // ========== ADVANCED & TECHNICAL ==========
    scoreboard: {
      name: '/scoreboard',
      category: 'advanced',
      description: 'Manage scoreboard objectives and player scores.',
      syntax: '/scoreboard <objectives|players> ...',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'part', type: 'select', label: 'Part', values: ['objectives', 'players'], required: true },
        { id: 'action', type: 'select', label: 'Action', values: ['add', 'remove', 'list', 'setdisplay', 'addscore', 'removescore', 'set', 'reset'], required: true },
        { id: 'name', type: 'text', label: 'Objective/Player', required: true },
        { id: 'type', type: 'select', label: 'Criteria', values: ['dummy', 'health', 'xp', 'level', 'trigger', 'deathCount', 'playerKillCount', 'custom', 'animalTame', 'aviateOneCm', 'climbOneCm', 'craftItem', 'damageDealt', 'damageTaken', 'deaths', 'fishCaught', 'flyOneCm', 'horseOneCm', 'itemsDropped', 'junkFished', 'leaveGame', 'mineBlock', 'noteBlockPlayed', 'noteBlockTuned', 'playOneMinute', 'playerKills', 'raidTriggered', 'raidWin', 'record', 'tradedWithVillager', 'treasureFished', 'walkOneCm'], required: false, showIf: (opts) => opts.part === 'objectives' && opts.action === 'add' },
        { id: 'score', type: 'text', label: 'Score Value', required: false, showIf: (opts) => opts.part === 'players' && ['addscore', 'removescore', 'set'].includes(opts.action) }
      ],
      build: (opts) => {
        if (opts.part === 'objectives') {
          if (opts.action === 'add') return `/scoreboard objectives add ${opts.name} ${opts.type || 'dummy'}`;
          if (opts.action === 'remove') return `/scoreboard objectives remove ${opts.name}`;
          if (opts.action === 'list') return '/scoreboard objectives list';
          if (opts.action === 'setdisplay') return `/scoreboard objectives setdisplay ${opts.name}`;
        }
        if (opts.part === 'players') {
          if (['addscore', 'removescore', 'set'].includes(opts.action)) return `/scoreboard players ${opts.action} ${opts.name} ${opts.score || ''}`;
          return `/scoreboard players ${opts.action} ${opts.name}`;
        }
        return '/scoreboard';
      }
    },
    execute: {
      name: '/execute',
      category: 'advanced',
      description: 'Execute commands on behalf of entities.',
      syntax: '/execute <target> <pos> <command>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'x', type: 'text', label: 'X', placeholder: '~', required: false },
        { id: 'y', type: 'text', label: 'Y', placeholder: '~', required: false },
        { id: 'z', type: 'text', label: 'Z', placeholder: '~', required: false },
        { id: 'command', type: 'text', label: 'Command', placeholder: 'say Hello!', required: true }
      ],
      build: (opts) => {
        if (opts.x) return `/execute ${opts.target} ${opts.x} ${opts.y || '~'} ${opts.z || '~'} ${opts.command}`;
        return `/execute ${opts.target} ~ ~ ~ ${opts.command}`;
      }
    },
    testfor: {
      name: '/testfor',
      category: 'advanced',
      description: 'Count entities matching conditions.',
      syntax: '/testfor <target> [dataValue]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true }
      ],
      build: (opts) => `/testfor ${opts.target}`
    },
    testforblock: {
      name: '/testforblock',
      category: 'advanced',
      description: 'Test if a block is at a position.',
      syntax: '/testforblock <pos> <tileName> [dataValue]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'x', type: 'text', label: 'X', required: true },
        { id: 'y', type: 'text', label: 'Y', required: true },
        { id: 'z', type: 'text', label: 'Z', required: true },
        { id: 'block', type: 'block', label: 'Block', required: true }
      ],
      build: (opts) => `/testforblock ${opts.x} ${opts.y} ${opts.z} ${opts.block}`
    },
    testforblocks: {
      name: '/testforblocks',
      category: 'advanced',
      description: 'Test if blocks in two regions match.',
      syntax: '/testforblocks <begin> <end> <destination>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'x1', type: 'text', label: 'Begin X', required: true },
        { id: 'y1', type: 'text', label: 'Begin Y', required: true },
        { id: 'z1', type: 'text', label: 'Begin Z', required: true },
        { id: 'x2', type: 'text', label: 'End X', required: true },
        { id: 'y2', type: 'text', label: 'End Y', required: true },
        { id: 'z2', type: 'text', label: 'End Z', required: true },
        { id: 'dx', type: 'text', label: 'Dest X', required: true },
        { id: 'dy', type: 'text', label: 'Dest Y', required: true },
        { id: 'dz', type: 'text', label: 'Dest Z', required: true }
      ],
      build: (opts) => `/testforblocks ${opts.x1} ${opts.y1} ${opts.z1} ${opts.x2} ${opts.y2} ${opts.z2} ${opts.dx} ${opts.dy} ${opts.dz}`
    },
    tickingarea: {
      name: '/tickingarea',
      category: 'world',
      description: 'Keep chunks permanently loaded (Bedrock only).',
      syntax: '/tickingarea <add|remove|list> ...',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['add_circle', 'add_rect', 'remove', 'list'], required: true },
        { id: 'x1', type: 'text', label: 'X', placeholder: '~', required: true, showIf: (opts) => opts.action !== 'list' && opts.action !== 'remove' },
        { id: 'y1', type: 'text', label: 'Y', placeholder: '0', required: true, showIf: (opts) => opts.action !== 'list' && opts.action !== 'remove' },
        { id: 'z1', type: 'text', label: 'Z', placeholder: '~', required: true, showIf: (opts) => opts.action !== 'list' && opts.action !== 'remove' },
        { id: 'radius', type: 'number', label: 'Radius (for circle)', placeholder: '4', required: false, showIf: (opts) => opts.action === 'add_circle' },
        { id: 'x2', type: 'text', label: 'To X', required: false, showIf: (opts) => opts.action === 'add_rect' },
        { id: 'y2', type: 'text', label: 'To Y', required: false, showIf: (opts) => opts.action === 'add_rect' },
        { id: 'z2', type: 'text', label: 'To Z', required: false, showIf: (opts) => opts.action === 'add_rect' },
        { id: 'removeName', type: 'text', label: 'Area Name to Remove', required: true, showIf: (opts) => opts.action === 'remove' }
      ],
      build: (opts) => {
        if (opts.action === 'list') return '/tickingarea list';
        if (opts.action === 'remove') return `/tickingarea remove ${opts.removeName}`;
        if (opts.action === 'add_circle') return `/tickingarea add circle ${opts.x1} ${opts.y1} ${opts.z1} ${opts.radius}`;
        return `/tickingarea add ${opts.x1} ${opts.y1} ${opts.z1} ${opts.x2 || opts.x1} ${opts.y2 || opts.y1} ${opts.z2 || opts.z1}`;
      }
    },
    camerashake: {
      name: '/camerashake',
      category: 'advanced',
      description: 'Apply camera shake effect (Bedrock only).',
      syntax: '/camerashake <add|stop> [target] [intensity] [seconds] [shakeType]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['add', 'stop'], required: true },
        { id: 'target', type: 'selector', label: 'Target', placeholder: '@s', required: false, showIf: (opts) => opts.action === 'add' },
        { id: 'intensity', type: 'number', label: 'Intensity', placeholder: '1', min: 0, max: 4, required: false, showIf: (opts) => opts.action === 'add' },
        { id: 'seconds', type: 'number', label: 'Duration (seconds)', placeholder: '0.5', min: 0.01, max: 100, required: false, showIf: (opts) => opts.action === 'add' },
        { id: 'shakeType', type: 'select', label: 'Shake Type', values: ['positional', 'rotational'], required: false, showIf: (opts) => opts.action === 'add' }
      ],
      build: (opts) => {
        if (opts.action === 'stop') return '/camerashake stop';
        let cmd = `/camerashake add ${opts.target || '@s'}`;
        if (opts.intensity) cmd += ` ${opts.intensity}`;
        if (opts.seconds) cmd += ` ${opts.seconds}`;
        if (opts.shakeType) cmd += ` ${opts.shakeType}`;
        return cmd;
      }
    },
    playsound: {
      name: '/playsound',
      category: 'advanced',
      description: 'Play a sound.',
      syntax: '/playsound <sound> <source> <target> [x] [y] [z] [volume] [pitch] [minVolume]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'sound', type: 'text', label: 'Sound', placeholder: 'mob.wither.spawn', required: true },
        { id: 'source', type: 'select', label: 'Source', values: ['master', 'music', 'record', 'weather', 'block', 'hostile', 'neutral', 'player', 'ambient', 'voice'], required: true },
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'x', type: 'text', label: 'X', placeholder: '~', required: false },
        { id: 'y', type: 'text', label: 'Y', placeholder: '~', required: false },
        { id: 'z', type: 'text', label: 'Z', placeholder: '~', required: false },
        { id: 'volume', type: 'number', label: 'Volume', placeholder: '1', min: 0, max: 1000, required: false },
        { id: 'pitch', type: 'number', label: 'Pitch', placeholder: '1', min: 0, max: 2, required: false }
      ],
      build: (opts) => {
        let cmd = `/playsound ${opts.sound} ${opts.source} ${opts.target}`;
        if (opts.x) cmd += ` ${opts.x} ${opts.y || '~'} ${opts.z || '~'}`;
        if (opts.volume) cmd += ` ${opts.volume}`;
        if (opts.pitch) cmd += ` ${opts.pitch}`;
        return cmd;
      }
    },
    stopsound: {
      name: '/stopsound',
      category: 'advanced',
      description: 'Stop a sound.',
      syntax: '/stopsound <target> [sound]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'sound', type: 'text', label: 'Sound (optional)', placeholder: 'Leave empty to stop all', required: false }
      ],
      build: (opts) => `/stopsound ${opts.target}${opts.sound ? ' ' + opts.sound : ''}`
    },
    music: {
      name: '/music',
      category: 'advanced',
      description: 'Control music playback (Bedrock only).',
      syntax: '/music <play|queue|stop|volume> ...',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['play', 'queue', 'stop', 'volume'], required: true },
        { id: 'track', type: 'text', label: 'Track Name', placeholder: 'music.menu', required: true, showIf: (opts) => ['play', 'queue'].includes(opts.action) },
        { id: 'volume', type: 'number', label: 'Volume', placeholder: '1', min: 0, max: 1, required: false, showIf: (opts) => opts.action === 'volume' }
      ],
      build: (opts) => {
        if (opts.action === 'stop') return '/music stop';
        if (opts.action === 'volume') return `/music volume ${opts.volume || 1}`;
        return `/music ${opts.action} ${opts.track}`;
      }
    },
    particle: {
      name: '/particle',
      category: 'advanced',
      description: 'Create a particle emitter.',
      syntax: '/particle <effect> <x> <y> <z>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'effect', type: 'text', label: 'Particle Effect', placeholder: 'minecraft:balloon_gas_particle', required: true },
        { id: 'x', type: 'text', label: 'X', placeholder: '~', required: true },
        { id: 'y', type: 'text', label: 'Y', placeholder: '~', required: true },
        { id: 'z', type: 'text', label: 'Z', placeholder: '~', required: true }
      ],
      build: (opts) => `/particle ${opts.effect} ${opts.x} ${opts.y} ${opts.z}`
    },
    title: {
      name: '/title',
      category: 'communication',
      description: 'Display a title on screen.',
      syntax: '/title <target> <title|subtitle|times|clear|reset> [text]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'action', type: 'select', label: 'Action', values: ['title', 'subtitle', 'times', 'clear', 'reset'], required: true },
        { id: 'text', type: 'text', label: 'Text', placeholder: 'Hello!', required: true, showIf: (opts) => ['title', 'subtitle'].includes(opts.action) },
        { id: 'fadeIn', type: 'number', label: 'Fade In (ticks)', placeholder: '10', required: false, showIf: (opts) => opts.action === 'times' },
        { id: 'stay', type: 'number', label: 'Stay (ticks)', placeholder: '70', required: false, showIf: (opts) => opts.action === 'times' },
        { id: 'fadeOut', type: 'number', label: 'Fade Out (ticks)', placeholder: '20', required: false, showIf: (opts) => opts.action === 'times' }
      ],
      build: (opts) => {
        if (opts.action === 'clear' || opts.action === 'reset') return `/title ${opts.target} ${opts.action}`;
        if (opts.action === 'times') return `/title ${opts.target} times ${opts.fadeIn || 10} ${opts.stay || 70} ${opts.fadeOut || 20}`;
        return `/title ${opts.target} ${opts.action} ${opts.text}`;
      }
    },
    titleraw: {
      name: '/titleraw',
      category: 'communication',
      description: 'Display a JSON title on screen.',
      syntax: '/titleraw <target> <title|subtitle|times|clear|reset> <content: rawtext>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'action', type: 'select', label: 'Action', values: ['title', 'subtitle', 'times', 'clear', 'reset'], required: true },
        { id: 'json', type: 'text', label: 'JSON Content', placeholder: '{"rawtext":[{"text":"Hello!"}]}', required: true, showIf: (opts) => ['title', 'subtitle'].includes(opts.action) }
      ],
      build: (opts) => {
        if (opts.action === 'clear' || opts.action === 'reset') return `/titleraw ${opts.target} ${opts.action}`;
        return `/titleraw ${opts.target} ${opts.action} ${opts.json}`;
      }
    },
    replaceitem: {
      name: '/replaceitem',
      category: 'items',
      description: 'Replace items in inventory slots (Bedrock only).',
      syntax: '/replaceitem entity <target> <slot> <itemName> [amount] [data] [components]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'slot', type: 'select', label: 'Slot', values: ['slot.weapon.mainhand', 'slot.weapon.offhand', 'slot.armor.head', 'slot.armor.chest', 'slot.armor.legs', 'slot.armor.feet', 'slot.hotbar.0', 'slot.hotbar.1', 'slot.hotbar.2', 'slot.hotbar.3', 'slot.hotbar.4', 'slot.hotbar.5', 'slot.hotbar.6', 'slot.hotbar.7', 'slot.hotbar.8', 'slot.inventory.0', 'slot.inventory.1', 'slot.inventory.2', 'slot.inventory.3', 'slot.inventory.4'], required: true },
        { id: 'item', type: 'item', label: 'Item', placeholder: 'diamond_sword', required: true },
        { id: 'amount', type: 'number', label: 'Amount', placeholder: '1', required: false }
      ],
      build: (opts) => `/replaceitem entity ${opts.target} ${opts.slot} ${opts.item}${opts.amount ? ' ' + opts.amount : ''}`
    },
    recipe: {
      name: '/recipe',
      category: 'items',
      description: 'Unlock or lock crafting recipes.',
      syntax: '/recipe <target> <recipe> <unlock|lock>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'recipe', type: 'text', label: 'Recipe', placeholder: '*', required: true },
        { id: 'action', type: 'select', label: 'Action', values: ['unlock', 'lock'], required: true }
      ],
      build: (opts) => `/recipe ${opts.target} ${opts.recipe} ${opts.action}`
    },
    loot: {
      name: '/loot',
      category: 'items',
      description: 'Drop loot table into inventory or world.',
      syntax: '/loot <target> <lootTable>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'table', type: 'text', label: 'Loot Table', placeholder: 'minecraft:chests/simple_dungeon', required: true }
      ],
      build: (opts) => `/loot ${opts.target} ${opts.table}`
    },
    hud: {
      name: '/hud',
      category: 'advanced',
      description: 'Show/hide HUD elements (Bedrock only).',
      syntax: '/hud <hide|show|reset> [element]',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['hide', 'show', 'reset'], required: true },
        { id: 'element', type: 'select', label: 'HUD Element', values: ['all', 'paper_doll', 'armor', 'crosshair', 'hotbar', 'health', 'potion_effects', 'experience', 'food', 'air', 'hotbar_and_armor', 'selected_item_name', 'debug_screen', 'tooltip'], required: false }
      ],
      build: (opts) => `/hud ${opts.action}${opts.element ? ' ' + opts.element : ''}`
    },
    ability: {
      name: '/ability',
      category: 'player',
      description: 'Grant/revoke player abilities (Bedrock only).',
      syntax: '/ability <target> <ability> <true|false>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'ability', type: 'select', label: 'Ability', values: ['mayfly', 'mute', 'worldbuilder'], required: true },
        { id: 'value', type: 'select', label: 'Value', values: ['true', 'false'], required: true }
      ],
      build: (opts) => `/ability ${opts.target} ${opts.ability} ${opts.value}`
    },
    worldbuilder: {
      name: '/worldbuilder',
      category: 'player',
      description: 'Toggle world builder ability (Bedrock only).',
      syntax: '/worldbuilder <true|false>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'value', type: 'select', label: 'Value', values: ['true', 'false'], required: true }
      ],
      build: (opts) => `/worldbuilder ${opts.value}`
    },
    immutableworld: {
      name: '/immutableworld',
      category: 'world',
      description: 'Toggle immutable world (Bedrock only).',
      syntax: '/immutableworld <true|false>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'value', type: 'select', label: 'Value', values: ['true', 'false'], required: true }
      ],
      build: (opts) => `/immutableworld ${opts.value}`
    },
    mobevent: {
      name: '/mobevent',
      category: 'world',
      description: 'Enable/disable mob events (Bedrock only).',
      syntax: '/mobevent <event> <true|false>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'event', type: 'select', label: 'Mob Event', values: ['eventsenabled'], required: true },
        { id: 'value', type: 'select', label: 'Value', values: ['true', 'false'], required: true }
      ],
      build: (opts) => `/mobevent ${opts.event} ${opts.value}`
    },
    inputpermission: {
      name: '/inputpermission',
      category: 'player',
      description: 'Enable/disable player inputs (Bedrock only).',
      syntax: '/inputpermission <target> <input> <true|false>',
      permissions: 'Operator',
      requiresCheats: true,
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'input', type: 'select', label: 'Input Type', values: ['movement', 'camera'], required: true },
        { id: 'value', type: 'select', label: 'Enabled', values: ['true', 'false'], required: true }
      ],
      build: (opts) => `/inputpermission ${opts.target} ${opts.input} ${opts.value}`
    },
    fog: {
      name: '/fog',
      category: 'world',
      description: 'Manage fog settings (Bedrock only).',
      syntax: '/fog <target> <fogId> <save|remove>',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'bedrock',
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'fogId', type: 'text', label: 'Fog ID', placeholder: 'minecraft:fog_plain', required: true },
        { id: 'action', type: 'select', label: 'Action', values: ['save', 'remove'], required: true }
      ],
      build: (opts) => `/fog ${opts.target} ${opts.fogId} ${opts.action}`
    },

    // ========== JAVA EDITION ONLY COMMANDS ==========
    defaultgamemode: {
      name: '/defaultgamemode',
      category: 'player',
      description: 'Set the default game mode for new players (Java only).',
      syntax: '/defaultgamemode <mode>',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'mode', type: 'select', label: 'Game Mode', values: ['survival', 'creative', 'adventure', 'spectator'], required: true }
      ],
      build: (opts) => `/defaultgamemode ${opts.mode}`
    },
    data: {
      name: '/data',
      category: 'advanced',
      description: 'Get, merge, modify, or remove NBT data (Java only).',
      syntax: '/data <get|merge|modify|remove> <target>',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['get', 'merge', 'modify', 'remove'], required: true },
        { id: 'source', type: 'select', label: 'Source', values: ['entity', 'block', 'storage'], required: true },
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'nbt', type: 'text', label: 'NBT Path', placeholder: '{Health:20f}', required: true, showIf: (opts) => ['merge', 'modify', 'remove'].includes(opts.action) }
      ],
      build: (opts) => {
        if (opts.action === 'get') return `/data get ${opts.source} ${opts.target}`;
        if (opts.action === 'remove') return `/data remove ${opts.source} ${opts.target}`;
        return `/data ${opts.action} ${opts.source} ${opts.target} ${opts.nbt}`;
      }
    },
    datapack: {
      name: '/datapack',
      category: 'advanced',
      description: 'Manage installed datapacks (Java only).',
      syntax: '/datapack <enable|disable|list>',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['enable', 'disable', 'list'], required: true },
        { id: 'name', type: 'text', label: 'Datapack Name', required: true, showIf: (opts) => opts.action !== 'list' }
      ],
      build: (opts) => {
        if (opts.action === 'list') return '/datapack list';
        return `/datapack ${opts.action} ${opts.name}`;
      }
    },
    experience: {
      name: '/experience',
      category: 'player',
      description: 'Add, set, or query player experience (Java only).',
      syntax: '/experience <add|set|query> <target> <amount> [levels|points]',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['add', 'set', 'query'], required: true },
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'amount', type: 'number', label: 'Amount', placeholder: '100', required: true, showIf: (opts) => opts.action !== 'query' },
        { id: 'unit', type: 'select', label: 'Unit', values: ['points', 'levels'], required: false, showIf: (opts) => opts.action !== 'query' }
      ],
      build: (opts) => {
        if (opts.action === 'query') return `/experience query ${opts.target}`;
        return `/experience ${opts.action} ${opts.target} ${opts.amount}${opts.unit ? ' ' + opts.unit : ''}`;
      }
    },
    forceload: {
      name: '/forceload',
      category: 'world',
      description: 'Keep chunks permanently loaded (Java only).',
      syntax: '/forceload <add|remove|query> [from] [to]',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['add', 'remove', 'query'], required: true },
        { id: 'x1', type: 'text', label: 'From X', required: true, showIf: (opts) => opts.action !== 'query' },
        { id: 'z1', type: 'text', label: 'From Z', required: true, showIf: (opts) => opts.action !== 'query' },
        { id: 'x2', type: 'text', label: 'To X', required: false, showIf: (opts) => opts.action !== 'query' },
        { id: 'z2', type: 'text', label: 'To Z', required: false, showIf: (opts) => opts.action !== 'query' }
      ],
      build: (opts) => {
        if (opts.action === 'query') return '/forceload query';
        if (opts.x2) return `/forceload ${opts.action} ${opts.x1} ${opts.z1} ${opts.x2} ${opts.z2}`;
        return `/forceload ${opts.action} ${opts.x1} ${opts.z1}`;
      }
    },
    fillbiome: {
      name: '/fillbiome',
      category: 'world',
      description: 'Replace the biome in a region (Java only).',
      syntax: '/fillbiome <from> <to> <biome>',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'x1', type: 'text', label: 'From X', required: true },
        { id: 'y1', type: 'text', label: 'From Y', required: true },
        { id: 'z1', type: 'text', label: 'From Z', required: true },
        { id: 'x2', type: 'text', label: 'To X', required: true },
        { id: 'y2', type: 'text', label: 'To Y', required: true },
        { id: 'z2', type: 'text', label: 'To Z', required: true },
        { id: 'biome', type: 'text', label: 'Biome', placeholder: 'plains', required: true }
      ],
      build: (opts) => `/fillbiome ${opts.x1} ${opts.y1} ${opts.z1} ${opts.x2} ${opts.y2} ${opts.z2} ${opts.biome}`
    },
    item: {
      name: '/item',
      category: 'items',
      description: 'Replace or modify items in inventory slots (Java only).',
      syntax: '/item <replace|modify> <block|entity> ...',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['replace', 'modify'], required: true },
        { id: 'source', type: 'select', label: 'Source', values: ['entity', 'block'], required: true },
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'slot', type: 'text', label: 'Slot', placeholder: 'weapon', required: true },
        { id: 'item', type: 'item', label: 'Item (replace only)', required: true, showIf: (opts) => opts.action === 'replace' }
      ],
      build: (opts) => {
        if (opts.action === 'replace') return `/item replace ${opts.source} ${opts.target} ${opts.slot} with ${opts.item}`;
        return `/item modify ${opts.source} ${opts.target} ${opts.slot}`;
      }
    },
    spectate: {
      name: '/spectate',
      category: 'player',
      description: 'Spectate another entity in spectator mode (Java only).',
      syntax: '/spectate [target] [player]',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'target', type: 'selector', label: 'Entity to Spectate', required: false },
        { id: 'player', type: 'selector', label: 'Player', required: false }
      ],
      build: (opts) => {
        if (!opts.target) return '/spectate';
        return `/spectate ${opts.target}${opts.player ? ' ' + opts.player : ''}`;
      }
    },
    attribute: {
      name: '/attribute',
      category: 'player',
      description: 'Modify entity attributes (Java only).',
      syntax: '/attribute <target> <attribute> <base|get| modifier> ...',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'target', type: 'selector', label: 'Target', required: true },
        { id: 'attribute', type: 'text', label: 'Attribute', placeholder: 'generic.max_health', required: true },
        { id: 'action', type: 'select', label: 'Action', values: ['base set', 'base get', 'modifier add', 'modifier remove', 'modifier value set', 'modifier value get'], required: true },
        { id: 'value', type: 'text', label: 'Value', placeholder: '20', required: true, showIf: (opts) => opts.action.includes('set') }
      ],
      build: (opts) => {
        if (opts.action === 'base get') return `/attribute ${opts.target} ${opts.attribute} base get`;
        if (opts.action.includes('get')) return `/attribute ${opts.target} ${opts.attribute} ${opts.action}`;
        return `/attribute ${opts.target} ${opts.attribute} ${opts.action} ${opts.value}`;
      }
    },
    bossbar: {
      name: '/bossbar',
      category: 'admin',
      description: 'Create and manage boss bars (Java only).',
      syntax: '/bossbar <add|get|list|remove|set> ...',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['add', 'get', 'list', 'remove', 'set'], required: true },
        { id: 'id', type: 'text', label: 'Bossbar ID', placeholder: 'mymod:mybar', required: true, showIf: (opts) => opts.action !== 'list' },
        { id: 'name', type: 'text', label: 'Display Name', placeholder: 'Boss', required: true, showIf: (opts) => opts.action === 'add' },
        { id: 'property', type: 'select', label: 'Property', values: ['name', 'color', 'style', 'value', 'max', 'visible', 'notched'], required: false, showIf: (opts) => opts.action === 'set' },
        { id: 'value', type: 'text', label: 'Value', required: false, showIf: (opts) => opts.action === 'set' }
      ],
      build: (opts) => {
        if (opts.action === 'list') return '/bossbar list';
        if (opts.action === 'add') return `/bossbar add ${opts.id} ${opts.name}`;
        if (opts.action === 'remove') return `/bossbar remove ${opts.id}`;
        if (opts.action === 'get') return `/bossbar get ${opts.id} ${opts.property || 'value'}`;
        return `/bossbar set ${opts.id} ${opts.property} ${opts.value}`;
      }
    },
    ban: {
      name: '/ban',
      category: 'admin',
      description: 'Ban a player from the server (Java only).',
      syntax: '/ban <player> [reason]',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'player', type: 'text', label: 'Player', required: true },
        { id: 'reason', type: 'text', label: 'Reason (optional)', required: false }
      ],
      build: (opts) => `/ban ${opts.player}${opts.reason ? ' ' + opts.reason : ''}`
    },
    pardon: {
      name: '/pardon',
      category: 'admin',
      description: 'Unban a player (Java only).',
      syntax: '/pardon <player>',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'player', type: 'text', label: 'Player', required: true }
      ],
      build: (opts) => `/pardon ${opts.player}`
    },
    banip: {
      name: '/ban-ip',
      category: 'admin',
      description: 'Ban an IP address (Java only).',
      syntax: '/ban-ip <address> [reason]',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'address', type: 'text', label: 'IP Address', required: true },
        { id: 'reason', type: 'text', label: 'Reason (optional)', required: false }
      ],
      build: (opts) => `/ban-ip ${opts.address}${opts.reason ? ' ' + opts.reason : ''}`
    },
    pardonip: {
      name: '/pardon-ip',
      category: 'admin',
      description: 'Unban an IP address (Java only).',
      syntax: '/pardon-ip <address>',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'address', type: 'text', label: 'IP Address', required: true }
      ],
      build: (opts) => `/pardon-ip ${opts.address}`
    },
    team: {
      name: '/team',
      category: 'advanced',
      description: 'Create and manage scoreboard teams (Java only).',
      syntax: '/team <add|remove|empty|join|leave|list|modify> ...',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['add', 'remove', 'empty', 'join', 'leave', 'list', 'modify'], required: true },
        { id: 'team', type: 'text', label: 'Team Name', placeholder: 'red', required: true, showIf: (opts) => opts.action !== 'list' },
        { id: 'member', type: 'selector', label: 'Member', required: true, showIf: (opts) => ['join', 'leave'].includes(opts.action) },
        { id: 'property', type: 'select', label: 'Property', values: ['color', 'displayName', 'seeFriendlyInvisibles', 'nametagVisibility', 'deathMessageVisibility', 'collisionRule', 'prefix', 'suffix'], required: false, showIf: (opts) => opts.action === 'modify' },
        { id: 'value', type: 'text', label: 'Value', required: false, showIf: (opts) => opts.action === 'modify' }
      ],
      build: (opts) => {
        if (opts.action === 'list') return '/team list';
        if (opts.action === 'add') return `/team add ${opts.team}`;
        if (opts.action === 'remove') return `/team remove ${opts.team}`;
        if (opts.action === 'empty') return `/team empty ${opts.team}`;
        if (opts.action === 'join') return `/team join ${opts.team} ${opts.member}`;
        if (opts.action === 'leave') return `/team leave ${opts.member}`;
        return `/team modify ${opts.team} ${opts.property} ${opts.value}`;
      }
    },
    worldborder: {
      name: '/worldborder',
      category: 'world',
      description: 'Manage the world border (Java only).',
      syntax: '/worldborder <set|add|center|damage|get|warning> ...',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['set', 'add', 'center', 'damage amount', 'damage buffer', 'get', 'warning distance', 'warning time'], required: true },
        { id: 'value', type: 'text', label: 'Value', required: true, showIf: (opts) => opts.action !== 'get' },
        { id: 'x', type: 'text', label: 'Center X', required: true, showIf: (opts) => opts.action === 'center' },
        { id: 'z', type: 'text', label: 'Center Z', required: true, showIf: (opts) => opts.action === 'center' }
      ],
      build: (opts) => {
        if (opts.action === 'get') return '/worldborder get';
        if (opts.action === 'center') return `/worldborder center ${opts.x} ${opts.z}`;
        return `/worldborder ${opts.action} ${opts.value}`;
      }
    },
    tick: {
      name: '/tick',
      category: 'advanced',
      description: 'Control the server tick rate (Java only).',
      syntax: '/tick <query|rate|freeze|step|unfreeze|sprint> ...',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['query', 'rate', 'freeze', 'step', 'unfreeze', 'sprint'], required: true },
        { id: 'value', type: 'text', label: 'Tick Rate', placeholder: '20', required: true, showIf: (opts) => opts.action === 'rate' }
      ],
      build: (opts) => {
        if (opts.action === 'rate') return `/tick rate ${opts.value}`;
        return `/tick ${opts.action}`;
      }
    },
    schedule: {
      name: '/schedule',
      category: 'advanced',
      description: 'Delay running a function until later (Java only).',
      syntax: '/schedule <function|clear> ...',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['function', 'clear'], required: true },
        { id: 'function', type: 'text', label: 'Function', placeholder: 'namespace:path', required: true, showIf: (opts) => opts.action === 'function' },
        { id: 'delay', type: 'text', label: 'Delay', placeholder: '10s or 1d', required: true, showIf: (opts) => opts.action === 'function' },
        { id: 'append', type: 'select', label: 'Append', values: ['false', 'true'], required: false, showIf: (opts) => opts.action === 'function' }
      ],
      build: (opts) => {
        if (opts.action === 'clear') return '/schedule clear';
        return `/schedule function ${opts.function} ${opts.delay}${opts.append === 'true' ? ' append' : ''}`;
      }
    },
    trigger: {
      name: '/trigger',
      category: 'advanced',
      description: 'Activate a scoreboard trigger (Java only).',
      syntax: '/trigger <objective> <add|set|remove> <value>',
      permissions: 'All players',
      requiresCheats: false,
      edition: 'java',
      options: [
        { id: 'objective', type: 'text', label: 'Objective', placeholder: 'mytrigger', required: true },
        { id: 'action', type: 'select', label: 'Action', values: ['add', 'set', 'remove'], required: true },
        { id: 'value', type: 'number', label: 'Value', required: true }
      ],
      build: (opts) => `/trigger ${opts.objective} ${opts.action} ${opts.value}`
    },
    seed: {
      name: '/seed',
      category: 'world',
      description: 'Show the world seed (Java only).',
      syntax: '/seed',
      permissions: 'All players',
      requiresCheats: false,
      edition: 'java',
      options: [],
      build: () => '/seed'
    },
    publish: {
      name: '/publish',
      category: 'admin',
      description: 'Open singleplayer world to LAN (Java only).',
      syntax: '/publish [port] [allowCheats] [gamemode]',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'port', type: 'number', label: 'Port', placeholder: '25565', required: false },
        { id: 'allowCheats', type: 'select', label: 'Allow Cheats', values: ['true', 'false'], required: false },
        { id: 'gamemode', type: 'select', label: 'Default Gamemode', values: ['survival', 'creative', 'adventure', 'spectator'], required: false }
      ],
      build: (opts) => {
        let cmd = '/publish';
        if (opts.port) cmd += ` ${opts.port}`;
        if (opts.allowCheats) cmd += ` ${opts.allowCheats}`;
        if (opts.gamemode) cmd += ` ${opts.gamemode}`;
        return cmd;
      }
    },
    random: {
      name: '/random',
      category: 'advanced',
      description: 'Draw a random value or control RNG (Java only).',
      syntax: '/random <value|sequence> ...',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['value', 'sequence'], required: true },
        { id: 'range', type: 'text', label: 'Range', placeholder: '1..10', required: true, showIf: (opts) => opts.action === 'value' },
        { id: 'sequenceName', type: 'text', label: 'Sequence Name', required: true, showIf: (opts) => opts.action === 'sequence' },
        { id: 'sequenceAction', type: 'select', label: 'Sequence Action', values: ['add', 'remove', 'list'], required: true, showIf: (opts) => opts.action === 'sequence' }
      ],
      build: (opts) => {
        if (opts.action === 'value') return `/random ${opts.range}`;
        if (opts.sequenceAction === 'list') return '/random sequence list';
        return `/random sequence ${opts.sequenceAction} ${opts.sequenceName}`;
      }
    },
    return: {
      name: '/return',
      category: 'advanced',
      description: 'Control execution flow in functions (Java only).',
      syntax: '/return <value|fail|success> ...',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['value', 'fail', 'success'], required: true },
        { id: 'value', type: 'number', label: 'Return Value', required: true, showIf: (opts) => opts.action === 'value' }
      ],
      build: (opts) => {
        if (opts.action === 'value') return `/return ${opts.value}`;
        return `/return ${opts.action}`;
      }
    },
    saveall: {
      name: '/save-all',
      category: 'admin',
      description: 'Save the server to disk (Java only).',
      syntax: '/save-all [flush]',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'flush', type: 'select', label: 'Flush', values: ['false', 'true'], required: false }
      ],
      build: (opts) => opts.flush === 'true' ? '/save-all flush' : '/save-all'
    },
    saveoff: {
      name: '/save-off',
      category: 'admin',
      description: 'Disable automatic server saves (Java only).',
      syntax: '/save-off',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [],
      build: () => '/save-off'
    },
    saveon: {
      name: '/save-on',
      category: 'admin',
      description: 'Enable automatic server saves (Java only).',
      syntax: '/save-on',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [],
      build: () => '/save-on'
    },
    setidletimeout: {
      name: '/setidletimeout',
      category: 'admin',
      description: 'Set idle kick timeout (Java only).',
      syntax: '/setidletimeout <minutes>',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'minutes', type: 'number', label: 'Minutes', placeholder: '10', min: 0, required: true }
      ],
      build: (opts) => `/setidletimeout ${opts.minutes}`
    },
    teammsg: {
      name: '/teammsg',
      category: 'communication',
      description: 'Send message to your team (Java only).',
      syntax: '/teammsg <message>',
      permissions: 'All players',
      requiresCheats: false,
      edition: 'java',
      options: [
        { id: 'message', type: 'text', label: 'Message', required: true }
      ],
      build: (opts) => `/teammsg ${opts.message}`
    },
    tm: {
      name: '/tm',
      category: 'communication',
      description: 'Alias for /teammsg (Java only).',
      syntax: '/tm <message>',
      permissions: 'All players',
      requiresCheats: false,
      edition: 'java',
      options: [
        { id: 'message', type: 'text', label: 'Message', required: true }
      ],
      build: (opts) => `/tm ${opts.message}`
    },
    warden_spawn_tracker: {
      name: '/warden_spawn_tracker',
      category: 'advanced',
      description: 'Set warden warning level (Java only).',
      syntax: '/warden_spawn_tracker <add|clear|get>',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'action', type: 'select', label: 'Action', values: ['add', 'clear', 'get'], required: true }
      ],
      build: (opts) => `/warden_spawn_tracker ${opts.action}`
    },
    unban: {
      name: '/pardon',
      category: 'admin',
      description: 'Unban a player (Java only).',
      syntax: '/pardon <player>',
      permissions: 'Operator',
      requiresCheats: true,
      edition: 'java',
      options: [
        { id: 'player', type: 'text', label: 'Player', required: true }
      ],
      build: (opts) => `/pardon ${opts.player}`
    }
  };

  let currentCommand = null;
  let editionSelect, categorySelect, cmdSelect, builderEl, builderTitle, optionsEl, outputCard, outputEl;

  function init() {
    editionSelect = document.getElementById('cmd-edition');
    categorySelect = document.getElementById('cmd-category');
    cmdSelect = document.getElementById('cmd-select');
    builderEl = document.getElementById('cmd-builder');
    builderTitle = document.getElementById('cmd-builder-title');
    optionsEl = document.getElementById('cmd-options');
    outputCard = document.getElementById('cmd-output-card');
    outputEl = document.getElementById('cmd-output');

    if (!editionSelect || !categorySelect || !cmdSelect) return;

    editionSelect.addEventListener('change', () => {
      currentEdition = editionSelect.value;
      updateEditionBadge();
      filterCommands();
    });

    updateEditionBadge();
    categorySelect.addEventListener('change', filterCommands);
    cmdSelect.addEventListener('change', selectCommand);

    document.getElementById('cmd-copy')?.addEventListener('click', copyCommand);
    document.getElementById('cmd-reset')?.addEventListener('click', resetBuilder);

    filterCommands();
  }

  function updateEditionBadge() {
    const tag = document.getElementById('edition-tag');
    const version = document.getElementById('version-tag');
    if (tag) {
      tag.className = `edition-tag ${currentEdition}`;
      tag.textContent = currentEdition === 'bedrock' ? 'Bedrock Edition' : 'Java Edition';
    }
    if (version) {
      version.textContent = currentEdition === 'bedrock' ? 'v1.21+' : 'v1.21+';
    }
  }

  function filterCommands() {
    const category = categorySelect.value;
    const cmds = Object.values(COMMANDS).filter(cmd => {
      const editionMatch = cmd.edition === currentEdition || (!cmd.edition && currentEdition === 'bedrock');
      const categoryMatch = category === 'all' || cmd.category === category;
      return editionMatch && categoryMatch;
    });

    cmdSelect.innerHTML = '<option value="">-- Select Command --</option>';
    cmds.forEach(cmd => {
      const opt = document.createElement('option');
      opt.value = cmd.name.replace('/', '');
      opt.textContent = `${cmd.name} - ${cmd.description.substring(0, 50)}...`;
      cmdSelect.appendChild(opt);
    });

    builderEl.style.display = 'none';
    outputCard.style.display = 'none';

    // Update selectors for current edition
    handleSelectorFilters();
  }

  function selectCommand() {
    const cmdName = cmdSelect.value;
    if (!cmdName) {
      builderEl.style.display = 'none';
      outputCard.style.display = 'none';
      return;
    }

    currentCommand = COMMANDS[cmdName];
    if (!currentCommand) return;

    builderEl.style.display = 'block';
    outputCard.style.display = 'block';
    builderTitle.textContent = currentCommand.name;

    renderOptions();
    handleSelectorFilters();
    updateOutput();
  }

  // Target Selectors Database
  const TARGET_SELECTORS = [
    { value: '@a', label: '@a - All Players', description: 'Targets all players in the world' },
    { value: '@p', label: '@p - Nearest Player', description: 'Targets the nearest player to command executor' },
    { value: '@r', label: '@r - Random Player', description: 'Targets a random player' },
    { value: '@e', label: '@e - All Entities', description: 'Targets all entities (players, mobs, items, etc.)' },
    { value: '@s', label: '@s - Yourself', description: 'Targets the entity executing the command' },
    { value: '@initiator', label: '@initiator - NPC Trigger', description: 'Targets NPC interaction trigger (Bedrock only)' }
  ];

  // Entity Types for filters
  const ENTITY_TYPES = [
    'player', 'zombie', 'skeleton', 'creeper', 'spider', 'enderman', 'witch', 'slime',
    'husk', 'drowned', 'phantom', 'vindicator', 'evoker', 'pillager', 'ravager',
    'blaze', 'ghast', 'magma_cube', 'wither_skeleton', 'piglin', 'hoglin', 'strider',
    'cow', 'pig', 'sheep', 'chicken', 'horse', 'donkey', 'mule', 'llama',
    'cat', 'wolf', 'fox', 'bee', 'axolotl', 'frog', 'tadpole',
    'iron_golem', 'snow_golem', 'ender_dragon', 'wither', 'elder_guardian',
    'item', 'xp_orb', 'arrow', 'trident', 'fireball', 'tnt', 'minecart',
    'boat', 'armor_stand', 'painting', 'item_frame', 'glow_item_frame',
    'armor_stand', 'falling_block', 'lightning_bolt', 'area_effect_cloud'
  ];

  // Effects for target filters
  const EFFECTS = [
    'speed', 'slowness', 'haste', 'mining_fatigue', 'strength', 'instant_health',
    'instant_damage', 'jump_boost', 'nausea', 'regeneration', 'resistance',
    'fire_resistance', 'water_breathing', 'invisibility', 'blindness', 'night_vision',
    'hunger', 'weakness', 'poison', 'wither', 'health_boost', 'absorption',
    'saturation', 'glowing', 'levitation', 'luck', 'unluck', 'slow_falling'
  ];

  // Scores for @e filters
  const SCORE_OBJECTIVES = ['health', 'xp', 'level', 'deathCount', 'playerKillCount'];

  function renderOptions() {
    optionsEl.innerHTML = '';

    // Info
    const info = document.createElement('div');
    info.className = 'cmd-info';
    info.innerHTML = `
      <p><strong>Syntax:</strong> <code>${currentCommand.syntax}</code></p>
      <p><strong>Permissions:</strong> ${currentCommand.permissions}</p>
      <p><strong>Requires Cheats:</strong> ${currentCommand.requiresCheats ? 'Yes' : 'No'}</p>
      <p>${currentCommand.description}</p>
    `;
    optionsEl.appendChild(info);

    // Options
    currentCommand.options.forEach(opt => {
      const group = document.createElement('div');
      group.className = 'form-group';
      group.dataset.optionId = opt.id;

      if (opt.showIf) {
        group.style.display = 'none';
      }

      const label = document.createElement('label');
      label.className = 'form-label';
      label.textContent = opt.label;
      group.appendChild(label);

      let input;
      if (opt.type === 'select') {
        input = document.createElement('select');
        input.className = 'form-select';
        input.dataset.optionId = opt.id;
        opt.values.forEach(v => {
          const option = document.createElement('option');
          option.value = v;
          option.textContent = v;
          input.appendChild(option);
        });
      } else if (opt.type === 'selector') {
        // Target selector with filters
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'selector-container';

        // Main selector dropdown
        input = document.createElement('select');
        input.className = 'form-select';
        input.dataset.optionId = opt.id;
        input.dataset.optionType = 'selector';

        TARGET_SELECTORS.forEach(sel => {
          const option = document.createElement('option');
          option.value = sel.value;
          option.textContent = sel.label;
          option.title = sel.description;
          input.appendChild(option);
        });

        selectorContainer.appendChild(input);

        // Filter toggle button
        const filterToggle = document.createElement('button');
        filterToggle.type = 'button';
        filterToggle.className = 'btn btn-secondary btn-sm selector-filter-toggle';
        filterToggle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg> Filters`;
        filterToggle.addEventListener('click', () => {
          const filtersDiv = selectorContainer.querySelector('.selector-filters');
          filtersDiv.classList.toggle('expanded');
          filterToggle.classList.toggle('active');
        });
        selectorContainer.appendChild(filterToggle);

        // Filters panel
        const filtersDiv = document.createElement('div');
        filtersDiv.className = 'selector-filters';

        // Type filter
        filtersDiv.innerHTML = `
          <div class="selector-filter-row">
            <label>Type:</label>
            <select class="form-select-sm" data-filter="type">
              <option value="">Any</option>
              ${ENTITY_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
          </div>
          <div class="selector-filter-row">
            <label>Distance:</label>
            <select class="form-select-sm" data-filter="distance-op">
              <option value="">-</option>
              <option value="..">Max (..)</option>
              <option value="..=">Max (=..)</option>
              <option value="..">Min (..)</option>
              <option value="..">Range (..)</option>
            </select>
            <input type="number" class="form-input-sm" data-filter="distance" placeholder="blocks">
          </div>
          <div class="selector-filter-row">
            <label>Level:</label>
            <select class="form-select-sm" data-filter="level-op">
              <option value="">-</option>
              <option value="..">Max</option>
              <option value="..=">Exact</option>
            </select>
            <input type="number" class="form-input-sm" data-filter="level" placeholder="XP level">
          </div>
          <div class="selector-filter-row">
            <label>Effect:</label>
            <select class="form-select-sm" data-filter="effect">
              <option value="">Any</option>
              ${EFFECTS.map(e => `<option value="${e}">${e}</option>`).join('')}
            </select>
          </div>
          <div class="selector-filter-row">
            <label>Name:</label>
            <input type="text" class="form-input-sm" data-filter="name" placeholder="Player name">
          </div>
          <div class="selector-filter-row">
            <label>Tags:</label>
            <input type="text" class="form-input-sm" data-filter="tag" placeholder="tag name">
          </div>
          <div class="selector-filter-row">
            <label>Score:</label>
            <select class="form-select-sm" data-filter="score-obj">
              <option value="">-</option>
              ${SCORE_OBJECTIVES.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <input type="number" class="form-input-sm" data-filter="score-min" placeholder="min">
            <input type="number" class="form-input-sm" data-filter="score-max" placeholder="max">
          </div>
        `;

        // Add filter change listeners
        filtersDiv.querySelectorAll('select, input').forEach(el => {
          el.addEventListener('change', handleInput);
          el.addEventListener('input', handleInput);
        });

        selectorContainer.appendChild(filtersDiv);
        input = selectorContainer;
      } else {
        input = document.createElement('input');
        input.type = opt.type === 'number' ? 'number' : 'text';
        input.className = 'form-input';
        input.dataset.optionId = opt.id;
        input.placeholder = opt.placeholder || '';
        if (opt.min) input.min = opt.min;
        if (opt.max) input.max = opt.max;
      }

      if (input.tagName) {
        input.addEventListener('input', handleInput);
      }
      group.appendChild(input);
      optionsEl.appendChild(group);
    });

    updateConditionalFields();
    handleSelectorFilters();
  }

  function handleInput(e) {
    updateConditionalFields();
    updateOutput();
  }

  function updateConditionalFields() {
    const values = getValues();
    currentCommand.options.forEach(opt => {
      if (opt.showIf) {
        const group = optionsEl.querySelector(`[data-option-id="${opt.id}"]`);
        if (group) {
          group.style.display = opt.showIf(values) ? 'block' : 'none';
        }
      }
    });
  }

  // Handle selector filter changes
  function handleSelectorFilters() {
    optionsEl.querySelectorAll('.selector-container').forEach(container => {
      const select = container.querySelector('select[data-option-type="selector"]');
      const filtersDiv = container.querySelector('.selector-filters');
      if (select && filtersDiv) {
        // Show/hide Bedrock-only selector for @initiator
        const initiatorOption = select.querySelector('option[value="@initiator"]');
        if (initiatorOption) {
          initiatorOption.style.display = currentEdition === 'bedrock' ? 'block' : 'none';
          if (currentEdition === 'java' && select.value === '@initiator') {
            select.value = '@s';
          }
        }
      }
    });
  }

  function getValues() {
    const values = {};
    optionsEl.querySelectorAll('[data-option-id]').forEach(el => {
      if (el.dataset.optionType === 'selector') {
        // Handle target selector with filters
        const selectorBase = el.value;
        const container = el.closest('.selector-container');
        const filtersDiv = container?.querySelector('.selector-filters');
        
        if (filtersDiv && filtersDiv.classList.contains('expanded')) {
          const filters = [];
          const type = filtersDiv.querySelector('[data-filter="type"]')?.value;
          const name = filtersDiv.querySelector('[data-filter="name"]')?.value;
          const tag = filtersDiv.querySelector('[data-filter="tag"]')?.value;
          const distanceOp = filtersDiv.querySelector('[data-filter="distance-op"]')?.value;
          const distance = filtersDiv.querySelector('[data-filter="distance"]')?.value;
          const levelOp = filtersDiv.querySelector('[data-filter="level-op"]')?.value;
          const level = filtersDiv.querySelector('[data-filter="level"]')?.value;
          const effect = filtersDiv.querySelector('[data-filter="effect"]')?.value;
          const scoreObj = filtersDiv.querySelector('[data-filter="score-obj"]')?.value;
          const scoreMin = filtersDiv.querySelector('[data-filter="score-min"]')?.value;
          const scoreMax = filtersDiv.querySelector('[data-filter="score-max"]')?.value;

          if (type) filters.push(`type=${type}`);
          if (name) filters.push(`name=${name}`);
          if (tag) filters.push(`tag=${tag}`);
          if (distance && distanceOp) filters.push(`distance=${distanceOp}${distance}`);
          else if (distance) filters.push(`distance=..${distance}`);
          if (level && levelOp) filters.push(`level=${levelOp}${level}`);
          else if (level) filters.push(`level=${level}`);
          if (effect) filters.push(`has_effect=${effect}`);
          if (scoreObj) {
            let scoreStr = `scores={${scoreObj}=`;
            if (scoreMin && scoreMax) scoreStr += `${scoreMin}..${scoreMax}`;
            else if (scoreMin) scoreStr += `${scoreMin}..`;
            else if (scoreMax) scoreStr += `..${scoreMax}`;
            else scoreStr += `0..`;
            scoreStr += '}';
            filters.push(scoreStr);
          }

          if (filters.length > 0) {
            values[el.dataset.optionId] = `${selectorBase}[${filters.join(',')}]`;
          } else {
            values[el.dataset.optionId] = selectorBase;
          }
        } else {
          values[el.dataset.optionId] = selectorBase;
        }
      } else {
        values[el.dataset.optionId] = el.value;
      }
    });
    return values;
  }

  function updateOutput() {
    if (!currentCommand) return;
    const values = getValues();
    const cmd = currentCommand.build(values);
    outputEl.textContent = cmd;
  }

  function copyCommand() {
    const cmd = outputEl.textContent;
    if (!cmd) return;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cmd).then(() => {
        showCopyToast();
      }).catch(() => {
        fallbackCopy(cmd);
      });
    } else {
      fallbackCopy(cmd);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopyToast();
    } catch (e) {
      console.error('Copy failed');
    }
    document.body.removeChild(textarea);
  }

  function showCopyToast() {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Command copied!';
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  function resetBuilder() {
    optionsEl.querySelectorAll('input, select').forEach(el => {
      el.value = '';
    });
    updateOutput();
  }

  return { init };
})();

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CommandGenerator.init());
} else {
  CommandGenerator.init();
}