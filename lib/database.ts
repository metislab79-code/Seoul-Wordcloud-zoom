import { env } from 'cloudflare:workers';
export function database(){ if(!env.DB) throw new Error('Database unavailable'); return env.DB; }
export async function digest(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
