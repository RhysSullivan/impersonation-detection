import { join } from 'path';
import path from 'path';
import url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');
