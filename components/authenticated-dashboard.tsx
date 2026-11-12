import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {Dashboard} from '@/components/dashboard';
import {SESSION_COOKIE,sessionUserId} from '@/lib/demo-auth';
import {userFromSession} from '@/lib/user-database';
import type {View} from '@/constants/navigation';
import type {EnergySelection} from '@/components/modules/energy';
import {canAccess} from '@/lib/domain';

export async function AuthenticatedDashboard(props:{initialView?:View;energyTab?:string;energySelection?:EnergySelection;pageKey?:string}){
 const jar=await cookies();
 const id=sessionUserId(jar.get(SESSION_COOKIE)?.value);
 const user=id?userFromSession(id):null;
 if(!user)redirect('/login');
 const initialView=props.initialView??'Dashboard';
 if(!canAccess(user.role,initialView))redirect(user.role==='Akunting'?'/energy/accounting':'/');
 return <Dashboard key={props.pageKey} initialView={initialView} energyTab={props.energyTab} energySelection={props.energySelection} currentUser={user}/>;
}
