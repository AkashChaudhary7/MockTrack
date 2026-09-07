import fs from "fs";
import path from "path";
import sharp from "sharp";

const publicDir = path.join(process.cwd(), "public");
const svgPath = path.join(publicDir, "icon.svg");

async function generateIcons() {
  console.log("Generating official icons from icon.svg...");

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. icon-192.png (192x192 transparent background, official logo)
  const icon192Inner = await sharp(svgBuffer)
    .resize(176, 176, { fit: "contain" })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: icon192Inner, gravity: "center" }])
    .png()
    .toFile(path.join(publicDir, "icon-192.png"));
  console.log("✓ Generated public/icon-192.png");

  // 2. icon-512.png (512x512 transparent background, official logo)
  const icon512Inner = await sharp(svgBuffer)
    .resize(472, 472, { fit: "contain" })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: icon512Inner, gravity: "center" }])
    .png()
    .toFile(path.join(publicDir, "icon-512.png"));
  console.log("✓ Generated public/icon-512.png");

  // 3. maskable-icon-512.png (512x512 with safe-zone padding and deep slate/navy background #0F172A)
  // Safe zone for maskable icon is inner 80% circle (radius ~204px / width ~408px)
  const maskableInner = await sharp(svgBuffer)
    .resize(360, 360, { fit: "contain" })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }, // #0F172A
    },
  })
    .composite([{ input: maskableInner, gravity: "center" }])
    .png()
    .toFile(path.join(publicDir, "maskable-icon-512.png"));
  console.log("✓ Generated public/maskable-icon-512.png");

  // 4. apple-touch-icon.png (180x180 with clean background #0F172A for iOS)
  const appleTouchInner = await sharp(svgBuffer)
    .resize(140, 140, { fit: "contain" })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }, // #0F172A
    },
  })
    .composite([{ input: appleTouchInner, gravity: "center" }])
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("✓ Generated public/apple-touch-icon.png");

  console.log("All official icons generated successfully!");
}

generateIcons().catch((err) => {
  console.error("Error generating official icons:", err);
  process.exit(1);
});
