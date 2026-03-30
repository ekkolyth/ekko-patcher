import sharp from "sharp";
import png2icons from "png2icons";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const ASSETS = resolve(ROOT, "assets");
mkdirSync(ASSETS, { recursive: true });

// Lucide Cpu icon paths scaled to fit a 1024x1024 canvas
// Original viewBox is 24x24, scale factor = 1024/24 * 0.5 (icon takes 50% of canvas)
// We center the icon in the canvas with padding
const ICON_SIZE = 1024;
const PADDING = 200;
const ICON_AREA = ICON_SIZE - PADDING * 2; // 624
const SCALE = ICON_AREA / 24; // 26

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}">
  <!-- Background -->
  <rect width="${ICON_SIZE}" height="${ICON_SIZE}" rx="180" fill="#C4A1FF"/>

  <!-- CPU icon group, scaled and centered -->
  <g transform="translate(${PADDING}, ${PADDING}) scale(${SCALE})"
     fill="none" stroke="#000000" stroke-width="${2.4}" stroke-linecap="round" stroke-linejoin="round">
    <!-- Pin lines -->
    <path d="M12 20v2"/>
    <path d="M12 2v2"/>
    <path d="M17 20v2"/>
    <path d="M17 2v2"/>
    <path d="M2 12h2"/>
    <path d="M2 17h2"/>
    <path d="M2 7h2"/>
    <path d="M20 12h2"/>
    <path d="M20 17h2"/>
    <path d="M20 7h2"/>
    <path d="M7 20v2"/>
    <path d="M7 2v2"/>
    <!-- Outer chip body -->
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <!-- Inner die -->
    <rect x="8" y="8" width="8" height="8" rx="1" fill="#000000"/>
  </g>
</svg>`;

async function main() {
  // Generate 1024x1024 PNG
  const pngBuffer = await sharp(Buffer.from(svg)).resize(ICON_SIZE, ICON_SIZE).png().toBuffer();
  const pngPath = resolve(ASSETS, "icon.png");
  writeFileSync(pngPath, pngBuffer);
  console.log(`Created ${pngPath}`);

  // Generate .icns (macOS)
  const icns = png2icons.createICNS(pngBuffer, png2icons.BICUBIC2, 0);
  if (icns) {
    const icnsPath = resolve(ASSETS, "icon.icns");
    writeFileSync(icnsPath, icns);
    console.log(`Created ${icnsPath}`);
  }

  // Generate .ico (Windows)
  const ico = png2icons.createICO(pngBuffer, png2icons.BICUBIC2, 0, true);
  if (ico) {
    const icoPath = resolve(ASSETS, "icon.ico");
    writeFileSync(icoPath, ico);
    console.log(`Created ${icoPath}`);
  }

  console.log("Done!");
}

main().catch(console.error);
