'use client';
import {dummyFrame,dummyHistory} from './telemetry';
import {meters} from './data';
import {useSimulation,simulationSnapshot} from './simulation';
export function frameAt(id:string,tick:number){
 const base=dummyFrame(id,tick),timeline=simulationSnapshot().voltageTimeline;
 const override=(key:'v12'|'i1'|'pf')=>[...timeline].reverse().find(s=>(s.meterId??'PM-002')===id&&(s.key??'v12')===key&&tick>=s.start&&(s.end===null||tick<s.end))?.value;
 const v12=override('v12')??base.v12,pf=override('pf')??base.pf;
 const vavg=(v12+base.v23+base.v31)/3,kva=base.kw/pf,kvar=Math.sqrt(Math.max(0,kva*kva-base.kw*base.kw));
 const iavg=kva*1000/(Math.sqrt(3)*vavg),i1=override('i1')??iavg*.99;
 return {...base,v12,v1n:v12/Math.sqrt(3),pf,kva,kvar,vavg,iavg:(i1+iavg+iavg*1.01)/3,i1,i2:iavg,i3:iavg*1.01,in:iavg*.017};
}
export function currentHistory(id:string,tick=simulationSnapshot().tick){const s=simulationSnapshot();const age=s.ages[id]??(meters.find(m=>m.id===id)?.connected?10:480);if(age>120)return [];const end=age>30?(s.heldTicks[id]??Math.max(0,tick-Math.floor(age/10))):tick;return dummyHistory(id,end).map((_,i)=>frameAt(id,end-Math.min(35,end)+i))}
export function useMeasurements(){const sim=useSimulation();return {...sim,meters:meters.map(m=>{const age=sim.ages[m.id]??(m.connected?10:480),connected=age<=120;const tick=age>30?(sim.heldTicks[m.id]??Math.max(0,sim.tick-Math.floor(age/10))):sim.tick;return {...m,connected,age,frame:frameAt(m.id,tick)}})}}
