import {meters} from './data';
import {frameAt} from './measurements';
import {simulationSnapshot,SIMULATION_EPOCH} from './simulation';
import type {DemoState,DemoEvent} from './demo-store';
import {meterReading} from './reading-state';
export type AlarmKind='over_voltage'|'under_voltage'|'overload'|'low_pf';
export interface AlarmCondition{kind:AlarmKind;key:'v12'|'i1'|'pf';label:string;limit:number;recovery:number;below:boolean;unit:string}
export function alarmConditions(rule:DemoState['rule']):AlarmCondition[]{return [
 {kind:'over_voltage',key:'v12',label:'Over Voltage · Tegangan L1–L2',limit:rule.threshold,recovery:rule.threshold-rule.hysteresis,below:false,unit:'V'},
 {kind:'under_voltage',key:'v12',label:'Under Voltage · Tegangan L1–L2',limit:rule.lowVoltage,recovery:rule.lowVoltage+rule.hysteresis,below:true,unit:'V'},
 {kind:'overload',key:'i1',label:'Overload · Arus L1',limit:rule.overloadAmps,recovery:rule.overloadAmps*.95,below:false,unit:'A'},
 {kind:'low_pf',key:'pf',label:'Low PF · Faktor daya',limit:rule.lowPf,recovery:Math.min(1,rule.lowPf+.03),below:true,unit:''},
]}
const at=(tick:number)=>new Date(SIMULATION_EPOCH+tick*10000).toISOString();
const tickAt=(iso:string)=>Math.round((Date.parse(iso)-SIMULATION_EPOCH)/10000);
export function automaticAlarms(state:DemoState):DemoEvent[]{
 const sim=simulationSnapshot();const journal=new Map(state.events.map(e=>[e.id,e]));
 for(const meter of meters){
  const {age}=meterReading(meter.id,sim.tick,sim);
  const active=[...journal.values()].filter(e=>(e.id.startsWith('AUTO-')||e.parameterKey!==undefined)&&e.meterId===meter.id&&!e.recovered);
  // Missing data never deletes or recovers a known event.
  for(const e of active){
   if(age>30){journal.set(e.id,{...e,observability:'UNKNOWN',lastEvaluatedTick:sim.tick,recoverySinceTick:null});continue}
   const kind=e.kind??'over_voltage',key=e.parameterKey??'v12',below=kind==='under_voltage'||kind==='low_pf';
   const recovery=e.recoveryLimit??e.limit-state.rule.hysteresis;
   let since=e.observability==='UNKNOWN'?null:e.recoverySinceTick??null;
   let recovered:string|null=null;
   const start=e.observability==='UNKNOWN'?sim.tick:Math.max(tickAt(e.detected)+1,(e.lastEvaluatedTick??tickAt(e.detected))+1);
   for(let t=start;t<=sim.tick;t++){
    const value=frameAt(meter.id,t)[key];const normal=below?value>=recovery:value<=recovery;
    if(!normal){since=null;continue}if(since===null)since=t;
    if((t-since)*10>=(e.recoverySeconds??state.rule.recoverySeconds)){recovered=at(t);break}
   }
   journal.set(e.id,{...e,recovered,observability:'CURRENT',lastEvaluatedTick:sim.tick,recoverySinceTick:since});
  }
  if(age>30)continue;
  const start=Math.max(0,state.rule.effectiveTick,sim.tick-180);
  const samples=Array.from({length:Math.max(0,sim.tick-start+1)},(_,i)=>({tick:start+i,frame:frameAt(meter.id,start+i)}));
  for(const condition of alarmConditions(state.rule)){
   // An ongoing episode keeps its original rule and identity until recovery.
   if([...journal.values()].some(e=>e.id.startsWith('AUTO-')&&e.meterId===meter.id&&(e.kind??'over_voltage')===condition.kind&&!e.recovered))continue;
   let first:number|null=null,trigger:number|null=null,recoverySince:number|null=null;
   const finish=(recovered:string|null)=>{
    if(trigger===null)return;
    const detectedTick=trigger;
    const id=`AUTO-${meter.id}-${condition.kind}-${detectedTick}-v${state.rule.version}`;
    if(journal.has(id))return;
    // Do not recreate an old episode already recorded under its original rule.
    if([...journal.values()].some(e=>e.meterId===meter.id&&(e.kind??'over_voltage')===condition.kind&&tickAt(e.detected)<=detectedTick&&(e.recovered===null||tickAt(e.recovered)>=detectedTick)))return;
    journal.set(id,{id,meterId:meter.id,panel:meter.name,parameter:condition.label,parameterKey:condition.key,kind:condition.kind,unit:condition.unit,value:frameAt(meter.id,trigger)[condition.key],limit:condition.limit,severity:'Peringatan',detected:at(trigger),recovered,ack:null,notes:[],ruleVersion:state.rule.version,recoveryLimit:condition.recovery,recoverySeconds:state.rule.recoverySeconds,lastEvaluatedTick:sim.tick,recoverySinceTick:recoverySince,observability:'CURRENT'});
   };
   for(const sample of samples){const value=sample.frame[condition.key];const violates=condition.below?value<condition.limit:value>condition.limit;
    if(trigger===null){if(!violates){first=null;continue}if(first===null)first=sample.tick;if((sample.tick-first)*10>=state.rule.seconds)trigger=sample.tick;}
    else {const normal=condition.below?value>=condition.recovery:value<=condition.recovery;if(normal){if(recoverySince===null)recoverySince=sample.tick;if((sample.tick-recoverySince)*10>=state.rule.recoverySeconds){finish(at(sample.tick));first=null;trigger=null;recoverySince=null;}}else recoverySince=null;}
   }
   finish(null);
  }
 }
 return [...journal.values()].sort((a,b)=>b.detected.localeCompare(a.detected)||a.id.localeCompare(b.id));
}
