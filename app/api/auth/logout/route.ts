import {NextRequest,NextResponse} from 'next/server';
import {isSameOriginRequest} from '@/lib/request-origin';
import {SESSION_COOKIE} from '@/lib/demo-auth';
export async function POST(request:NextRequest){if(!isSameOriginRequest(request))return NextResponse.json({error:'Permintaan tidak valid.'},{status:403});const response=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});response.cookies.set(SESSION_COOKIE,'',{httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',path:'/',maxAge:0});return response}
