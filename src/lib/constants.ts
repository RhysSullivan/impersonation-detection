import { join } from 'path';
import path from 'path';
import url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

if (!process.env.NOTIFICATION_CHANNEL_ID) throw new Error('No notification channel provided');
export const NOTIFICATION_CHANNEL_ID = process.env.NOTIFICATION_CHANNEL_ID;
if (!process.env.OFFICIAL_USER_ID) throw new Error('No official user id provided');
export const OFFICIAL_USER_ID = process.env.OFFICIAL_USER_ID;
if (!process.env.WATCHING_GUILD_ID) throw new Error('No watching guild id provided');
export const WATCHING_GUILD_ID = process.env.WATCHING_GUILD_ID;
if (!process.env.NOTIFICATION_ROLE_ID) console.warn('No notification role id provided');
export const NOTIFICATION_ROLE_ID = process.env.NOTIFICATION_ROLE_ID;
