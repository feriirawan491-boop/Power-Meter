import {NextRequest,NextResponse} from 'next/server';
import {isSameOriginRequest} from '@/lib/request-origin';
import {createDemoSession,safeReturnPath,SESSION_COOKIE,SESSION_SECONDS} from '@/lib/demo-auth';
export async function POST(request:NextRequest){
 if(!isSameOriginRequest(request))return NextResponse.json({error:'Permintaan tidak valid.'},{status:403});
 let data:unknown;try{data=await request.json()}catch{return NextResponse.json({error:'Data login tidak valid.'},{status:400})}
 if(!data||typeof data!=='object'||!('email' in data)||!('password' in data)||typeof data.email!=='string'||typeof data.password!=='string')return NextResponse.json({error:'Isi email dan kata sandi.'},{status:400});
 if(data.email.trim().toLowerCase()!=='demo@sakuratex.id'||data.password!=='demo123')return NextResponse.json({error:'Email atau kata sandi tidak sesuai.'},{status:401});
 const next=safeReturnPath('next' in data?data.next:'/');
 const response=NextResponse.json({ok:true,next},{headers:{'Cache-Control':'no-store'}});
 response.cookies.set(SESSION_COOKIE,createDemoSession(),{httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',path:'/',maxAge:SESSION_SECONDS});return response;
}
