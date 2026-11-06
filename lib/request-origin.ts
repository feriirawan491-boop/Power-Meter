import type {NextRequest} from 'next/server';
// Next can normalize request.nextUrl to localhost in development, while Host
// retains the address used by the browser (for example 127.0.0.1:5173).
export function isSameOriginRequest(request:NextRequest){
 const origin=request.headers.get('origin');if(!origin)return true;
 try{const source=new URL(origin);const host=request.headers.get('host')??request.nextUrl.host;return source.origin===origin&&source.protocol===request.nextUrl.protocol&&source.host.toLowerCase()===host.toLowerCase()}catch{return false}
}
