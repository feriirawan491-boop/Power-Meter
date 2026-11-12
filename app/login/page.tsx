import type {Metadata} from 'next';
import {LoginScreen} from '@/components/login-screen';
import {safeReturnPath} from '@/lib/demo-auth';
export const metadata:Metadata={title:'Sign in'};
export default async function LoginPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const query=await searchParams;return <LoginScreen next={safeReturnPath(query.next)}/>}
