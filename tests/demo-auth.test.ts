import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {NextRequest} from 'next/server';
import {createDemoSession,validDemoSession,SESSION_SECONDS,safeReturnPath,SESSION_COOKIE} from '../lib/demo-auth';
import {POST as login} from '../app/api/auth/login/route';
import {POST as logout} from '../app/api/auth/logout/route';
import {proxy} from '../proxy';
beforeEach(()=>vi.stubEnv('DEMO_SESSION_SECRET','test-only-secret-for-sakuratex-session-signing'));
afterEach(()=>vi.unstubAllEnvs());
it('rejects expired, tampered and unsigned sessions',()=>{const now=Date.now(),token=createDemoSession(now);expect(validDemoSession(token,now)).toBe(true);expect(validDemoSession(token,now+(SESSION_SECONDS+1)*1000)).toBe(false);expect(validDemoSession(token+'x',now)).toBe(false);expect(validDemoSession('demo.9999999999.fake',now)).toBe(false);expect(validDemoSession(undefined)).toBe(false)});
it('accepts only same-site return paths',()=>{expect(safeReturnPath('/meters?tab=history')).toBe('/meters?tab=history');for(const path of ['https://example.com','//example.com','/\\example.com','/login','/\nexample.com'])expect(safeReturnPath(path)).toBe('/')});
it('validates credentials on the server and sets an HttpOnly session',async()=>{
 const wrong=await login(new NextRequest('http://localhost/api/auth/login',{method:'POST',body:JSON.stringify({email:'demo@sakuratex.id',password:'wrong'})}));expect(wrong.status).toBe(401);expect(wrong.cookies.get(SESSION_COOKIE)).toBeUndefined();
 const correct=await login(new NextRequest('http://localhost/api/auth/login',{method:'POST',body:JSON.stringify({email:'demo@sakuratex.id',password:'demo123',next:'/meters'})}));expect(correct.status).toBe(200);expect(correct.cookies.get(SESSION_COOKIE)?.httpOnly).toBe(true);expect(validDemoSession(correct.cookies.get(SESSION_COOKIE)?.value)).toBe(true);expect(await correct.json()).toEqual({ok:true,next:'/meters'});
});
it('redirects anonymous access, permits a valid session and clears it on logout',async()=>{
 const denied=proxy(new NextRequest('http://localhost/meters'));expect(denied.status).toBe(307);expect(denied.headers.get('location')).toBe('http://localhost/login?next=%2Fmeters');
 const request=new NextRequest('http://localhost/meters',{headers:{cookie:`${SESSION_COOKIE}=${createDemoSession()}`}});expect(proxy(request).headers.get('x-middleware-next')).toBe('1');
 const response=await logout(new NextRequest('http://localhost/api/auth/logout',{method:'POST'}));expect(response.cookies.get(SESSION_COOKIE)?.maxAge).toBe(0);
});

it('uses the browser Host when Next normalizes the internal URL to localhost',async()=>{const body=JSON.stringify({email:'demo@sakuratex.id',password:'demo123'});const valid=new NextRequest('http://localhost:5173/api/auth/login',{method:'POST',headers:{host:'127.0.0.1:5173',origin:'http://127.0.0.1:5173','content-type':'application/json'},body});expect((await login(valid)).status).toBe(200);const invalid=new NextRequest('http://localhost:5173/api/auth/login',{method:'POST',headers:{host:'127.0.0.1:5173',origin:'http://untrusted.example','content-type':'application/json'},body});expect((await login(invalid)).status).toBe(403);const out=new NextRequest('http://localhost:5173/api/auth/logout',{method:'POST',headers:{host:'127.0.0.1:5173',origin:'http://127.0.0.1:5173'}});expect((await logout(out)).status).toBe(200)});
