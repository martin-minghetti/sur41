/* eslint-disable no-console */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_TOKEN) {
  console.error("Missing REPLICATE_API_TOKEN");
  process.exit(1);
}

const STYLE =
  "alpine technical Scandi-Japanese aesthetic inspired by Snow Peak and Klättermusen, " +
  "cool desaturated palette, soft overcast morning light, cinematic 35mm film grain, " +
  "muted natural colors, no people visible, no text, no logos, editorial composition, " +
  "telephoto compression, slate and forest tones, hyperrealistic photo";

const PROMPTS: Record<string, string> = {
  "cover-home":
    "Cinematic aerial of Lake Nahuel Huapi at dawn, Andean Patagonian peaks in the distance, " +
    "lenga forest covering the shores, mist over the water, cool desaturated grading, " +
    "ultra-wide composition, " + STYLE,
  "cerro-tronador-ventisquero-negro":
    "A debris-covered black glacier tongue descending from a granite Patagonian mountain peak (Cerro Tronador), " +
    "dark moraine sediment on ice, cold overcast sky, telephoto compression, " + STYLE,
  "circuito-chico":
    "Aerial overview of forested peninsulas on a glacial blue lake (Lake Nahuel Huapi, Llao Llao zone), " +
    "winding road along the shore, conifer and lenga forest, cool soft light, " + STYLE,
  "san-martin-7-lagos":
    "Empty Patagonian highway curving between two glacial lakes, conifer forest on both sides, " +
    "Andes mountains in the background, soft autumn afternoon light, " + STYLE,
  "bolson-lago-puelo":
    "Turquoise glacial lake (Lago Puelo) surrounded by dense Valdivian rainforest, " +
    "distant snow-capped Patagonian peaks, low cloud, cool morning light, " + STYLE,
  "circuito-grande":
    "Patagonian steppe meeting Andean forest, eroded volcanic rock formations (Valle Encantado) above the Limay river canyon, " +
    "cool dawn light, dramatic stone shapes, " + STYLE,
  traslados:
    "Empty Patagonian mountain road at dawn, distant Andean peaks, cool grading, " +
    "low traffic, road sign pole, alpine atmosphere, " + STYLE,
  "rafting-rio-limay":
    "Patagonian river with clear emerald water and small whitewater rapids (Class I-II), " +
    "rocky steppe banks, low telephoto, cool morning light, " + STYLE,
  "kayak-lago-moreno":
    "A single kayak on a glassy glacial lake at dawn (Lago Moreno), " +
    "dense Patagonian forest along the shore, mist over the water, " +
    "wide composition, distant tiny figure, " + STYLE,
  "cabalgata-bosque":
    "Forest trail through Andean Patagonian woodland, coihue and cypress trees, " +
    "dappled morning light through the canopy, no people, telephoto, " + STYLE,
  "buceo-bautismo":
    "Underwater shot in a clear cold glacial lake, light beams filtering down through cool water, " +
    "submerged rocks, blue-green minerals, no divers, " + STYLE,
  canopy:
    "View through suspension cables across a Patagonian forest canopy from above, " +
    "telephoto compression on conifer and lenga trees below, no people, " + STYLE,
  "paquete-tronador-sma-circuito-chico":
    "Reflection of Patagonian Andes peaks on a calm glacial lake at dusk, " +
    "perfectly still water, cool desaturated palette, ultra-wide composition, " + STYLE,
  "isla-victoria-arrayanes":
    "Forest of cinnamon-orange bark arrayan trees (Luma apiculata), " +
    "smooth twisted trunks, dappled cool light, telephoto, ground covered in fallen leaves, " + STYLE,
  "puerto-blest-cantaros":
    "Misty Valdivian rainforest waterfall cascading over moss-covered cliffs, " +
    "ferns and dense canopy, cool blue-green palette, telephoto, " + STYLE,
};

const OUTPUT_DIR = path.join(process.cwd(), "public", "images");

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function generate(slug: string, prompt: string, attempt = 1): Promise<void> {
  const outPath = path.join(OUTPUT_DIR, `${slug}.jpg`);
  if (existsSync(outPath)) {
    console.log(`  ⏭  ${slug}.jpg already exists, skipping`);
    return;
  }

  if (attempt === 1) console.log(`  → ${slug}…`);
  else console.log(`  ↻ ${slug} (attempt ${attempt})…`);

  const start = Date.now();

  const res = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_TOKEN}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: "16:9",
          output_format: "jpg",
          output_quality: 88,
          safety_tolerance: 2,
        },
      }),
    },
  );

  if (res.status === 429) {
    const body = (await res.json().catch(() => ({}))) as { retry_after?: number };
    const wait = (body.retry_after ?? 11) * 1000 + 500;
    if (attempt > 6) throw new Error(`429 after 6 retries`);
    console.log(`     429, waiting ${(wait / 1000).toFixed(1)}s…`);
    await sleep(wait);
    return generate(slug, prompt, attempt + 1);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Replicate ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { output?: string | string[]; error?: string };
  if (data.error) throw new Error(data.error);

  const url = Array.isArray(data.output) ? data.output[0] : data.output;
  if (!url) throw new Error("No output URL");

  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`Image fetch ${imgRes.status}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  await writeFile(outPath, buf);

  const dt = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`  ✓ ${slug}.jpg (${(buf.length / 1024).toFixed(0)} KB · ${dt}s)`);
}

async function main(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const filter = process.argv[2];
  const entries = Object.entries(PROMPTS).filter(
    ([slug]) => !filter || slug.includes(filter),
  );
  console.log(`Generating ${entries.length} images @ FLUX 1.1 Pro · ~$0.04 each`);
  console.log(`Estimated cost: ~$${(entries.length * 0.04).toFixed(2)}\n`);

  let ok = 0;
  let fail = 0;
  for (const [slug, prompt] of entries) {
    try {
      await generate(slug, prompt);
      ok++;
      // throttle: 6/min cap = 10s spacing minimum
      await sleep(11000);
    } catch (err) {
      fail++;
      console.error(`  ✗ ${slug}: ${err instanceof Error ? err.message : err}`);
      await sleep(11000);
    }
  }

  console.log(`\n${ok} ok · ${fail} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
