import {DatabaseSync} from 'node:sqlite';
import {randomBytes,scrypt as scryptCallback} from 'node:crypto';
import {promisify} from 'node:util';
import {mkdirSync,readFileSync,writeFileSync,chmodSync} from 'node:fs';
import {dirname,resolve} from 'node:path';

const scrypt=promisify(scryptCallback);
const databasePath=resolve(process.env.AUTH_DATABASE_PATH?.trim()||'.data/users.sqlite');
const credentialsPath=resolve('.generated/initial-user-credentials.json');
const accounts=[
 {email:'admin@sakuratex.id',displayName:'Sakuratex Admin',role:'Admin'},
 {email:'supervisor@sakuratex.id',displayName:'Energy Supervisor',role:'Supervisor'},
 {email:'operator@sakuratex.id',displayName:'Plant Operator',role:'Operator'},
 {email:'accounting@sakuratex.id',displayName:'Energy Accounting',role:'Akunting'}
];
mkdirSync(dirname(databasePath),{recursive:true});
mkdirSync('.generated',{recursive:true});
const db=new DatabaseSync(databasePath);
db.exec(`PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE COLLATE NOCASE,display_name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('Supervisor','Operator','Akunting','Admin')),password_hash TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE INDEX IF NOT EXISTS users_active_idx ON users(active);`);
const credentials=[];
for(const account of accounts){
 const exists=db.prepare('SELECT id FROM users WHERE email=? COLLATE NOCASE').get(account.email);
 if(exists)continue;
 const password='Demo123';
 const salt=randomBytes(16);
 const key=await scrypt(password,salt,64);
 const passwordHash=`scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`;
 db.prepare('INSERT INTO users(id,email,display_name,role,password_hash) VALUES(?,?,?,?,?)').run(randomBytes(16).toString('hex'),account.email,account.displayName,account.role,passwordHash);
 credentials.push({email:account.email,password,role:account.role});
}
if(credentials.length){
 let previous=[];
 try{previous=JSON.parse(readFileSync(credentialsPath,'utf8'))}catch{}
 const existing=Array.isArray(previous)?previous:[];
 writeFileSync(credentialsPath,JSON.stringify([...existing,...credentials],null,2)+'\n',{mode:0o600});
 chmodSync(credentialsPath,0o600);
 console.log(`Created ${credentials.length} initial user account(s). Credentials saved to ${credentialsPath}.`);
}else console.log('Initial user accounts already exist; no credentials were changed.');
db.close();
