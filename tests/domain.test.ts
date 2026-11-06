import {describe,it,expect} from 'vitest';
import {freshness,consumption,cost,periodBoundary,evaluateRule,canAccess,makeHistory} from '../lib/domain';
describe('FR data and energy rules',()=>{
 it.each([[30,'Terkini'],[31,'Terlambat'],[120,'Terlambat'],[121,'Terputus']] as const)('freshness %i', (age,result)=>expect(freshness(age)).toBe(result));
 it('does not convert missing into zero',()=>expect(consumption(null,1250.5)).toEqual({value:null,quality:'PERLU_REKONSILIASI'}));
 it('calculates energy and flags counter reset',()=>{expect(consumption(1000,1250.5).value).toBe(250.5);expect(consumption(1000,20).quality).toBe('PERLU_REKONSILIASI')});
 it('uses exact integer scaled arithmetic and half up',()=>{expect(cost([{kwh:'250.50',rate:'1000'}])).toBe('250500');expect(cost([{kwh:'1.2345',rate:'1000'}])).toBe('1235');expect(cost([{kwh:'200',rate:'1000'},{kwh:'50',rate:'1500'}])).toBe('275000')});
 it('rejects missing tariff and negative delta',()=>{expect(cost([{kwh:'1',rate:null}])).toBeNull();expect(consumption(10,9).value).toBeNull()});
 it('boundary exact / 20 seconds / 31 seconds',()=>{const b=100000;expect(periodBoundary([{at:b,value:500}],b).quality).toBe('LENGKAP');expect(periodBoundary([{at:b-20000,value:500}],b).quality).toBe('ESTIMASI');expect(periodBoundary([{at:b-31000,value:500}],b).value).toBeNull()});
 it('rule duration, equality and gap are explicit',()=>{const r={threshold:100,seconds:20,maxGap:15};expect(evaluateRule([{at:0,value:101},{at:10,value:102},{at:20,value:103}],r)).toBe(20);expect(evaluateRule([{at:0,value:100},{at:10,value:100},{at:20,value:100}],r)).toBeNull();expect(evaluateRule([{at:0,value:101},{at:20,value:102},{at:30,value:103}],r)).toBeNull()});
 it('demo role restrictions are explicit',()=>{expect(canAccess('Operator','Energi & Biaya')).toBe(false);expect(canAccess('Admin','Pengaturan')).toBe(true)});
 it('history has consistent samples and source times',()=>{const h=makeHistory('PM-001',35);expect(h).toHaveLength(36);expect(h.every(x=>x.kw!==null)).toBe(true);expect(makeHistory('PM-001',35)).toEqual(h)});
});
