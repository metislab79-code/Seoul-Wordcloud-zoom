import {database,digest} from '@/lib/database';
const response=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){try{
 const url=new URL(req.url);const id=url.searchParams.get('id'); const participant=url.searchParams.get('participant')||'';const db=database();
 const results=await db.batch([
 db.prepare('SELECT id,title,open,generation FROM rooms WHERE id=?').bind(id),
 db.prepare('SELECT words FROM responses WHERE room=?').bind(id),
 db.prepare('SELECT word FROM hidden WHERE room=?').bind(id),
 db.prepare('SELECT participant FROM responses WHERE room=? AND participant=?').bind(id,participant)
 ]);
 const room=results[0].results[0];if(!room)return response({error:'참여방을 찾을 수 없습니다.'},404);
 const rows=results[1] as {results:{words:string}[]};const h=results[2] as {results:{word:string}[]};const hiddenWords=h.results.map(x=>x.word);
 const counts=new Map<string,number>();for(const r of rows.results)for(const w of JSON.parse(r.words))counts.set(w,(counts.get(w)||0)+1);
 const words=[...counts].map(([text,count])=>({text,count,hidden:hiddenWords.includes(text)})).sort((a,b)=>b.count-a.count||a.text.localeCompare(b.text,'ko'));
 return response({room,submitted:results[3].results.length>0,participants:rows.results.length,words,updated:new Date().toISOString()});
}catch(e){console.error(e);return response({error:'연결이 잠시 끊겼습니다. 다시 연결하고 있습니다.'},503);}}
export async function POST(req:Request){try{
 const b=await req.json() as Record<string,unknown>;if(typeof b.id!=='string')return response({error:'참여방을 확인해 주세요.'},400);
 const db=database();const room=await db.prepare('SELECT * FROM rooms WHERE id=?').bind(b.id).first<{id:string,secret:string,open:number,generation:number}>();if(!room)return response({error:'참여방을 찾을 수 없습니다.'},404);
 if(b.action==='submit'){
 const generation=b.generation??0;if(generation!==room.generation)return response({error:'새 참여가 시작되었습니다. 화면을 새로고침한 뒤 다시 제출해 주세요.'},409);
 if(typeof b.participant!=='string'||b.participant.length>80||b.participant.length<16)return response({error:'참여 정보를 확인해 주세요.'},400);
 const prior=await db.prepare('SELECT words FROM responses WHERE room=? AND participant=?').bind(b.id,b.participant).first();if(prior)return response({ok:true,already:true});
 if(!room.open)return response({error:'응답이 마감되었습니다.'},409);
 if(!Array.isArray(b.words)||b.words.length<1||b.words.length>3||b.words.some((x:unknown)=>typeof x!=='string'))return response({error:'단어를 1~3개 입력해 주세요.'},400);
 const words=[...new Set<string>(b.words.map((x:string)=>x.normalize('NFC').trim().replace(/\s+/g,' ')).filter(Boolean))];
 if(!words.length||words.some(w=>[...w].length>10||!/[\p{L}\p{N}]/u.test(w)||/[<>\x00-\x1f]/.test(w)))return response({error:'각 단어는 문자나 숫자를 포함해 10자 이내로 적어 주세요.'},400);
 const result=await db.prepare('INSERT OR IGNORE INTO responses (room,participant,words,created) SELECT ?,?,?,? WHERE EXISTS (SELECT 1 FROM rooms WHERE id=? AND open=1 AND generation=?)').bind(b.id,b.participant,JSON.stringify(words),new Date().toISOString(),b.id,generation).run();
 if(!result.meta.changes){const saved=await db.prepare('SELECT participant FROM responses WHERE room=? AND participant=?').bind(b.id,b.participant).first();if(!saved)return response({error:'응답이 마감되었습니다.'},409);}
 return response({ok:true});
 }
 if(typeof b.secret!=='string'||await digest(b.secret)!==room.secret)return response({error:'진행자 전용 링크로 접속해 주세요.'},403);
 if(b.action==='reset'){
 if(!Number.isInteger(b.generation))return response({error:'화면을 새로고침하고 다시 시도해 주세요.'},400);
 const result=await db.batch([
 db.prepare('DELETE FROM responses WHERE room=? AND EXISTS (SELECT 1 FROM rooms WHERE id=? AND generation=?)').bind(b.id,b.id,b.generation),
 db.prepare('DELETE FROM hidden WHERE room=? AND EXISTS (SELECT 1 FROM rooms WHERE id=? AND generation=?)').bind(b.id,b.id,b.generation),
 db.prepare('UPDATE rooms SET generation=generation+1,open=1 WHERE id=? AND generation=?').bind(b.id,b.generation)
 ]);
 return response({ok:true,reset:!!result[2].meta.changes});
 }
 if(b.action==='toggle')await db.prepare('UPDATE rooms SET open=? WHERE id=?').bind(b.open?1:0,b.id).run();
 else if(b.action==='hide'&&typeof b.word==='string'){
 if(b.hidden)await db.prepare('INSERT OR IGNORE INTO hidden (room,word) VALUES (?,?)').bind(b.id,b.word).run();
 else await db.prepare('DELETE FROM hidden WHERE room=? AND word=?').bind(b.id,b.word).run();
 }else return response({error:'요청을 확인해 주세요.'},400);
 return response({ok:true});
}catch(e){console.error(e);return response({error:'저장하지 못했습니다. 입력은 유지됩니다. 다시 시도해 주세요.'},503);}}
