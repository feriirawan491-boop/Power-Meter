'use client';
import {useSyncExternalStore} from 'react';
export const SIMULATION_EPOCH=Date.UTC(2026,10,6,4,10);
export function wallTick(){return Math.max(35,Math.floor((Date.now()-SIMULATION_EPOCH)/10000))}
let state={tick:wallTick(),playing:true,heldTicks:{} as Record<string,number>,ages:{} as Record<string,number>,voltageTimeline:[] as {start:number;end:number|null;value:number;key?:'v12'|'i1'|'pf';meterId?:string}[],overrideStart:0,voltageOverride:null as number|null};
let timer:ReturnType<typeof setInterval>|undefined;
let offset=0;
const listeners=new Set<()=>void>();
function emit(){listeners.forEach(fn=>fn())}
function subscribe(fn:()=>void){listeners.add(fn);if(!timer)timer=setInterval(()=>{if(!state.playing)return;const tick=wallTick()+offset;if(tick!==state.tick){state={...state,tick};emit()}},1000);return()=>{listeners.delete(fn);if(!listeners.size){clearInterval(timer);timer=undefined}}}
const server={tick:35,playing:true,heldTicks:{} as Record<string,number>,ages:{} as Record<string,number>,voltageTimeline:[] as {start:number;end:number|null;value:number;key?:'v12'|'i1'|'pf';meterId?:string}[],overrideStart:0,voltageOverride:null as number|null};
export function simulationSnapshot(){return state}
export function useSimulation(){return useSyncExternalStore(subscribe,simulationSnapshot,()=>server)}
export function toggleSimulation(){const playing=!state.playing;if(playing)offset=state.tick-wallTick();state={...state,playing};emit()}
export function nextSimulation(){offset=state.tick+1-wallTick();state={...state,tick:state.tick+1};emit()}
export function setConnection(id:string,age:number){state={...state,ages:{...state.ages,[id]:age},heldTicks:{...state.heldTicks,[id]:age>30?Math.max(0,state.tick-Math.floor(age/10)):state.tick}};emit()}
// Replay appends future samples; previously observed timestamps are immutable.
export function setMeasurementOverride(key:'v12'|'i1'|'pf',value:number|null,elapsed=0,meterId='PM-002'){
 const start=state.tick+1;
 const timeline=state.voltageTimeline.map(s=>(s.end===null&&(s.key??'v12')===key&&(s.meterId??'PM-002')===meterId)?{...s,end:start}:s);
 if(value!==null)timeline.push({start,end:null,value,key,meterId});
 const tick=start+Math.max(0,Math.floor(elapsed));offset=tick-wallTick();
 state={...state,tick,voltageTimeline:timeline,voltageOverride:key==='v12'?value:state.voltageOverride,overrideStart:start};emit();
}
export function setVoltageOverride(value:number|null,elapsed=0){setMeasurementOverride('v12',value,elapsed)}
export function resetSimulation(){offset=0;state={tick:wallTick(),playing:true,heldTicks:{},ages:{},voltageTimeline:[],overrideStart:0,voltageOverride:null};emit()}
