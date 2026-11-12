import {NextRequest,NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {z} from 'zod';
import {isSameOriginRequest} from '@/lib/request-origin';
import {SESSION_COOKIE,sessionUserId} from '@/lib/demo-auth';
import {countActiveAdmins,updateUser,userFromSession} from '@/lib/user-database';
import {roles} from '@/lib/domain';
const updateSchema=z.object({role:z.enum(roles).optional(),active:z.boolean().optional(),password:z.string().min(12).max(128).optional()}).refine(v=>Object.keys(v).length>0);
async function currentAdmin(){const jar=await cookies();const id=sessionUserId(jar.get(SESSION_COOKIE)?.value);const user=id?userFromSession(id):null;return user?.role==='Admin'?user:null}
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){if(!isSameOriginRequest(request))return NextResponse.json({error:'Invalid request.'},{status:403});const admin=await currentAdmin();if(!admin)return NextResponse.json({error:'Admin access required.'},{status:403});let body:unknown;try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request body.'},{status:400})}const parsed=updateSchema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'Invalid account update.'},{status:400});const {id}=await params;const target=userFromSession(id);if(target?.role==='Admin'&&(parsed.data.active===false||parsed.data.role&&parsed.data.role!=='Admin')&&countActiveAdmins()<=1)return NextResponse.json({error:'The last active admin account cannot be disabled or demoted.'},{status:409});if(id===admin.id&&parsed.data.active===false)return NextResponse.json({error:'You cannot disable your own account.'},{status:409});const ok=await updateUser(id,parsed.data);if(!ok)return NextResponse.json({error:'Account not found.'},{status:404});return NextResponse.json({user:userFromSession(id)??{id,active:false}},{headers:{'Cache-Control':'no-store'}})}
