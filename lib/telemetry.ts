import {meters} from './data';
export interface DummyFrame{at:string;v12:number;v23:number;v31:number;v1n:number;v2n:number;v3n:number;vavg:number;i1:number;i2:number;i3:number;in:number;iavg:number;kw:number;kvar:number;kva:number;pf:number;hz:number;counter:number;displayCounter:number;thdV:number;thdI:number;vUnbalance:number;iUnbalance:number}
export const readingFields=[
 {key:'v12',label:'Tegangan L1–L2 (VLL)',unit:'V',digits:2},{key:'v23',label:'Tegangan L2–L3 (VLL)',unit:'V',digits:2},{key:'v31',label:'Tegangan L3–L1 (VLL)',unit:'V',digits:2},
 {key:'v1n',label:'Tegangan L1–N (VLN)',unit:'V',digits:2},{key:'v2n',label:'Tegangan L2–N (VLN)',unit:'V',digits:2},{key:'v3n',label:'Tegangan L3–N (VLN)',unit:'V',digits:2},
 {key:'i1',label:'Arus L1',unit:'A',digits:2},{key:'i2',label:'Arus L2',unit:'A',digits:2},{key:'i3',label:'Arus L3',unit:'A',digits:2},{key:'in',label:'Arus netral',unit:'A',digits:2},
 {key:'kw',label:'Daya aktif',unit:'kW',digits:3},{key:'kvar',label:'Daya reaktif',unit:'kvar',digits:3},{key:'kva',label:'Daya semu',unit:'kVA',digits:3},{key:'pf',label:'Faktor daya',unit:'',digits:3},{key:'hz',label:'Frekuensi',unit:'Hz',digits:3},{key:'counter',label:'Energi kumulatif (E-Total)',unit:'kWh',digits:4},
] as const;
export function dummyFrame(id:string,tick:number):DummyFrame{
 if(!Number.isSafeInteger(tick)||tick<0)throw new Error('Nomor sampel dummy tidak valid.');
 const meter=meters.find(m=>m.id===id);if(!meter)throw new Error('Meter dummy tidak dikenal.');
 const index=meters.indexOf(meter)+1,base=meter.kw||125;
 const v12=(id==='PM-002'&&Math.floor(tick/90)%2===0?419:396)+Math.sin(tick/4)*2,v23=398+Math.sin(tick/5)*2,v31=394+Math.sin(tick/6)*2,vavg=(v12+v23+v31)/3;
 const kw=base*(1+.015*Math.sin(tick/4)),pf=.94+.01*Math.sin(tick/6),kva=kw/pf,kvar=Math.sqrt(kva*kva-kw*kw),iavg=kva*1000/(Math.sqrt(3)*vavg);
 // Left-rectangle integration: sum P(k)*10/3600, k=0..tick-1.
 const sineSum=Math.sin(tick/8)*Math.sin((tick-1)/8)/Math.sin(1/8);
 const counter=10000*index+base*10/3600*(tick+314340+.015*sineSum);
 return {at:new Date(Date.UTC(2026,10,6,4,10)+tick*10000).toISOString(),v12,v23,v31,v1n:v12/Math.sqrt(3),v2n:v23/Math.sqrt(3),v3n:v31/Math.sqrt(3),vavg,i1:iavg*.99,i2:iavg,i3:iavg*1.01,in:iavg*.017,iavg,kw,kvar,kva,pf,hz:50+.025*Math.sin(tick/5),counter,displayCounter:counter,thdV:2.4+.2*Math.sin(tick/4),thdI:6.2+.3*Math.sin(tick/5),vUnbalance:.8+.1*Math.sin(tick/6),iUnbalance:1.1+.1*Math.sin(tick/7)};
}
export function dummyHistory(id:string,tick:number){const start=Math.max(0,tick-35);return Array.from({length:tick-start+1},(_,i)=>dummyFrame(id,start+i))}
export function formatReading(value:number,digits:number){return new Intl.NumberFormat('id-ID',{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value)}

// Same counter model at calendar boundaries; earlier periods use the same integrated load.
export function counterAt(id:string,at:number){const index=meters.findIndex(m=>m.id===id);if(index<0)throw new Error('Meter tidak dikenal');const tick=Math.floor((at-Date.UTC(2026,10,6,4,10))/10000);const base=meters[index].kw||125;const sum=Math.sin(tick/8)*Math.sin((tick-1)/8)/Math.sin(1/8);return 10000*(index+1)+base*10/3600*(tick+314340+.015*sum)}
