import {test} from 'vitest';
import assert from 'node:assert/strict';
import {meters,filterMeters,number} from '../lib/data.ts';
test('Search panel is case-insensitive',()=>assert.equal(filterMeters('KOMPRESOR','Semua kondisi').length,1));
test('Condition filter excludes unrelated panels',()=>assert.equal(filterMeters('','Peringatan')[0]?.id,'PM-002'));
test('Default dummy inventory provides positive loads for every machine',()=>assert.ok(meters.every(m=>m.connected&&m.kw>0)));
test('Decimal display uses Indonesian locale',()=>assert.equal(number(428.6),'428,6'));
test('Aggregate fixture agrees with connected sources',()=>assert.equal(Math.round(meters.filter(m=>m.connected).reduce((sum,m)=>sum+m.kw,0)*10)/10,1029.8));
