'use client';
import {dummyFrame,dummyHistory} from './telemetry';
import {meters} from './data';
import {useSimulation,simulationSnapshot} from './simulation';
export function frameAt(id:string,tick:number){const f=dummyFrame(id,tick);const override=[...simulationSnapshot().voltageTimeline].reverse().find(s=>tick>=s.start&&(s.end===null||tick<s.end))?.value??null;if(id!=='PM-002'||override===null)return f;const vavg=(override+f.v23+f.v31)/3,iavg=f.kva*1000/(Math.sqrt(3)*vavg);return {...f,v12:override,v1n:override/Math.sqrt(3),vavg,iavg,i1:iavg*.99,i2:iavg,i3:iavg*1.01,in:iavg*.017}}
export function currentHistory(id:string,tick=simulationSnapshot().tick){const s=simulationSnapshot();const age=s.ages[id]??(meters.find(m=>m.id===id)?.connected?10:480);if(age>120)return [];const end=age>30?(s.heldTicks[id]??Math.max(0,tick-Math.floor(age/10))):tick;return dummyHistory(id,end).map((_,i)=>frameAt(id,end-Math.min(35,end)+i))}
export function useMeasurements(){const sim=useSimulation();return {...sim,meters:meters.map(m=>{const age=sim.ages[m.id]??(m.connected?10:480),connected=age<=120;const tick=age>30?(sim.heldTicks[m.id]??Math.max(0,sim.tick-Math.floor(age/10))):sim.tick;return {...m,connected,age,frame:frameAt(m.id,tick)}})}}
