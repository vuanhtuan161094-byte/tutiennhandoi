import { createRequire } from 'node:module';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';

const require = createRequire(import.meta.url);
const { packAsync } = require('free-tex-packer-core');

function usage() {
  console.log(`Tu Tien sprite sheet creator\n\nUsage:\n  npm run sprites -- --input <frames-dir> --output <out-dir> --name <atlas-name> [options]\n\nOptions:\n  --width <px>       Max atlas width (default 2048)\n  --height <px>      Max atlas height (default 2048)\n  --format <type>    png | webp | jpg (default png)\n  --padding <px>     Frame padding (default 2)\n  --extrude <px>     Edge extrusion (default 1)\n  --trim             Trim transparent borders (default off)\n  --rotate           Allow rotated packing (default off)\n  --pot              Force power-of-two atlas (default off)\n  --fps <n>          Optional animation metadata (default 12)\n  --once             Mark animation metadata as non-looping\n  --help             Show this help\n`);
}

function parseArgs(argv) {
  const out = new Map();
  const flags = new Set(['trim', 'rotate', 'pot', 'once', 'help']);
  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw.startsWith('--')) throw new Error(`Unexpected argument: ${raw}`);
    const key = raw.slice(2);
    if (flags.has(key)) {
      out.set(key, true);
      continue;
    }
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
    out.set(key, value);
    i += 1;
  }
  return out;
}

async function collectImages(root) {
  const supported = new Set(['.png', '.jpg', '.jpeg', '.webp']);
  const files = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name, 'en'));
    for (const entry of entries) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && supported.has(extname(entry.name).toLowerCase())) files.push(full);
    }
  }
  await walk(root);
  return files;
}

const args = parseArgs(process.argv.slice(2));
if (args.get('help')) {
  usage();
  process.exit(0);
}

const inputDir = resolve(args.get('input') || '');
const outputDir = resolve(args.get('output') || '');
const textureName = String(args.get('name') || 'spritesheet').trim();
if (!args.get('input') || !args.get('output') || !textureName) {
  usage();
  throw new Error('--input, --output and --name are required');
}

const width = Number(args.get('width') || 2048);
const height = Number(args.get('height') || 2048);
const padding = Number(args.get('padding') || 2);
const extrude = Number(args.get('extrude') || 1);
const fps = Number(args.get('fps') || 12);
const textureFormat = String(args.get('format') || 'png').toLowerCase();
if (![width, height].every(Number.isFinite) || width <= 0 || height <= 0) throw new Error('Invalid atlas size');
if (!Number.isFinite(padding) || padding < 0 || !Number.isFinite(extrude) || extrude < 0) throw new Error('Invalid padding/extrude');
if (!Number.isFinite(fps) || fps <= 0) throw new Error('Invalid fps');
if (!['png', 'webp', 'jpg'].includes(textureFormat)) throw new Error(`Unsupported format: ${textureFormat}`);

const sourceFiles = await collectImages(inputDir);
if (!sourceFiles.length) throw new Error(`No supported images found in ${inputDir}`);

const images = await Promise.all(sourceFiles.map(async (file) => ({
  path: relative(inputDir, file).split(sep).join('/'),
  contents: await readFile(file),
})));

const options = {
  textureName,
  width,
  height,
  fixedSize: false,
  powerOfTwo: Boolean(args.get('pot')),
  padding,
  extrude,
  allowRotation: Boolean(args.get('rotate')),
  detectIdentical: true,
  allowTrim: Boolean(args.get('trim')),
  exporter: 'Pixi',
  removeFileExtension: true,
  prependFolderName: true,
  textureFormat,
  packer: 'OptimalPacker',
};

await mkdir(outputDir, { recursive: true });
const outputs = await packAsync(images, options);
for (const item of outputs) {
  await writeFile(resolve(outputDir, item.name), item.buffer);
}

const metadata = {
  schema: 'tutien.sprite-sheet.v1',
  source: relative(process.cwd(), inputDir).split(sep).join('/'),
  textureName,
  frameCount: images.length,
  frames: images.map((image) => image.path.replace(/\.[^.]+$/, '')),
  animation: { fps, loop: !args.get('once') },
  atlas: {
    exporter: 'Pixi',
    format: textureFormat,
    maxWidth: width,
    maxHeight: height,
    padding,
    extrude,
    trim: Boolean(args.get('trim')),
    rotation: Boolean(args.get('rotate')),
    powerOfTwo: Boolean(args.get('pot')),
  },
  outputs: outputs.map((item) => item.name),
};
await writeFile(resolve(outputDir, `${textureName}.tutien.json`), `${JSON.stringify(metadata, null, 2)}\n`);

console.log(`SPRITE SHEET PASS · ${textureName} · frames=${images.length} · outputs=${outputs.length} · ${outputDir}`);
