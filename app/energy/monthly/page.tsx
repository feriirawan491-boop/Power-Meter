import {Dashboard} from '@/components/dashboard';
import {meters} from '@/lib/data';
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
export default async function Page({searchParams}:Props){const q=await searchParams;const month=q.period==='2026-10'?'2026-10':'2026-11';const meter=typeof q.meter==='string'&&meters.some(m=>m.id===q.meter)?q.meter:'all';const parsed=typeof q.tariff==='string'?Number(q.tariff):1;const version=Number.isSafeInteger(parsed)&&parsed>0?parsed:1;return <Dashboard key={`monthly:${month}:${meter}:${version}`} initialView="Energi & Biaya" energyTab="monthly" energySelection={{month,meter,version}}/>}
