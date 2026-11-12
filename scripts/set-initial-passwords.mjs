import {DatabaseSync} from 'node:sqlite';
import {randomBytes,scrypt as scryptCallback} from 'node:crypto';
import {promisify} from 'node:util';
import {mkdirSync,writeFileSync,chmodSync} from 'node:fs';
import {resolve} from 'node:path';

const scrypt=promisify(scryptCallback);
const databasePath=resolve(process.env.AUTH_DATABASE_PATH?.trim()||'.data/users.sqlite');
const credentialsPath=resolve('.generated/initial-user-credentials.json');
const initialAccounts=[
 {email:'admin@sakuratex.id',role:'Admin'},
 {email:'supervisor@sakuratex.id',role:'Supervisor'},
 {email:'operator@sakuratex.id',role:'Operator'},
 {email:'accounting@sakuratex.id',role:'Akunting'}
];
const db=new DatabaseSync(databasePath);
const credentials=[];
for(const account of initialAccounts){
 const row=db.prepare('SELECT id FROM users WHERE email=? COLLATE NOCASE').get(account.email);
 if(!row)throw new Error(`Missing initial account: ${account.email}`);
 const salt=randomBytes(16);
 const key=await scrypt('Demo123',salt,64);
 const passwordHash=`scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`;
 db.prepare("UPDATE users SET password_hash=?,updated_at=datetime('now') WHERE email=? COLLATE NOCASE").run(passwordHash,account.email);
 credentials.push({email:account.email,password:'Demo123',role:account.role});
}
mkdirSync('.generated',{recursive:true});
writeFileSync(credentialsPath,JSON.stringify(credentials,null,2)+'\n',{mode:0o600});
chmodSync(credentialsPath,0o600);
console.log('Updated the four initial account passwords.');
db.close();
