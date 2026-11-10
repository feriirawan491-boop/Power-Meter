import {meters} from './data';

export interface ReadingState{ages:Record<string,number>;heldTicks:Record<string,number>}

// One definition of freshness and the last observed sample for every consumer.
export function meterReading(id:string,tick:number,state:ReadingState){
 const configuredAge=state.ages[id]??(meters.find(m=>m.id===id)?.connected?10:480);
 const held=Math.min(tick,state.heldTicks[id]??Math.max(0,tick-Math.floor(configuredAge/10)));
 const age=configuredAge>30?Math.max(configuredAge,(tick-held)*10):configuredAge;
 return {age,tick:configuredAge>30?held:tick,available:age<=120,current:age<=30};
}
