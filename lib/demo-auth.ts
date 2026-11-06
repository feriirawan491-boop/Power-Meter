import {createHmac,timingSafeEqual} from 'node:crypto';
import generatedSession from '../.generated/demo-session-key.json';
export const SESSION_COOKIE='sakuratex-demo-session';
export const SESSION_SECONDS=8*60*60;
function signature(payload:string){const secret=process.env.DEMO_SESSION_SECRET?.trim()||generatedSession.secret;return createHmac('sha256',secret).update(payload).digest('base64url')}
export function createDemoSession(now=Date.now()){const payload=`demo.${Math.floor(now/1000)+SESSION_SECONDS}`;return `${payload}.${signature(payload)}`}
export function validDemoSession(token:string|undefined,now=Date.now()){if(!token)return false;const parts=token.split('.');if(parts.length!==3||parts[0]!=='demo'||!/^\d+$/.test(parts[1]))return false;const expires=Number(parts[1]);if(!Number.isSafeInteger(expires)||expires<=Math.floor(now/1000)||expires>Math.floor(now/1000)+SESSION_SECONDS)return false;const expected=Buffer.from(signature(`${parts[0]}.${parts[1]}`)),actual=Buffer.from(parts[2]);return expected.length===actual.length&&timingSafeEqual(expected,actual)}
export function safeReturnPath(value:unknown){if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||value.includes('\\')||/[\u0000-\u0020]/.test(value))return '/';try{const url=new URL(value,'http://sakuratex.local');return url.origin==='http://sakuratex.local'&&url.pathname!=='/login'?url.pathname+url.search:'/'}catch{return '/'}}
