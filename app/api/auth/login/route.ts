import {NextRequest,NextResponse} from 'next/server';
import {isSameOriginRequest} from '@/lib/request-origin';
import {createDemoSession,safeReturnPath,SESSION_COOKIE,SESSION_SECONDS} from '@/lib/demo-auth';
import {findUserByEmail,verifyPassword} from '@/lib/user-database';
export async function POST(request:NextRequest){
 if(!isSameOriginRequest(request))return NextResponse.json({error:'Invalid request.'},{status:403});
 let data:unknown;try{data=await request.json()}catch{return NextResponse.json({error:'Invalid login request.'},{status:400})}
 if(!data||typeof data!=='object'||!('email' in data)||!('password' in data)||typeof data.email!=='string'||typeof data.password!=='string')return NextResponse.json({error:'Enter your email and password.'},{status:400});
 const account=findUserByEmail(data.email);
 if(!account||!account.user||!await verifyPassword(data.password,account.passwordHash))return NextResponse.json({error:'Email or password is incorrect.'},{status:401});
 const next=safeReturnPath('next' in data?data.next:'/');
 const response=NextResponse.json({ok:true,next},{headers:{'Cache-Control':'no-store'}});
 response.cookies.set(SESSION_COOKIE,createDemoSession(account.user.id),{httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',path:'/',maxAge:SESSION_SECONDS});return response;
}
