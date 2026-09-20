import {database,digest} from '@/lib/database';
export async function POST(req:Request){try{
 const b=await req.json() as Record<string,unknown>; const title=typeof b.title==='string'?b.title.trim().slice(0,60):'서울, 우리의 한마디';
 const id=crypto.randomUUID().slice(0,8); const secret=crypto.randomUUID()+crypto.randomUUID();
 await database().prepare('INSERT INTO rooms (id,title,secret,open,created) VALUES (?,?,?,1,?)').bind(id,title||'서울, 우리의 한마디',await digest(secret),new Date().toISOString()).run();
 return Response.json({id,secret});
}catch(e){console.error(e);return Response.json({error:'참여방을 만들지 못했습니다. 다시 시도해 주세요.'},{status:503});}}
