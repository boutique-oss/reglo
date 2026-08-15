// Génère les icônes PNG (PWA + favicon + apple-touch) depuis public/icon.svg.
// Usage : npm run icons
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const racine = join(__dirname, "..");
const src = join(racine, "public", "icon.svg");

const cibles = [
  { fichier: "public/icons/icon-192.png", taille: 192 },
  { fichier: "public/icons/icon-512.png", taille: 512 },
  { fichier: "public/icons/maskable-512.png", taille: 512 },
  { fichier: "app/apple-icon.png", taille: 180 },
  { fichier: "app/icon.png", taille: 512 },
];

const svg = await readFile(src);
await mkdir(join(racine, "public", "icons"), { recursive: true });

for (const { fichier, taille } of cibles) {
  const chemin = join(racine, fichier);
  await mkdir(dirname(chemin), { recursive: true });
  const png = await sharp(svg, { density: 384 })
    .resize(taille, taille)
    .png()
    .toBuffer();
  await writeFile(chemin, png);
  console.log(`✓ ${fichier} (${taille}×${taille})`);
}

console.log("Icônes générées.");
