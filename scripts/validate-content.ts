import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const contentDir = path.join(root, 'src', 'content');
const publicDir = path.join(root, 'public');

const slugRule = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

const planSchema = z.object({
  title: z.string(),
  slug: slugRule,
  sqft: z.number().int().positive(),
  beds: z.number().positive(),
  baths: z.number().positive(),
  summary: z.string(),
  heroImage: z.string(),
  gallery: z.array(z.string()).nonempty(),
  tags: z.array(z.string()).optional(),
});

const landSchema = z.object({
  slug: slugRule,
  address: z.string(),
  status: z.string(),
  summary: z.string().optional(),
  heroImage: z.string(),
  gallery: z.array(z.string()).nonempty(),
});

const manufacturerSchema = z.object({
  name: z.string(),
  slug: slugRule,
  website: z.string().url(),
  summary: z.string(),
  logo: z.string().optional(),
});

const productSchema = z.object({
  name: z.string(),
  slug: slugRule,
  manufacturer: z.string(),
  summary: z.string(),
  category: z.string(),
  heroImage: z.string().optional(),
});

const schemaMap: Record<string, z.ZodTypeAny> = {
  plans: planSchema,
  land: landSchema,
  manufacturers: manufacturerSchema,
  products: productSchema,
};

const imageFields: Record<string, string[]> = {
  plans: ['heroImage', 'gallery'],
  land: ['heroImage', 'gallery'],
  manufacturers: ['logo'],
  products: ['heroImage'],
};

interface ValidationError { file: string; message: string; }

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) return walk(res);
      return res;
    })
  );
  return files.flat();
}

async function validate() {
  const files = (await walk(contentDir)).filter((file) => file.endsWith('.json'));
  const slugMap = new Map<string, string>();
  const errors: ValidationError[] = [];

  for (const file of files) {
    const relPath = path.relative(root, file);
    const collection = path.relative(contentDir, path.dirname(file)).split(path.sep)[0];
    const schema = schemaMap[collection];
    if (!schema) {
      errors.push({ file: relPath, message: `Unknown collection ${collection}` });
      continue;
    }

    let parsed: unknown;
    try {
      const raw = await fs.readFile(file, 'utf8');
      parsed = JSON.parse(raw);
    } catch (error) {
      errors.push({ file: relPath, message: `Invalid JSON: ${(error as Error).message}` });
      continue;
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => issue.message).join('; ');
      errors.push({ file: relPath, message: `Schema validation failed: ${issues}` });
      continue;
    }

    const { slug } = result.data as { slug: string };
    if (slugMap.has(slug)) {
      errors.push({ file: relPath, message: `Duplicate slug: ${slug} also used in ${slugMap.get(slug)}` });
    } else {
      slugMap.set(slug, relPath);
    }

    const fieldsToCheck = imageFields[collection] ?? [];
    for (const field of fieldsToCheck) {
      const value = (result.data as Record<string, unknown>)[field];
      if (!value) continue;
      const paths = Array.isArray(value) ? value : [value];
      for (const imgPath of paths) {
        const relativeImage = imgPath.toString().replace(/^\//, '');
        const diskPath = path.join(publicDir, relativeImage);
        try {
          await fs.access(diskPath);
        } catch {
          errors.push({ file: relPath, message: `Missing image at ${imgPath}` });
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error('Content validation failed:');
    for (const error of errors) {
      console.error(`- ${error.file}: ${error.message}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Content validation passed.');
  }
}

validate();
