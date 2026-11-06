import {randomBytes} from 'node:crypto';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
const directory=new URL('../.generated/',import.meta.url);
const target=new URL('demo-session-key.json',directory);
mkdirSync(directory,{recursive:true});
try{writeFileSync(target,JSON.stringify({secret:randomBytes(32).toString('hex')})+'\n',{flag:'wx',mode:0o600})}catch(error){if(error.code!=='EEXIST')throw error}
const value=JSON.parse(readFileSync(target,'utf8'));
if(typeof value.secret!=='string'||!/^[a-f0-9]{64}$/.test(value.secret))throw new Error('Kunci sesi demo hasil build tidak valid.');
