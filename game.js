// ============================================
// PIXEL SURVIVORS - Main Game File
// ============================================

'use strict';

// Game Constants
const TILE_SIZE = 32;
let WORLD_SIZE; // Initialized in gameInit

// Game State
let gameState = 'menu'; // menu, playing, paused, levelup, gameover
let selectedClass = 'warrior';
let player = null;
let enemies = [];
let projectiles = [];
let pickups = [];
let gameTime = 0;
let killCount = 0;
let goldCollected = 0;
let currentWave = 1;
let spawnTimer = 0;
let isPaused = false;

// Meta Progression (saved to localStorage)
let metaUpgrades = {
    maxHp: 0,
    damage: 0,
    speed: 0,
    xpGain: 0,
    gold: 0
};

// Upgrade costs
const UPGRADE_COSTS = {
    maxHp: 50,
    damage: 75,
    speed: 100,
    xpGain: 150
};

// ============================================
// SPRITE GENERATION
// ============================================

let spriteSheet;
let spriteTexture;
const SPRITE_SIZE = 32;
const SPRITES_PER_ROW = 8;

// Sprite indices based on sprite sheet layout (8 columns per row)
// Row 0: Warrior (0-3), Imp (4-7)
// Row 1: Druid Human (8-11), Skeleton (12-15)
// Row 2: Druid Bear (16-19), Zombie (20-23)
// Row 3: Druid Wolf (24-27), Demon Knight (28-31)
// Row 4: Druid Lunar (32-35), Lich (36-39)
// Row 5: Shaman (40-43)
const SPRITE_INDEX = {
    warrior: 0,
    druid_human: 8,
    druid_bear: 16,
    druid_wolf: 24,
    druid_lunar: 32,
    shaman: 40,
    // Enemies
    imp: 4,
    skeleton: 12,
    zombie: 20,
    demonKnight: 28,
    lich: 36
};

function generateSpriteSheet() {
    const canvas = document.createElement('canvas');
    const rows = 6;
    canvas.width = SPRITE_SIZE * SPRITES_PER_ROW;
    canvas.height = SPRITE_SIZE * rows;
    const ctx = canvas.getContext('2d');

    // Disable smoothing for crisp pixels
    ctx.imageSmoothingEnabled = false;

    // Generate each character sprite
    generateWarriorSprites(ctx, 0, 0);
    generateDruidHumanSprites(ctx, 0, 1);
    generateDruidBearSprites(ctx, 0, 2);
    generateDruidWolfSprites(ctx, 0, 3);
    generateDruidLunarSprites(ctx, 0, 4);
    generateShamanSprites(ctx, 0, 5);

    // Enemy sprites on the right side
    generateImpSprites(ctx, 4, 0);
    generateSkeletonSprites(ctx, 4, 1);
    generateZombieSprites(ctx, 4, 2);
    generateDemonKnightSprites(ctx, 4, 3);
    generateLichSprites(ctx, 4, 4);

    return canvas;
}

function drawPixel(ctx, x, y, color, baseX, baseY) {
    ctx.fillStyle = color;
    ctx.fillRect(baseX + x * 2, baseY + y * 2, 2, 2);
}

function generateWarriorSprites(ctx, col, row) {
    const colors = {
        skin: '#e8b89d',
        armor: '#8b4513',
        armorLight: '#a0522d',
        armorDark: '#5c3010',
        helmet: '#708090',
        helmetLight: '#a0a0a0',
        sword: '#c0c0c0',
        swordHandle: '#4a3728'
    };

    for (let frame = 0; frame < 4; frame++) {
        const baseX = (col + frame) * SPRITE_SIZE;
        const baseY = row * SPRITE_SIZE;
        const bounce = (frame % 2 === 1) ? -1 : 0;

        // Helmet
        for (let x = 5; x <= 10; x++) {
            drawPixel(ctx, x, 2 + bounce, colors.helmet, baseX, baseY);
        }
        for (let x = 4; x <= 11; x++) {
            drawPixel(ctx, x, 3 + bounce, colors.helmet, baseX, baseY);
            drawPixel(ctx, x, 4 + bounce, x < 6 || x > 9 ? colors.helmet : colors.helmetLight, baseX, baseY);
        }

        // Face
        for (let x = 5; x <= 10; x++) {
            drawPixel(ctx, x, 5 + bounce, colors.skin, baseX, baseY);
            drawPixel(ctx, x, 6 + bounce, colors.skin, baseX, baseY);
        }

        // Body armor
        for (let y = 7; y <= 11; y++) {
            for (let x = 4; x <= 11; x++) {
                const c = (x === 4 || x === 11) ? colors.armorDark :
                         (x === 5 || x === 10) ? colors.armor : colors.armorLight;
                drawPixel(ctx, x, y + bounce, c, baseX, baseY);
            }
        }

        // Legs
        const legOffset = frame < 2 ? 0 : (frame === 2 ? 1 : -1);
        for (let y = 12; y <= 14; y++) {
            drawPixel(ctx, 5, y, colors.armorDark, baseX, baseY);
            drawPixel(ctx, 6, y, colors.armor, baseX, baseY);
            drawPixel(ctx, 9 + (y === 14 ? legOffset : 0), y, colors.armor, baseX, baseY);
            drawPixel(ctx, 10 + (y === 14 ? legOffset : 0), y, colors.armorDark, baseX, baseY);
        }

        // Sword (right side)
        for (let y = 4; y <= 12; y++) {
            drawPixel(ctx, 13, y + bounce, y < 6 ? colors.swordHandle : colors.sword, baseX, baseY);
        }
        drawPixel(ctx, 12, 4 + bounce, colors.sword, baseX, baseY);
        drawPixel(ctx, 14, 4 + bounce, colors.sword, baseX, baseY);
    }
}

function generateDruidHumanSprites(ctx, col, row) {
    const colors = {
        skin: '#e8b89d',
        hair: '#2d5016',
        robe: '#228b22',
        robeLight: '#32cd32',
        robeDark: '#006400',
        staff: '#8b4513',
        gem: '#90ee90'
    };

    for (let frame = 0; frame < 4; frame++) {
        const baseX = (col + frame) * SPRITE_SIZE;
        const baseY = row * SPRITE_SIZE;
        const bounce = (frame % 2 === 1) ? -1 : 0;

        // Hair
        for (let x = 5; x <= 10; x++) {
            drawPixel(ctx, x, 2 + bounce, colors.hair, baseX, baseY);
            drawPixel(ctx, x, 3 + bounce, colors.hair, baseX, baseY);
        }

        // Face
        for (let x = 5; x <= 10; x++) {
            drawPixel(ctx, x, 4 + bounce, colors.skin, baseX, baseY);
            drawPixel(ctx, x, 5 + bounce, colors.skin, baseX, baseY);
            drawPixel(ctx, x, 6 + bounce, colors.skin, baseX, baseY);
        }

        // Robe
        for (let y = 7; y <= 14; y++) {
            const width = Math.min(y - 4, 6);
            for (let x = 8 - width; x <= 7 + width; x++) {
                const c = (x <= 8 - width + 1 || x >= 7 + width - 1) ? colors.robeDark :
                         (x <= 8 - width + 2 || x >= 7 + width - 2) ? colors.robe : colors.robeLight;
                drawPixel(ctx, x, y + (y < 12 ? bounce : 0), c, baseX, baseY);
            }
        }

        // Staff
        for (let y = 3; y <= 14; y++) {
            drawPixel(ctx, 13, y + bounce, colors.staff, baseX, baseY);
        }
        drawPixel(ctx, 12, 2 + bounce, colors.gem, baseX, baseY);
        drawPixel(ctx, 13, 2 + bounce, colors.gem, baseX, baseY);
        drawPixel(ctx, 14, 2 + bounce, colors.gem, baseX, baseY);
        drawPixel(ctx, 13, 1 + bounce, colors.gem, baseX, baseY);
    }
}

function generateDruidBearSprites(ctx, col, row) {
    const colors = {
        fur: '#8b4513',
        furLight: '#a0522d',
        furDark: '#5c3317',
        nose: '#2f1810',
        eyes: '#2f1810',
        claws: '#3d3d3d'
    };

    for (let frame = 0; frame < 4; frame++) {
        const baseX = (col + frame) * SPRITE_SIZE;
        const baseY = row * SPRITE_SIZE;
        const bounce = (frame % 2 === 1) ? -1 : 0;

        // Bear head
        for (let x = 4; x <= 11; x++) {
            for (let y = 2; y <= 6; y++) {
                const c = (x === 4 || x === 11 || y === 2) ? colors.furDark :
                         (x === 5 || x === 10) ? colors.fur : colors.furLight;
                drawPixel(ctx, x, y + bounce, c, baseX, baseY);
            }
        }
        // Ears
        drawPixel(ctx, 3, 2 + bounce, colors.fur, baseX, baseY);
        drawPixel(ctx, 4, 1 + bounce, colors.fur, baseX, baseY);
        drawPixel(ctx, 11, 1 + bounce, colors.fur, baseX, baseY);
        drawPixel(ctx, 12, 2 + bounce, colors.fur, baseX, baseY);
        // Eyes and nose
        drawPixel(ctx, 5, 4 + bounce, colors.eyes, baseX, baseY);
        drawPixel(ctx, 10, 4 + bounce, colors.eyes, baseX, baseY);
        drawPixel(ctx, 7, 5 + bounce, colors.nose, baseX, baseY);
        drawPixel(ctx, 8, 5 + bounce, colors.nose, baseX, baseY);

        // Bear body (big and bulky)
        for (let y = 7; y <= 12; y++) {
            for (let x = 2; x <= 13; x++) {
                const c = (x <= 3 || x >= 12) ? colors.furDark :
                         (x <= 5 || x >= 10) ? colors.fur : colors.furLight;
                drawPixel(ctx, x, y + bounce, c, baseX, baseY);
            }
        }

        // Legs
        const legOffset = frame < 2 ? 0 : (frame === 2 ? 1 : -1);
        for (let y = 13; y <= 15; y++) {
            drawPixel(ctx, 3, y, colors.fur, baseX, baseY);
            drawPixel(ctx, 4, y, colors.furLight, baseX, baseY);
            drawPixel(ctx, 5, y, colors.fur, baseX, baseY);
            drawPixel(ctx, 10 + legOffset, y, colors.fur, baseX, baseY);
            drawPixel(ctx, 11 + legOffset, y, colors.furLight, baseX, baseY);
            drawPixel(ctx, 12 + legOffset, y, colors.fur, baseX, baseY);
        }
        // Claws
        drawPixel(ctx, 3, 15, colors.claws, baseX, baseY);
        drawPixel(ctx, 5, 15, colors.claws, baseX, baseY);
        drawPixel(ctx, 10 + legOffset, 15, colors.claws, baseX, baseY);
        drawPixel(ctx, 12 + legOffset, 15, colors.claws, baseX, baseY);
    }
}

function generateDruidWolfSprites(ctx, col, row) {
    const colors = {
        fur: '#505050',
        furLight: '#707070',
        furDark: '#303030',
        eyes: '#ffff00',
        nose: '#1a1a1a'
    };

    for (let frame = 0; frame < 4; frame++) {
        const baseX = (col + frame) * SPRITE_SIZE;
        const baseY = row * SPRITE_SIZE;
        const runOffset = frame < 2 ? 0 : (frame === 2 ? 2 : -1);

        // Wolf head (pointed snout)
        for (let x = 5; x <= 10; x++) {
            drawPixel(ctx, x, 4, colors.fur, baseX, baseY);
            drawPixel(ctx, x, 5, colors.furLight, baseX, baseY);
        }
        // Ears
        drawPixel(ctx, 5, 2, colors.fur, baseX, baseY);
        drawPixel(ctx, 5, 3, colors.furLight, baseX, baseY);
        drawPixel(ctx, 10, 2, colors.fur, baseX, baseY);
        drawPixel(ctx, 10, 3, colors.furLight, baseX, baseY);
        // Snout
        for (let x = 11; x <= 14; x++) {
            drawPixel(ctx, x, 5, colors.fur, baseX, baseY);
            drawPixel(ctx, x, 6, colors.furLight, baseX, baseY);
        }
        drawPixel(ctx, 14, 5, colors.nose, baseX, baseY);
        // Eyes
        drawPixel(ctx, 6, 4, colors.eyes, baseX, baseY);
        drawPixel(ctx, 9, 4, colors.eyes, baseX, baseY);

        // Wolf body (sleek, horizontal)
        for (let y = 6; y <= 9; y++) {
            for (let x = 3; x <= 12; x++) {
                const c = y === 6 ? colors.furDark :
                         y === 9 ? colors.furDark : colors.furLight;
                drawPixel(ctx, x, y, c, baseX, baseY);
            }
        }

        // Legs (4 legs, running animation)
        // Front legs
        drawPixel(ctx, 10, 10, colors.fur, baseX, baseY);
        drawPixel(ctx, 10, 11 + runOffset, colors.fur, baseX, baseY);
        drawPixel(ctx, 11, 10, colors.fur, baseX, baseY);
        drawPixel(ctx, 11, 11 - runOffset, colors.fur, baseX, baseY);
        // Back legs
        drawPixel(ctx, 4, 10, colors.fur, baseX, baseY);
        drawPixel(ctx, 4, 11 - runOffset, colors.fur, baseX, baseY);
        drawPixel(ctx, 5, 10, colors.fur, baseX, baseY);
        drawPixel(ctx, 5, 11 + runOffset, colors.fur, baseX, baseY);

        // Tail
        drawPixel(ctx, 2, 7, colors.fur, baseX, baseY);
        drawPixel(ctx, 1, 6, colors.fur, baseX, baseY);
        drawPixel(ctx, 0, 5, colors.furLight, baseX, baseY);
    }
}

function generateDruidLunarSprites(ctx, col, row) {
    const colors = {
        skin: '#c8b8d8',
        hair: '#4a0080',
        robe: '#1a0033',
        robeLight: '#2d0052',
        robeMid: '#220040',
        stars: '#ffffff',
        moon: '#fffacd',
        glow: '#9370db'
    };

    for (let frame = 0; frame < 4; frame++) {
        const baseX = (col + frame) * SPRITE_SIZE;
        const baseY = row * SPRITE_SIZE;
        const bounce = (frame % 2 === 1) ? -1 : 0;
        const glowPhase = frame % 2;

        // Mystical hair (flowing)
        for (let x = 4; x <= 11; x++) {
            drawPixel(ctx, x, 2 + bounce, colors.hair, baseX, baseY);
            drawPixel(ctx, x, 3 + bounce, colors.hair, baseX, baseY);
        }
        drawPixel(ctx, 3, 3 + bounce, colors.hair, baseX, baseY);
        drawPixel(ctx, 12, 3 + bounce, colors.hair, baseX, baseY);

        // Face (pale)
        for (let x = 5; x <= 10; x++) {
            drawPixel(ctx, x, 4 + bounce, colors.skin, baseX, baseY);
            drawPixel(ctx, x, 5 + bounce, colors.skin, baseX, baseY);
            drawPixel(ctx, x, 6 + bounce, colors.skin, baseX, baseY);
        }
        // Glowing eyes
        drawPixel(ctx, 6, 5 + bounce, colors.glow, baseX, baseY);
        drawPixel(ctx, 9, 5 + bounce, colors.glow, baseX, baseY);

        // Star-covered robe
        for (let y = 7; y <= 14; y++) {
            const width = Math.min(y - 4, 6);
            for (let x = 8 - width; x <= 7 + width; x++) {
                let c = colors.robe;
                if (x === 8 - width || x === 7 + width) c = colors.robeLight;
                else if ((x + y + frame) % 4 === 0) c = colors.stars;
                else if ((x + y) % 3 === 0) c = colors.robeMid;
                drawPixel(ctx, x, y + (y < 12 ? bounce : 0), c, baseX, baseY);
            }
        }

        // Floating moon orb
        const orbY = 3 + bounce + (glowPhase ? -1 : 0);
        drawPixel(ctx, 13, orbY, colors.moon, baseX, baseY);
        drawPixel(ctx, 14, orbY, colors.moon, baseX, baseY);
        drawPixel(ctx, 13, orbY + 1, colors.moon, baseX, baseY);
        drawPixel(ctx, 14, orbY + 1, colors.moon, baseX, baseY);
        // Glow effect
        if (glowPhase) {
            drawPixel(ctx, 12, orbY, colors.glow, baseX, baseY);
            drawPixel(ctx, 15, orbY + 1, colors.glow, baseX, baseY);
        }
    }
}

function generateShamanSprites(ctx, col, row) {
    const colors = {
        skin: '#8b6914',
        mask: '#deb887',
        maskDark: '#a08060',
        robe: '#4a0082',
        robeLight: '#6a2092',
        robeDark: '#2a0052',
        feathers: '#ff4500',
        feathers2: '#ffd700',
        staff: '#654321',
        skull: '#f0f0e0'
    };

    for (let frame = 0; frame < 4; frame++) {
        const baseX = (col + frame) * SPRITE_SIZE;
        const baseY = row * SPRITE_SIZE;
        const bounce = (frame % 2 === 1) ? -1 : 0;

        // Feather headdress
        drawPixel(ctx, 6, 0 + bounce, colors.feathers, baseX, baseY);
        drawPixel(ctx, 7, 0 + bounce, colors.feathers2, baseX, baseY);
        drawPixel(ctx, 8, 0 + bounce, colors.feathers, baseX, baseY);
        drawPixel(ctx, 9, 0 + bounce, colors.feathers2, baseX, baseY);
        drawPixel(ctx, 5, 1 + bounce, colors.feathers, baseX, baseY);
        drawPixel(ctx, 10, 1 + bounce, colors.feathers, baseX, baseY);

        // Tribal mask
        for (let x = 5; x <= 10; x++) {
            drawPixel(ctx, x, 2 + bounce, colors.mask, baseX, baseY);
            drawPixel(ctx, x, 3 + bounce, colors.mask, baseX, baseY);
            drawPixel(ctx, x, 4 + bounce, colors.maskDark, baseX, baseY);
        }
        // Mask eyes (hollow)
        drawPixel(ctx, 6, 3 + bounce, '#000000', baseX, baseY);
        drawPixel(ctx, 9, 3 + bounce, '#000000', baseX, baseY);
        // Mask mouth
        drawPixel(ctx, 7, 4 + bounce, '#000000', baseX, baseY);
        drawPixel(ctx, 8, 4 + bounce, '#000000', baseX, baseY);

        // Body showing below mask
        for (let x = 5; x <= 10; x++) {
            drawPixel(ctx, x, 5 + bounce, colors.skin, baseX, baseY);
            drawPixel(ctx, x, 6 + bounce, colors.skin, baseX, baseY);
        }

        // Robe
        for (let y = 7; y <= 14; y++) {
            const width = Math.min(y - 5, 5);
            for (let x = 8 - width; x <= 7 + width; x++) {
                const c = (x === 8 - width || x === 7 + width) ? colors.robeDark :
                         (x === 8 - width + 1 || x === 7 + width - 1) ? colors.robe : colors.robeLight;
                drawPixel(ctx, x, y + (y < 12 ? bounce : 0), c, baseX, baseY);
            }
        }

        // Spirit staff with skull
        for (let y = 4; y <= 14; y++) {
            drawPixel(ctx, 13, y + bounce, colors.staff, baseX, baseY);
        }
        // Skull on top
        drawPixel(ctx, 12, 2 + bounce, colors.skull, baseX, baseY);
        drawPixel(ctx, 13, 2 + bounce, colors.skull, baseX, baseY);
        drawPixel(ctx, 14, 2 + bounce, colors.skull, baseX, baseY);
        drawPixel(ctx, 12, 3 + bounce, colors.skull, baseX, baseY);
        drawPixel(ctx, 13, 3 + bounce, '#000000', baseX, baseY);
        drawPixel(ctx, 14, 3 + bounce, colors.skull, baseX, baseY);
    }
}

// Enemy sprite generators
function generateImpSprites(ctx, col, row) {
    const colors = { body: '#cc3333', bodyLight: '#ff5555', horns: '#880000', eyes: '#ffff00' };
    for (let frame = 0; frame < 4; frame++) {
        const baseX = (col + frame) * SPRITE_SIZE;
        const baseY = row * SPRITE_SIZE;
        const bounce = (frame % 2 === 1) ? -1 : 0;
        // Small demon body
        for (let y = 5; y <= 10; y++) {
            for (let x = 5; x <= 10; x++) {
                drawPixel(ctx, x, y + bounce, (x === 5 || x === 10) ? colors.body : colors.bodyLight, baseX, baseY);
            }
        }
        // Horns
        drawPixel(ctx, 5, 3 + bounce, colors.horns, baseX, baseY);
        drawPixel(ctx, 6, 4 + bounce, colors.horns, baseX, baseY);
        drawPixel(ctx, 10, 3 + bounce, colors.horns, baseX, baseY);
        drawPixel(ctx, 9, 4 + bounce, colors.horns, baseX, baseY);
        // Eyes
        drawPixel(ctx, 6, 6 + bounce, colors.eyes, baseX, baseY);
        drawPixel(ctx, 9, 6 + bounce, colors.eyes, baseX, baseY);
        // Legs
        drawPixel(ctx, 6, 11, colors.body, baseX, baseY);
        drawPixel(ctx, 9, 11, colors.body, baseX, baseY);
    }
}

function generateSkeletonSprites(ctx, col, row) {
    const colors = { bone: '#e8e8d0', boneDark: '#c8c8b0' };
    for (let frame = 0; frame < 4; frame++) {
        const baseX = (col + frame) * SPRITE_SIZE;
        const baseY = row * SPRITE_SIZE;
        const bounce = (frame % 2 === 1) ? -1 : 0;
        // Skull
        for (let x = 5; x <= 10; x++) {
            for (let y = 2; y <= 5; y++) {
                drawPixel(ctx, x, y + bounce, colors.bone, baseX, baseY);
            }
        }
        drawPixel(ctx, 6, 4 + bounce, '#000000', baseX, baseY);
        drawPixel(ctx, 9, 4 + bounce, '#000000', baseX, baseY);
        // Ribcage
        for (let y = 6; y <= 10; y++) {
            drawPixel(ctx, 5, y + bounce, colors.bone, baseX, baseY);
            drawPixel(ctx, 7, y + bounce, colors.boneDark, baseX, baseY);
            drawPixel(ctx, 8, y + bounce, colors.boneDark, baseX, baseY);
            drawPixel(ctx, 10, y + bounce, colors.bone, baseX, baseY);
        }
        // Legs
        const offset = frame === 2 ? 1 : frame === 3 ? -1 : 0;
        drawPixel(ctx, 6, 11, colors.bone, baseX, baseY);
        drawPixel(ctx, 6 + offset, 12, colors.bone, baseX, baseY);
        drawPixel(ctx, 9, 11, colors.bone, baseX, baseY);
        drawPixel(ctx, 9 - offset, 12, colors.bone, baseX, baseY);
    }
}

function generateZombieSprites(ctx, col, row) {
    const colors = { skin: '#4a7a4a', skinDark: '#3a5a3a', clothes: '#4a4a4a', blood: '#8b0000' };
    for (let frame = 0; frame < 4; frame++) {
        const baseX = (col + frame) * SPRITE_SIZE;
        const baseY = row * SPRITE_SIZE;
        const bounce = (frame % 2 === 1) ? -1 : 0;
        // Head
        for (let x = 5; x <= 10; x++) {
            for (let y = 2; y <= 6; y++) {
                drawPixel(ctx, x, y + bounce, colors.skin, baseX, baseY);
            }
        }
        drawPixel(ctx, 6, 4 + bounce, '#880000', baseX, baseY);
        drawPixel(ctx, 9, 4 + bounce, colors.skinDark, baseX, baseY);
        drawPixel(ctx, 7, 6 + bounce, colors.blood, baseX, baseY);
        // Body
        for (let y = 7; y <= 12; y++) {
            for (let x = 4; x <= 11; x++) {
                drawPixel(ctx, x, y + bounce, (y > 9) ? colors.clothes : colors.skin, baseX, baseY);
            }
        }
        // Arms reaching forward
        drawPixel(ctx, 12, 8 + bounce, colors.skin, baseX, baseY);
        drawPixel(ctx, 13, 8 + bounce, colors.skin, baseX, baseY);
        drawPixel(ctx, 3, 9 + bounce, colors.skin, baseX, baseY);
    }
}

function generateDemonKnightSprites(ctx, col, row) {
    const colors = { armor: '#2a0a0a', armorLight: '#4a1a1a', eyes: '#ff0000', sword: '#303030' };
    for (let frame = 0; frame < 4; frame++) {
        const baseX = (col + frame) * SPRITE_SIZE;
        const baseY = row * SPRITE_SIZE;
        const bounce = (frame % 2 === 1) ? -1 : 0;
        // Horned helmet
        drawPixel(ctx, 4, 1 + bounce, colors.armorLight, baseX, baseY);
        drawPixel(ctx, 11, 1 + bounce, colors.armorLight, baseX, baseY);
        for (let x = 4; x <= 11; x++) {
            for (let y = 2; y <= 5; y++) {
                drawPixel(ctx, x, y + bounce, colors.armor, baseX, baseY);
            }
        }
        drawPixel(ctx, 6, 4 + bounce, colors.eyes, baseX, baseY);
        drawPixel(ctx, 9, 4 + bounce, colors.eyes, baseX, baseY);
        // Heavy armor body
        for (let y = 6; y <= 13; y++) {
            for (let x = 3; x <= 12; x++) {
                drawPixel(ctx, x, y + bounce, (x === 3 || x === 12) ? colors.armorLight : colors.armor, baseX, baseY);
            }
        }
        // Dark sword
        for (let y = 2; y <= 13; y++) {
            drawPixel(ctx, 14, y + bounce, colors.sword, baseX, baseY);
        }
    }
}

function generateLichSprites(ctx, col, row) {
    const colors = { robe: '#1a0a2a', robeLight: '#2a1a4a', skull: '#d0d0c0', eyes: '#00ff88', magic: '#8800ff' };
    for (let frame = 0; frame < 4; frame++) {
        const baseX = (col + frame) * SPRITE_SIZE;
        const baseY = row * SPRITE_SIZE;
        const bounce = (frame % 2 === 1) ? -1 : 0;
        // Crown
        drawPixel(ctx, 6, 1 + bounce, colors.magic, baseX, baseY);
        drawPixel(ctx, 8, 1 + bounce, colors.magic, baseX, baseY);
        drawPixel(ctx, 10, 1 + bounce, colors.magic, baseX, baseY);
        // Skull face
        for (let x = 5; x <= 10; x++) {
            for (let y = 2; y <= 6; y++) {
                drawPixel(ctx, x, y + bounce, colors.skull, baseX, baseY);
            }
        }
        drawPixel(ctx, 6, 4 + bounce, colors.eyes, baseX, baseY);
        drawPixel(ctx, 9, 4 + bounce, colors.eyes, baseX, baseY);
        // Robe
        for (let y = 7; y <= 14; y++) {
            const w = Math.min(y - 5, 5);
            for (let x = 8 - w; x <= 7 + w; x++) {
                drawPixel(ctx, x, y + (y < 12 ? bounce : 0),
                    (x === 8 - w || x === 7 + w) ? colors.robeLight : colors.robe, baseX, baseY);
            }
        }
        // Magic orb
        drawPixel(ctx, 13, 5 + bounce, colors.magic, baseX, baseY);
        drawPixel(ctx, 14, 5 + bounce, colors.magic, baseX, baseY);
        if (frame % 2) drawPixel(ctx, 12, 4 + bounce, colors.magic, baseX, baseY);
    }
}

function getTileInfo(spriteIndex, frame = 0) {
    const totalIndex = spriteIndex + frame;
    const x = totalIndex % SPRITES_PER_ROW;
    const y = Math.floor(totalIndex / SPRITES_PER_ROW);
    const tileInfo = new TileInfo(vec2(x * SPRITE_SIZE, y * SPRITE_SIZE), vec2(SPRITE_SIZE, SPRITE_SIZE));
    tileInfo.textureInfo = spriteTexture;
    return tileInfo;
}

// ============================================
// CLASS DEFINITIONS
// ============================================

let CLASS_STATS; // Initialized in gameInit

function initClassStats() {
    CLASS_STATS = {
        warrior: {
            name: 'Warrior',
            maxHp: 120,
            speed: 0.08,
            damage: 15,
            color: new Color(0.8, 0.2, 0.2),
            weapon: 'swordSwing',
            special: 'berserkerRage'
        },
        druid: {
            name: 'Druid',
            maxHp: 100,
            speed: 0.088,
            damage: 10,
            color: new Color(0.2, 0.7, 0.3),
            weapon: 'naturesWrath',
            special: 'shapeshift',
            forms: {
                human: { hpMod: 1, speedMod: 1, damageMod: 1, weapon: 'naturesWrath' },
                bear: { hpMod: 1.5, speedMod: 0.8, damageMod: 1.3, weapon: 'clawSwipe' },
                wolf: { hpMod: 0.9, speedMod: 1.4, damageMod: 1.1, weapon: 'bite', critChance: 0.2 },
                lunar: { hpMod: 0.7, speedMod: 1, damageMod: 1.5, weapon: 'moonfire' }
            }
        },
        shaman: {
            name: 'Shaman',
            maxHp: 80,
            speed: 0.08,
            damage: 18,
            color: new Color(0.5, 0.2, 0.8),
            weapon: 'spiritBolt',
            special: 'ancestralWrath'
        }
    };
}

// ============================================
// ENEMY DEFINITIONS
// ============================================

let ENEMY_TYPES; // Initialized in gameInit

function initEnemyTypes() {
    ENEMY_TYPES = {
        imp: {
            name: 'Imp',
            hp: 10,
            damage: 5,
            speed: 0.06,
            xp: 1,
            color: new Color(1, 0.3, 0.3),
            size: 0.8,
            minWave: 1
        },
        skeleton: {
            name: 'Skeleton',
            hp: 20,
            damage: 8,
            speed: 0.04,
            xp: 2,
            color: new Color(0.9, 0.9, 0.8),
            size: 1,
            minWave: 1
        },
        zombie: {
            name: 'Zombie',
            hp: 40,
            damage: 12,
            speed: 0.025,
            xp: 3,
            color: new Color(0.3, 0.5, 0.3),
            size: 1.1,
            minWave: 3
        },
        demonKnight: {
            name: 'Demon Knight',
            hp: 80,
            damage: 20,
            speed: 0.035,
            xp: 10,
            color: new Color(0.4, 0.1, 0.1),
            size: 1.4,
            minWave: 5
        },
        lich: {
            name: 'Lich',
            hp: 50,
            damage: 15,
            speed: 0.03,
            xp: 8,
            color: new Color(0.3, 0.1, 0.5),
            size: 1.2,
            minWave: 7,
            ranged: true
        }
    };
}

// ============================================
// WEAPON DEFINITIONS
// ============================================

const WEAPONS = {
    swordSwing: {
        name: 'Sword Swing',
        damage: 1,
        cooldown: 0.8,
        range: 2,
        arc: Math.PI * 0.6,
        type: 'melee'
    },
    naturesWrath: {
        name: "Nature's Wrath",
        damage: 0.8,
        cooldown: 1,
        range: 6,
        projectiles: 3,
        spread: 0.3,
        type: 'projectile'
    },
    spiritBolt: {
        name: 'Spirit Bolt',
        damage: 1.2,
        cooldown: 0.6,
        range: 8,
        projectiles: 1,
        type: 'projectile'
    },
    clawSwipe: {
        name: 'Claw Swipe',
        damage: 1.3,
        cooldown: 0.5,
        range: 1.8,
        arc: Math.PI * 0.8,
        type: 'melee'
    },
    bite: {
        name: 'Bite',
        damage: 0.9,
        cooldown: 0.25,
        range: 1.2,
        arc: Math.PI * 0.4,
        type: 'melee'
    },
    moonfire: {
        name: 'Moonfire',
        damage: 1.5,
        cooldown: 0.9,
        range: 10,
        projectiles: 2,
        homing: true,
        type: 'projectile'
    }
};

// ============================================
// UPGRADE DEFINITIONS
// ============================================

const UPGRADES = [
    { id: 'maxHp', name: 'Max HP', desc: '+20 Maximum Health', stat: 'maxHp', value: 20 },
    { id: 'damage', name: 'Damage', desc: '+10% Damage', stat: 'damageMult', value: 0.1 },
    { id: 'speed', name: 'Speed', desc: '+10% Move Speed', stat: 'speedMult', value: 0.1 },
    { id: 'attackSpeed', name: 'Attack Speed', desc: '+15% Attack Speed', stat: 'attackSpeedMult', value: 0.15 },
    { id: 'pickupRange', name: 'Magnet', desc: '+50% Pickup Range', stat: 'pickupRange', value: 0.5 },
    { id: 'regen', name: 'Regeneration', desc: '+1 HP/sec', stat: 'regen', value: 1 },
    { id: 'armor', name: 'Armor', desc: '-10% Damage Taken', stat: 'armor', value: 0.1 },
    { id: 'luck', name: 'Luck', desc: '+10% Crit Chance', stat: 'critChance', value: 0.1 }
];

// ============================================
// PLAYER CLASS
// ============================================

class Player extends EngineObject {
    constructor(pos, classType) {
        super(pos, vec2(1, 1));
        this.classType = classType;
        this.classData = CLASS_STATS[classType];

        // Apply meta upgrades
        const metaHpBonus = metaUpgrades.maxHp * 10;
        const metaDamageBonus = metaUpgrades.damage * 0.05;
        const metaSpeedBonus = metaUpgrades.speed * 0.05;

        // Base stats
        this.maxHp = this.classData.maxHp + metaHpBonus;
        this.hp = this.maxHp;
        this.baseSpeed = this.classData.speed * (1 + metaSpeedBonus);
        this.baseDamage = this.classData.damage * (1 + metaDamageBonus);

        // Modifiers (from upgrades)
        this.damageMult = 1;
        this.speedMult = 1;
        this.attackSpeedMult = 1;
        this.pickupRange = 2;
        this.regen = 0;
        this.armor = 0;
        this.critChance = 0;

        // XP and leveling
        this.xp = 0;
        this.level = 1;
        this.xpToLevel = 10;

        // Weapon
        this.currentWeapon = this.classData.weapon;
        this.weaponTimer = 0;
        this.weaponLevels = {};
        this.weaponLevels[this.currentWeapon] = 1;

        // Druid specific
        this.currentForm = 'human';
        this.shapeshiftCooldown = 0;

        // Visual
        this.color = this.classData.color;
        this.renderOrder = 10;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.isMoving = false;
        this.facingLeft = false;

        // Invincibility frames
        this.invincibleTime = 0;

        // Special ability
        this.specialCooldown = 0;
        this.specialActive = false;
        this.specialDuration = 0;
    }

    update() {
        super.update();

        if (gameState !== 'playing') return;

        // Movement
        let moveDir = vec2(0, 0);
        if (keyIsDown('KeyW') || keyIsDown('ArrowUp')) moveDir.y += 1;
        if (keyIsDown('KeyS') || keyIsDown('ArrowDown')) moveDir.y -= 1;
        if (keyIsDown('KeyA') || keyIsDown('ArrowLeft')) moveDir.x -= 1;
        if (keyIsDown('KeyD') || keyIsDown('ArrowRight')) moveDir.x += 1;

        if (moveDir.length() > 0) {
            moveDir = moveDir.normalize();
            let speed = this.baseSpeed * this.speedMult;

            // Apply form modifiers for druid
            if (this.classType === 'druid') {
                const formData = this.classData.forms[this.currentForm];
                speed *= formData.speedMod;
            }

            this.pos = this.pos.add(moveDir.scale(speed));
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }

        // Always track facing direction based on mouse (even when not moving)
        const toMouseFacing = mousePos.subtract(this.pos);
        this.facingLeft = toMouseFacing.x < 0;

        // Update animation
        this.animTimer += timeDelta;
        if (this.animTimer > 0.15) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        // Clamp to world bounds
        this.pos.x = clamp(this.pos.x, 1, WORLD_SIZE.x - 1);
        this.pos.y = clamp(this.pos.y, 1, WORLD_SIZE.y - 1);

        // Update camera
        cameraPos = this.pos;

        // Weapon attack
        this.weaponTimer -= timeDelta;
        if (this.weaponTimer <= 0) {
            this.attack();
        }

        // Regeneration
        if (this.regen > 0) {
            this.hp = Math.min(this.maxHp, this.hp + this.regen * timeDelta);
            updateHUD();
        }

        // Invincibility
        if (this.invincibleTime > 0) {
            this.invincibleTime -= timeDelta;
        }

        // Shapeshift cooldown
        if (this.shapeshiftCooldown > 0) {
            this.shapeshiftCooldown -= timeDelta;
            updateFormButtons();
        }

        // Special ability cooldown
        if (this.specialCooldown > 0) {
            this.specialCooldown -= timeDelta;
        }

        // Special ability duration
        if (this.specialActive && this.specialDuration > 0) {
            this.specialDuration -= timeDelta;
            if (this.specialDuration <= 0) {
                this.endSpecial();
            }
        }

        // Druid form hotkeys
        if (this.classType === 'druid') {
            if (keyWasPressed('Digit1')) shapeshift('human');
            if (keyWasPressed('Digit2')) shapeshift('bear');
            if (keyWasPressed('Digit3')) shapeshift('wolf');
            if (keyWasPressed('Digit4')) shapeshift('lunar');
            if (keyWasPressed('ShiftLeft') || keyWasPressed('ShiftRight')) {
                const forms = ['human', 'bear', 'wolf', 'lunar'];
                const currentIndex = forms.indexOf(this.currentForm);
                const nextForm = forms[(currentIndex + 1) % forms.length];
                shapeshift(nextForm);
            }
        }

        // Special ability (Space)
        if (keyWasPressed('Space') && this.specialCooldown <= 0) {
            this.useSpecial();
        }

        // Pickup collection
        for (let pickup of pickups) {
            const dist = this.pos.distance(pickup.pos);
            if (dist < this.pickupRange) {
                // Move pickup toward player
                const dir = this.pos.subtract(pickup.pos).normalize();
                pickup.pos = pickup.pos.add(dir.scale(0.2));
            }
            if (dist < 0.5) {
                pickup.collect();
            }
        }
    }

    attack() {
        let weaponKey = this.currentWeapon;

        // Druid form weapon override
        if (this.classType === 'druid') {
            const formData = this.classData.forms[this.currentForm];
            weaponKey = formData.weapon;
        }

        const weapon = WEAPONS[weaponKey];
        const level = this.weaponLevels[weaponKey] || 1;

        let cooldown = weapon.cooldown / this.attackSpeedMult;
        let damage = this.baseDamage * weapon.damage * this.damageMult * (1 + (level - 1) * 0.2);

        // Apply form damage modifier
        if (this.classType === 'druid') {
            const formData = this.classData.forms[this.currentForm];
            damage *= formData.damageMod;
        }

        // Apply berserker rage
        if (this.specialActive && this.classData.special === 'berserkerRage') {
            damage *= 1.5;
        }

        // Aim toward mouse position
        const toMouse = mousePos.subtract(this.pos);
        const attackDir = toMouse.length() > 0.1 ? toMouse.normalize() : vec2(1, 0);

        if (weapon.type === 'melee') {
            // Melee attack - hit all enemies in arc

            for (let enemy of enemies) {
                const toEnemy = enemy.pos.subtract(this.pos);
                const dist = toEnemy.length();
                if (dist <= weapon.range * (1 + (level - 1) * 0.15)) {
                    // Calculate angle difference with proper wrap-around handling
                    let angleDiff = Math.abs(toEnemy.angle() - attackDir.angle());
                    if (angleDiff > Math.PI) {
                        angleDiff = 2 * Math.PI - angleDiff;
                    }
                    if (angleDiff <= weapon.arc / 2) {
                        let finalDamage = damage;
                        // Crit check (wolf form)
                        let crit = this.critChance;
                        if (this.classType === 'druid' && this.currentForm === 'wolf') {
                            crit += 0.2;
                        }
                        if (Math.random() < crit) {
                            finalDamage *= 2;
                        }
                        enemy.takeDamage(finalDamage);
                    }
                }
            }

            // Visual effect
            new MeleeEffect(this.pos, attackDir, weapon.range, weapon.arc, this.classData.color);

        } else if (weapon.type === 'projectile') {
            // Projectile attack - aim toward mouse
            const projectileCount = weapon.projectiles + Math.floor((level - 1) / 2);

            for (let i = 0; i < projectileCount; i++) {
                let dir = attackDir;
                if (projectileCount > 1) {
                    const spreadAngle = weapon.spread || 0.2;
                    const angleOffset = (i - (projectileCount - 1) / 2) * spreadAngle;
                    // Use rotate() instead of manual cos/sin to handle LittleJS angle convention
                    dir = attackDir.rotate(angleOffset);
                }

                const proj = new Projectile(
                    this.pos.add(dir.scale(0.5)),
                    dir,
                    damage,
                    weapon.range,
                    weapon.homing,
                    this.classData.color
                );
                projectiles.push(proj);
            }
        }

        this.weaponTimer = cooldown;
    }

    useSpecial() {
        const special = this.classData.special;

        if (special === 'berserkerRage') {
            this.specialActive = true;
            this.specialDuration = 5;
            this.specialCooldown = 30;
            this.color = new Color(1, 0.5, 0);
        } else if (special === 'ancestralWrath') {
            // Lightning burst around player
            this.specialCooldown = 20;
            for (let enemy of enemies) {
                if (this.pos.distance(enemy.pos) < 5) {
                    enemy.takeDamage(this.baseDamage * 3);
                    new LightningEffect(this.pos, enemy.pos);
                }
            }
        }
    }

    endSpecial() {
        this.specialActive = false;
        this.color = this.classData.color;
    }

    takeDamage(amount) {
        if (this.invincibleTime > 0) return;

        // Apply armor
        amount *= (1 - this.armor);

        this.hp -= amount;
        this.invincibleTime = 0.5;

        updateHUD();

        // Flash red
        this.color = new Color(1, 0, 0);
        setTimeout(() => {
            if (this.classType === 'druid') {
                this.updateFormColor();
            } else {
                this.color = this.classData.color;
            }
        }, 100);

        if (this.hp <= 0) {
            gameOver();
        }
    }

    gainXP(amount) {
        // Apply meta XP bonus
        amount *= (1 + metaUpgrades.xpGain * 0.1);

        this.xp += amount;

        while (this.xp >= this.xpToLevel) {
            this.xp -= this.xpToLevel;
            this.level++;
            this.xpToLevel = Math.floor(this.xpToLevel * 1.5);
            showLevelUp();
        }

        updateHUD();
    }

    applyUpgrade(upgrade) {
        switch (upgrade.stat) {
            case 'maxHp':
                this.maxHp += upgrade.value;
                this.hp += upgrade.value;
                break;
            case 'damageMult':
                this.damageMult += upgrade.value;
                break;
            case 'speedMult':
                this.speedMult += upgrade.value;
                break;
            case 'attackSpeedMult':
                this.attackSpeedMult += upgrade.value;
                break;
            case 'pickupRange':
                this.pickupRange += upgrade.value;
                break;
            case 'regen':
                this.regen += upgrade.value;
                break;
            case 'armor':
                this.armor = Math.min(0.8, this.armor + upgrade.value);
                break;
            case 'critChance':
                this.critChance = Math.min(0.8, this.critChance + upgrade.value);
                break;
        }
        updateHUD();
    }

    shapeshift(form) {
        if (this.classType !== 'druid') return;
        if (this.shapeshiftCooldown > 0) return;
        if (this.currentForm === form) return;

        const oldForm = this.classData.forms[this.currentForm];
        const newForm = this.classData.forms[form];

        // Adjust HP proportionally
        const hpPercent = this.hp / (this.maxHp * oldForm.hpMod);
        this.currentForm = form;
        this.hp = hpPercent * this.maxHp * newForm.hpMod;

        // Update visuals
        this.updateFormColor();

        // Set cooldown
        this.shapeshiftCooldown = 2;

        updateFormButtons();
        updateHUD();
    }

    updateFormColor() {
        const formColors = {
            human: new Color(0.2, 0.7, 0.3),
            bear: new Color(0.5, 0.3, 0.1),
            wolf: new Color(0.4, 0.4, 0.4),
            lunar: new Color(0.6, 0.5, 0.9)
        };
        this.color = formColors[this.currentForm];
    }

    render() {
        // Get sprite index based on class and form
        let spriteIndex;
        if (this.classType === 'warrior') {
            spriteIndex = SPRITE_INDEX.warrior;
        } else if (this.classType === 'shaman') {
            spriteIndex = SPRITE_INDEX.shaman;
        } else if (this.classType === 'druid') {
            spriteIndex = SPRITE_INDEX['druid_' + this.currentForm];
        }

        // Get animation frame (use frames 2-3 when moving, 0-1 when idle)
        let frame = this.isMoving ? 2 + (this.animFrame % 2) : (this.animFrame % 2);

        // Draw sprite
        const formSize = this.classType === 'druid' && this.currentForm === 'bear' ? 1.5 : 1.2;
        const tileInfo = getTileInfo(spriteIndex, frame);

        // Flash white when invincible
        const drawColor = this.invincibleTime > 0 && Math.floor(this.invincibleTime * 10) % 2 ?
            new Color(1, 1, 1) : new Color(1, 1, 1);

        drawTile(this.pos, vec2(formSize, formSize), tileInfo, drawColor, 0, this.facingLeft);
    }
}

// ============================================
// ENEMY CLASS
// ============================================

class Enemy extends EngineObject {
    constructor(pos, type) {
        const data = ENEMY_TYPES[type];
        super(pos, vec2(data.size, data.size));

        this.type = type;
        this.data = data;
        this.hp = data.hp * (1 + (currentWave - 1) * 0.1);
        this.maxHp = this.hp;
        this.damage = data.damage * (1 + (currentWave - 1) * 0.05);
        this.speed = data.speed;
        this.xpValue = data.xp;

        this.color = data.color;
        this.damageTimer = 0;
        this.rangedTimer = 0;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.facingLeft = false;
        this.flashTimer = 0;
    }

    update() {
        super.update();

        if (gameState !== 'playing' || !player) return;

        // Move toward player
        const toPlayer = player.pos.subtract(this.pos);
        const dist = toPlayer.length();

        if (this.data.ranged && dist < 8 && dist > 4) {
            // Ranged enemy - stay at distance and shoot
            this.rangedTimer -= timeDelta;
            if (this.rangedTimer <= 0) {
                this.rangedTimer = 2;
                // Shoot at player
                const dir = toPlayer.normalize();
                const proj = new EnemyProjectile(this.pos, dir, this.damage);
                projectiles.push(proj);
            }
        } else {
            // Move toward player
            if (dist > 0.5) {
                const dir = toPlayer.normalize();
                this.pos = this.pos.add(dir.scale(this.speed));
            }
        }

        // Damage player on contact
        this.damageTimer -= timeDelta;
        if (dist < 0.8 && this.damageTimer <= 0) {
            player.takeDamage(this.damage);
            this.damageTimer = 1;
        }

        // Update animation
        this.animTimer += timeDelta;
        if (this.animTimer > 0.2) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        // Track facing direction
        if (player) {
            this.facingLeft = player.pos.x < this.pos.x;
        }

        // Flash timer
        if (this.flashTimer > 0) {
            this.flashTimer -= timeDelta;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;

        // Flash white
        this.flashTimer = 0.1;

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        // Drop XP
        new XPOrb(this.pos, this.xpValue);

        // Chance to drop gold
        if (Math.random() < 0.3) {
            new GoldPickup(this.pos, Math.ceil(this.xpValue * 2));
        }

        // Chance to drop health
        if (Math.random() < 0.1) {
            new HealthPickup(this.pos);
        }

        // Remove from enemies array
        const index = enemies.indexOf(this);
        if (index > -1) enemies.splice(index, 1);

        killCount++;
        updateHUD();

        this.destroy();
    }

    render() {
        // Get sprite index for this enemy type
        const spriteIndex = SPRITE_INDEX[this.type];

        // Get tile info with animation frame
        const tileInfo = getTileInfo(spriteIndex, this.animFrame % 4);

        // Flash white when taking damage
        const drawColor = this.flashTimer > 0 ? new Color(1, 1, 1) : new Color(1, 1, 1);

        // Draw sprite
        const drawSize = this.data.size * 1.2;
        drawTile(this.pos, vec2(drawSize, drawSize), tileInfo, drawColor, 0, this.facingLeft);

        // Health bar
        if (this.hp < this.maxHp) {
            const barWidth = this.size.x;
            const barHeight = 0.15;
            const barPos = this.pos.add(vec2(0, this.size.y / 2 + 0.3));
            drawRect(barPos, vec2(barWidth, barHeight), new Color(0.3, 0.3, 0.3));
            drawRect(
                barPos.subtract(vec2((1 - this.hp / this.maxHp) * barWidth / 2, 0)),
                vec2(barWidth * (this.hp / this.maxHp), barHeight),
                new Color(1, 0, 0)
            );
        }
    }
}

// ============================================
// PROJECTILE CLASSES
// ============================================

class Projectile extends EngineObject {
    constructor(pos, dir, damage, range, homing, color) {
        super(pos, vec2(0.3, 0.3));
        this.dir = dir;
        this.damage = damage;
        this.range = range;
        this.homing = homing;
        this.speed = 0.2;
        this.distanceTraveled = 0;
        this.color = color;
        this.renderOrder = 5;
    }

    update() {
        super.update();

        if (gameState !== 'playing') return;

        // Homing behavior - only after traveling some distance, with gentle correction
        if (this.homing && enemies.length > 0 && this.distanceTraveled > 2) {
            let nearest = null;
            let nearestDist = Infinity;
            for (let enemy of enemies) {
                const dist = this.pos.distance(enemy.pos);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = enemy;
                }
            }
            if (nearest && nearestDist < 6) {
                const toTarget = nearest.pos.subtract(this.pos).normalize();
                // Gentler homing - only 3% correction per frame instead of 10%
                this.dir = this.dir.lerp(toTarget, 0.03).normalize();
            }
        }

        this.pos = this.pos.add(this.dir.scale(this.speed));
        this.distanceTraveled += this.speed;

        // Check enemy collisions
        for (let enemy of enemies) {
            if (this.pos.distance(enemy.pos) < 0.5) {
                enemy.takeDamage(this.damage);
                this.remove();
                return;
            }
        }

        // Remove if traveled too far
        if (this.distanceTraveled > this.range) {
            this.remove();
        }
    }

    remove() {
        const index = projectiles.indexOf(this);
        if (index > -1) projectiles.splice(index, 1);
        this.destroy();
    }
}

class EnemyProjectile extends EngineObject {
    constructor(pos, dir, damage) {
        super(pos, vec2(0.25, 0.25));
        this.dir = dir;
        this.damage = damage;
        this.speed = 0.1;
        this.distanceTraveled = 0;
        this.color = new Color(1, 0.2, 0.2);
        this.renderOrder = 5;
    }

    update() {
        super.update();

        if (gameState !== 'playing' || !player) return;

        this.pos = this.pos.add(this.dir.scale(this.speed));
        this.distanceTraveled += this.speed;

        // Check player collision
        if (this.pos.distance(player.pos) < 0.5) {
            player.takeDamage(this.damage);
            this.remove();
            return;
        }

        // Remove if traveled too far
        if (this.distanceTraveled > 12) {
            this.remove();
        }
    }

    remove() {
        const index = projectiles.indexOf(this);
        if (index > -1) projectiles.splice(index, 1);
        this.destroy();
    }
}

// ============================================
// PICKUP CLASSES
// ============================================

class XPOrb extends EngineObject {
    constructor(pos, value) {
        super(pos, vec2(0.3, 0.3));
        this.value = value;
        this.color = new Color(0.2, 1, 0.2);
        pickups.push(this);
    }

    collect() {
        player.gainXP(this.value);
        const index = pickups.indexOf(this);
        if (index > -1) pickups.splice(index, 1);
        this.destroy();
    }
}

class GoldPickup extends EngineObject {
    constructor(pos, value) {
        super(pos, vec2(0.35, 0.35));
        this.value = value;
        this.color = new Color(1, 0.85, 0);
        pickups.push(this);
    }

    collect() {
        goldCollected += this.value;
        metaUpgrades.gold += this.value;
        saveProgress();
        updateHUD();
        const index = pickups.indexOf(this);
        if (index > -1) pickups.splice(index, 1);
        this.destroy();
    }
}

class HealthPickup extends EngineObject {
    constructor(pos) {
        super(pos, vec2(0.4, 0.4));
        this.color = new Color(1, 0.3, 0.3);
        pickups.push(this);
    }

    collect() {
        player.hp = Math.min(player.maxHp, player.hp + 20);
        updateHUD();
        const index = pickups.indexOf(this);
        if (index > -1) pickups.splice(index, 1);
        this.destroy();
    }
}

// ============================================
// VISUAL EFFECTS
// ============================================

class MeleeEffect extends EngineObject {
    constructor(pos, dir, range, arc, color) {
        super(pos, vec2(range * 2, range * 2));
        this.dir = dir;
        this.range = range;
        this.arc = arc;
        this.effectColor = color;
        this.lifetime = 0.15;
        this.renderOrder = 15;
    }

    update() {
        super.update();
        this.lifetime -= timeDelta;
        if (this.lifetime <= 0) {
            this.destroy();
        }
    }

    render() {
        const alpha = this.lifetime / 0.15;
        const c = this.effectColor;

        // Draw arc using rotate() to handle LittleJS angle convention correctly
        const segments = 8;
        const halfArc = this.arc / 2;
        for (let i = 0; i < segments; i++) {
            const angleOffset1 = -halfArc + (this.arc * i / segments);
            const angleOffset2 = -halfArc + (this.arc * (i + 1) / segments);
            const p1 = this.pos.add(this.dir.rotate(angleOffset1).scale(this.range));
            const p2 = this.pos.add(this.dir.rotate(angleOffset2).scale(this.range));
            drawLine(this.pos, p1, 0.1, new Color(c.r, c.g, c.b, alpha));
            drawLine(p1, p2, 0.1, new Color(c.r, c.g, c.b, alpha));
        }
    }
}

class LightningEffect extends EngineObject {
    constructor(start, end) {
        super(start.lerp(end, 0.5), vec2(1, 1));
        this.start = start;
        this.end = end;
        this.lifetime = 0.2;
        this.renderOrder = 20;
    }

    update() {
        super.update();
        this.lifetime -= timeDelta;
        if (this.lifetime <= 0) {
            this.destroy();
        }
    }

    render() {
        const alpha = this.lifetime / 0.2;
        drawLine(this.start, this.end, 0.15, new Color(0.5, 0.5, 1, alpha));
    }
}

// ============================================
// ENEMY SPAWNING
// ============================================

function spawnEnemies() {
    spawnTimer -= timeDelta;

    if (spawnTimer <= 0) {
        // Determine spawn rate based on wave
        const baseSpawnTime = Math.max(0.5, 2 - currentWave * 0.1);
        spawnTimer = baseSpawnTime;

        // Get available enemy types for current wave
        const availableTypes = Object.entries(ENEMY_TYPES)
            .filter(([_, data]) => data.minWave <= currentWave)
            .map(([type, _]) => type);

        // Spawn 1-3 enemies
        const spawnCount = Math.min(3, 1 + Math.floor(currentWave / 3));

        for (let i = 0; i < spawnCount; i++) {
            // Random type weighted toward weaker enemies
            let type;
            const roll = Math.random();
            if (roll < 0.5) {
                type = availableTypes[0]; // Most common
            } else if (roll < 0.8) {
                type = availableTypes[Math.min(1, availableTypes.length - 1)];
            } else {
                type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            }

            // Spawn at edge of screen
            const angle = Math.random() * Math.PI * 2;
            const distance = 15 + Math.random() * 5;
            const spawnPos = player.pos.add(vec2(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance
            ));

            const enemy = new Enemy(spawnPos, type);
            enemies.push(enemy);
        }
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function showMainMenu() {
    gameState = 'menu';
    document.getElementById('mainMenu').style.display = 'block';
    document.getElementById('classSelect').style.display = 'none';
    document.getElementById('upgradeShop').style.display = 'none';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('druidForms').style.display = 'none';
}

function showClassSelect() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('classSelect').style.display = 'block';
    document.getElementById('gameOver').style.display = 'none';
    // Auto-select warrior by default
    selectClass('warrior');
}

function selectClass(classType) {
    selectedClass = classType;
    document.querySelectorAll('.class-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('card-' + classType).classList.add('selected');
}

function showUpgradeShop() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('upgradeShop').style.display = 'block';
    document.getElementById('shopGold').textContent = metaUpgrades.gold;

    // Generate shop items
    const shopItems = document.getElementById('shopItems');
    shopItems.innerHTML = '';

    const upgrades = [
        { id: 'maxHp', name: '+10 Max HP', cost: 50 + metaUpgrades.maxHp * 25 },
        { id: 'damage', name: '+5% Damage', cost: 75 + metaUpgrades.damage * 50 },
        { id: 'speed', name: '+5% Speed', cost: 100 + metaUpgrades.speed * 75 },
        { id: 'xpGain', name: '+10% XP Gain', cost: 150 + metaUpgrades.xpGain * 100 }
    ];

    upgrades.forEach(upgrade => {
        const btn = document.createElement('button');
        btn.className = 'menu-btn';
        btn.textContent = `${upgrade.name} (${upgrade.cost}g) [Lv.${metaUpgrades[upgrade.id]}]`;
        btn.onclick = () => buyUpgrade(upgrade.id, upgrade.cost);
        if (metaUpgrades.gold < upgrade.cost) {
            btn.style.opacity = '0.5';
        }
        shopItems.appendChild(btn);
    });
}

function buyUpgrade(id, cost) {
    if (metaUpgrades.gold >= cost) {
        metaUpgrades.gold -= cost;
        metaUpgrades[id]++;
        saveProgress();
        showUpgradeShop();
    }
}

function startGame() {
    try {
        console.log('Starting game with class:', selectedClass);

        if (!selectedClass) {
            selectClass('warrior');
        }

        // Reset game state
        gameState = 'playing';
        gameTime = 0;
        killCount = 0;
        goldCollected = 0;
        currentWave = 1;
        spawnTimer = 0;

        // Clear existing entities
        enemies.forEach(e => e.destroy());
        projectiles.forEach(p => p.destroy());
        pickups.forEach(p => p.destroy());
        enemies = [];
        projectiles = [];
        pickups = [];

        console.log('Creating player at', WORLD_SIZE.scale(0.5));

        // Create player
        player = new Player(WORLD_SIZE.scale(0.5), selectedClass);

        console.log('Player created:', player);

        // Hide menus, show HUD
        document.getElementById('classSelect').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('hud').style.display = 'block';

        // Show druid forms if druid
        if (selectedClass === 'druid') {
            document.getElementById('druidForms').style.display = 'flex';
            updateFormButtons();
        } else {
            document.getElementById('druidForms').style.display = 'none';
        }

        updateHUD();
        console.log('Game started successfully');
    } catch (error) {
        console.error('Error starting game:', error);
        alert('Error starting game: ' + error.message);
    }
}

function updateHUD() {
    if (!player) return;

    let maxHp = player.maxHp;
    let currentHp = player.hp;

    // Apply form HP modifier for druid
    if (player.classType === 'druid') {
        const formData = player.classData.forms[player.currentForm];
        maxHp *= formData.hpMod;
    }

    const hpPercent = Math.max(0, (currentHp / maxHp) * 100);
    const xpPercent = (player.xp / player.xpToLevel) * 100;

    document.getElementById('hpBar').style.width = hpPercent + '%';
    document.getElementById('xpBar').style.width = xpPercent + '%';
    document.getElementById('levelText').textContent = player.level;
    document.getElementById('killsText').textContent = killCount;
    document.getElementById('goldText').textContent = goldCollected;

    // Format time
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    document.getElementById('timeText').textContent =
        minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function updateFormButtons() {
    if (!player || player.classType !== 'druid') return;

    const forms = ['human', 'bear', 'wolf', 'lunar'];
    forms.forEach(form => {
        const btn = document.getElementById('form-' + form);
        btn.classList.remove('active', 'cooldown');
        if (player.currentForm === form) {
            btn.classList.add('active');
        }
        if (player.shapeshiftCooldown > 0) {
            btn.classList.add('cooldown');
        }
    });
}

function shapeshift(form) {
    if (player && player.classType === 'druid') {
        player.shapeshift(form);
    }
}

function showLevelUp() {
    gameState = 'levelup';
    document.getElementById('levelUp').style.display = 'block';

    // Get random upgrades
    const shuffled = [...UPGRADES].sort(() => Math.random() - 0.5);
    const options = shuffled.slice(0, 3);

    const container = document.getElementById('upgradeOptions');
    container.innerHTML = '';

    options.forEach(upgrade => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `<h4>${upgrade.name}</h4><p>${upgrade.desc}</p>`;
        card.onclick = () => chooseLevelUpgrade(upgrade);
        container.appendChild(card);
    });
}

function chooseLevelUpgrade(upgrade) {
    player.applyUpgrade(upgrade);
    document.getElementById('levelUp').style.display = 'none';
    gameState = 'playing';
}

function gameOver() {
    gameState = 'gameover';

    document.getElementById('hud').style.display = 'none';
    document.getElementById('druidForms').style.display = 'none';
    document.getElementById('gameOver').style.display = 'block';

    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    document.getElementById('finalTime').textContent =
        minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    document.getElementById('finalKills').textContent = killCount;
    document.getElementById('finalGold').textContent = goldCollected;

    // Clean up
    if (player) {
        player.destroy();
        player = null;
    }
}

function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        document.getElementById('pauseMenu').style.display = 'block';
    }
}

function resumeGame() {
    gameState = 'playing';
    document.getElementById('pauseMenu').style.display = 'none';
}

function quitToMenu() {
    if (player) {
        player.destroy();
        player = null;
    }
    enemies.forEach(e => e.destroy());
    projectiles.forEach(p => p.destroy());
    pickups.forEach(p => p.destroy());
    enemies = [];
    projectiles = [];
    pickups = [];

    showMainMenu();
}

// ============================================
// SAVE/LOAD
// ============================================

function saveProgress() {
    localStorage.setItem('pixelSurvivors', JSON.stringify(metaUpgrades));
}

function loadProgress() {
    const saved = localStorage.getItem('pixelSurvivors');
    if (saved) {
        metaUpgrades = JSON.parse(saved);
    }
}

// ============================================
// LITTLEJS ENGINE FUNCTIONS
// ============================================

function gameInit() {
    console.log('gameInit called');

    // Initialize LittleJS-dependent constants
    WORLD_SIZE = vec2(100, 100);

    // Enable pixelated rendering for crisp sprites
    tilesPixelated = true;

    // Generate sprite sheet
    spriteSheet = generateSpriteSheet();
    spriteTexture = new TextureInfo(spriteSheet);
    console.log('Sprite sheet generated');

    initClassStats();
    initEnemyTypes();

    // Set up canvas
    canvasFixedSize = vec2(1280, 720);
    cameraScale = 32;

    // Load saved progress
    loadProgress();

    // Show main menu
    showMainMenu();
    console.log('gameInit complete');
}

function gameUpdate() {
    if (gameState === 'playing') {
        gameTime += timeDelta;

        // Update wave
        currentWave = 1 + Math.floor(gameTime / 30);

        // Spawn enemies
        spawnEnemies();

        // Update HUD periodically
        updateHUD();
    }

    // Pause on Escape
    if (keyWasPressed('Escape')) {
        if (gameState === 'playing') {
            pauseGame();
        } else if (gameState === 'paused') {
            resumeGame();
        }
    }
}

function gameUpdatePost() {
    // Post update logic if needed
}

function gameRender() {
    // Draw solid ground background
    const groundColor = new Color(0.15, 0.1, 0.2);
    drawRect(cameraPos, vec2(50, 50), groundColor);

    // Draw grid pattern - snap to grid coordinates to prevent flickering
    const gridColor = new Color(0.2, 0.15, 0.25);
    const gridSize = 4;
    const startX = Math.floor((cameraPos.x - 30) / gridSize) * gridSize;
    const startY = Math.floor((cameraPos.y - 20) / gridSize) * gridSize;

    for (let x = startX; x < cameraPos.x + 30; x += gridSize) {
        for (let y = startY; y < cameraPos.y + 20; y += gridSize) {
            // Checkerboard pattern based on fixed world position
            if (((x / gridSize) + (y / gridSize)) % 2 === 0) {
                drawRect(vec2(x, y), vec2(gridSize, gridSize), gridColor);
            }
        }
    }
}

function gameRenderPost() {
    // Post render (UI overlay if needed)
}

// Start the engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
