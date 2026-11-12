import {NextRequest,NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {z} from 'zod';
import {isSameOriginRequest} from '@/lib/request-origin';
import {SESSION_COOKIE,sessionUserId} from '@/lib/demo-auth';
import {createUser,listUsers,userFromSession} from '@/lib/user-database';
import {roles} from '@/lib/domain';

async function currentAdmin(){const jar=await cookies();const id=sessionUserId(jar.get(SESSION_COOKIE)?.value);const user=id?userFromSession(id):null;return user?.role==='Admin'?user:null}
const createSchema=z.object({email:z.string().email().max(254),displayName:z.string().trim().min(2).max(100),role:z.enum(roles),password:z.string().min(12).max(128)});
export async function GET(){if(!await currentAdmin())return NextResponse.json({error:'Admin access required.'},{status:403});return NextResponse.json({users:listUsers()},{headers:{'Cache-Control':'no-store'}})}
export async function POST(request:NextRequest){if(!isSameOriginRequest(request))return NextResponse.json({error:'Invalid request.'},{status:403});if(!await currentAdmin())return NextResponse.json({error:'Admin access required.'},{status:403});let body:unknown;try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request body.'},{status:400})}const parsed=createSchema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'Enter a valid email, name, role, and password of at least 12 characters.'},{status:400});try{const user=await createUser(parsed.data);return NextResponse.json({user},{status:201,headers:{'Cache-Control':'no-store'}})}catch(error){if(error instanceof Error&&error.message.includes('UNIQUE'))return NextResponse.json({error:'An account with this email already exists.'},{status:409});throw error}}
