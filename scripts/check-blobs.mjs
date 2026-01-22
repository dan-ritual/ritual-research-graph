import 'dotenv/config';
import { list } from '@vercel/blob';

const { blobs } = await list({ prefix: 'microsites/state-of-crypto' });
console.log('Blobs matching "microsites/state-of-crypto":');
blobs.forEach(b => console.log('  ' + b.pathname));
console.log('Total:', blobs.length);
