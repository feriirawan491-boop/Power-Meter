import 'server-only';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {roles,type Role} from './domain';

const scrypt=promisify(scryptCallback);
const databasePath=resolve(process.env.AUTH_DATABASE_PATH?.trim()||'.data/users.sqlite');
export type AuthUser={id:string;email:string;displayName:string;role:Role;active:boolean};
type UserRow={id:string;email:string;display_name:string;role:string;password_hash:string;active:number};
let database:DatabaseSync|undefined;

function db(){
 if(!database){mkdirSync(dirname(databasePath),{recursive:true});database=new DatabaseSync(databasePath);database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');database.exec(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE COLLATE NOCASE,display_name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('Supervisor','Operator','Akunting','Admin')),password_hash TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE INDEX IF NOT EXISTS users_active_idx ON users(active);`)}
 return database;
}
export function userFromSession(id:string){const row=db().prepare('SELECT id,email,display_name,role,active FROM users WHERE id=?').get(id) as Omit<UserRow,'password_hash'>&{active:number}|undefined;return row&&row.active===1&&roles.includes(row.role as Role)?{id:row.id,email:row.email,displayName:row.display_name,role:row.role as Role,active:true}:null}
export function findUserByEmail(email:string){const row=db().prepare('SELECT * FROM users WHERE email=? COLLATE NOCASE').get(email.trim()) as UserRow|undefined;return row?{user:row.active===1&&roles.includes(row.role as Role)?{id:row.id,email:row.email,displayName:row.display_name,role:row.role as Role,active:true}:null,passwordHash:row.password_hash}:null}
export function listUsers():AuthUser[]{return (db().prepare('SELECT id,email,display_name,role,active FROM users ORDER BY email').all() as Array<Omit<UserRow,'password_hash'>&{active:number}>).map(row=>({id:row.id,email:row.email,displayName:row.display_name,role:row.role as Role,active:row.active===1}))}
export function countActiveAdmins(){return Number((db().prepare("SELECT COUNT(*) AS count FROM users WHERE role='Admin' AND active=1").get() as {count:number}).count)}
export async function hashPassword(password:string){const salt=randomBytes(16);const key=await scrypt(password,salt,64) as Buffer;return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`}
export async function verifyPassword(password:string,encoded:string){const [algorithm,saltText,keyText]=encoded.split('$');if(algorithm!=='scrypt'||!saltText||!keyText)return false;try{const expected=Buffer.from(keyText,'base64url');const actual=await scrypt(password,Buffer.from(saltText,'base64url'),expected.length) as Buffer;return actual.length===expected.length&&timingSafeEqual(actual,expected)}catch{return false}}
export async function createUser(input:{email:string;displayName:string;role:Role;password:string}){const id=randomBytes(16).toString('hex');const passwordHash=await hashPassword(input.password);db().prepare('INSERT INTO users(id,email,display_name,role,password_hash) VALUES(?,?,?,?,?)').run(id,input.email.trim().toLowerCase(),input.displayName.trim(),input.role,passwordHash);return userFromSession(id)!}
export async function updateUser(id:string,input:{role?:Role;active?:boolean;password?:string}){const current=userFromSession(id);const row=db().prepare('SELECT id FROM users WHERE id=?').get(id);if(!row)return false;const fields:string[]=[];const values:(string|number)[]=[];if(input.role){fields.push('role=?');values.push(input.role)}if(input.active!==undefined){fields.push('active=?');values.push(input.active?1:0)}if(input.password){fields.push('password_hash=?');values.push(await hashPassword(input.password))}if(!fields.length)return Boolean(current);fields.push("updated_at=datetime('now')");values.push(id);db().prepare(`UPDATE users SET ${fields.join(',')} WHERE id=?`).run(...values);return true}
