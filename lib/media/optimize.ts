import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

// ── Image optimization pipeline ─────────────────────────────────────────────
// On upload: compress, convert to WebP, generate responsive sizes + a tiny
// blur placeholder (LQIP), and persist. Storage is pluggable — filesystem here
// (works locally & with a Docker volume); swap `store()` for S3 / Vercel Blob
// / Cloudflare R2 in production (all CDN-ready).

const RESPONSIVE_WIDTHS = [320, 640, 1024, 1600];
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const PUBLIC_BASE = "/uploads";

export interface OptimizedImage {
  url: string;
  variants: Record<string, string>;
  blurDataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  mime: "image/webp";
}

async function store(folder: string, name: string, buf: Buffer): Promise<string> {
  const dir = path.join(UPLOAD_ROOT, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return `${PUBLIC_BASE}/${folder}/${name}`;
}

const slug = (s: string) =>
  s.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "img";

export async function optimizeAndStore(
  input: Buffer,
  opts: { folder: string; filename: string; quality?: number }
): Promise<OptimizedImage> {
  const base = `${slug(opts.filename)}-${Date.now().toString(36)}`;
  const quality = opts.quality ?? 80;

  const image = sharp(input, { failOn: "none" }).rotate(); // auto-orient
  const meta = await image.metadata();
  const width = meta.width ?? 1200;
  const height = meta.height ?? 1200;

  // Master WebP (compressed, near-lossless perceptually)
  const masterBuf = await image.clone().webp({ quality, effort: 4 }).toBuffer();
  const url = await store(opts.folder, `${base}.webp`, masterBuf);

  // Responsive sizes (never upscale beyond the source)
  const variants: Record<string, string> = { original: url };
  for (const w of RESPONSIVE_WIDTHS) {
    if (w > width) continue;
    const buf = await sharp(input).rotate().resize({ width: w }).webp({ quality }).toBuffer();
    variants[String(w)] = await store(opts.folder, `${base}-${w}.webp`, buf);
  }

  // Tiny blur placeholder (instant LQIP, prevents layout shift)
  const blur = await sharp(input).rotate().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blur.toString("base64")}`;

  return { url, variants, blurDataUrl, width, height, sizeBytes: masterBuf.length, mime: "image/webp" };
}
