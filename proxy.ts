import {NextRequest,NextResponse} from 'next/server';
import {SESSION_COOKIE,sessionUserId} from './lib/demo-auth';
import {userFromSession} from './lib/user-database';
export function proxy(request:NextRequest){const id=sessionUserId(request.cookies.get(SESSION_COOKIE)?.value);const loggedIn=id!==null&&userFromSession(id)!==null;if(request.nextUrl.pathname==='/login'){return loggedIn?NextResponse.redirect(new URL('/',request.url)):NextResponse.next()}if(!loggedIn){const url=new URL('/login',request.url);url.searchParams.set('next',request.nextUrl.pathname+request.nextUrl.search);return NextResponse.redirect(url)}return NextResponse.next()}
export const config={matcher:['/','/login','/meters/:path*','/alarms/:path*','/energy/:path*','/reports/:path*','/settings/:path*','/design-system/:path*']};
