import {it,expect} from 'vitest';
import {dummyFrame,readingFields} from '../lib/telemetry';
it('includes VLL, VLN, phase/neutral current, powers, PF and Hz',()=>{const f=dummyFrame('PM-001',0);expect(readingFields.map(x=>x.key)).toEqual(expect.arrayContaining(['v12','v23','v31','v1n','v2n','v3n','i1','i2','i3','in','kw','kvar','kva','pf','hz','counter']));expect(f.v1n).toBeCloseTo(f.v12/Math.sqrt(3),1)});
it('uses one observed time for every field and advances 10 seconds',()=>{const a=dummyFrame('PM-001',0),b=dummyFrame('PM-001',1);expect(Date.parse(b.at)-Date.parse(a.at)).toBe(10000);expect(b.kw).not.toBe(a.kw);expect(b.v12).not.toBe(a.v12);expect(b.pf).not.toBe(a.pf)});
it('counter increases from integrated power, never loops backwards',()=>{const a=dummyFrame('PM-002',35),b=dummyFrame('PM-002',36);expect(b.counter).toBeGreaterThan(a.counter);expect(b.counter-a.counter).toBeCloseTo(a.kw*10/3600,5)});
it('active reactive and apparent power are consistent',()=>{const f=dummyFrame('PM-003',10);expect(f.kw/f.kva).toBeCloseTo(f.pf,5);expect(f.kw*f.kw+f.kvar*f.kvar).toBeCloseTo(f.kva*f.kva,2)});
it('source display and application reference the same energy counter',()=>{const f=dummyFrame('PM-001',3);expect(f.displayCounter).toBe(f.counter);expect(dummyFrame('PM-001',3)).toEqual(f)});
