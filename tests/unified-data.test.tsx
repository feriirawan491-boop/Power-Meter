import {it,expect,vi} from 'vitest';
import {render,screen,act,fireEvent} from '@testing-library/react';
import {ReferenceDashboard} from '../components/modules/reference-dashboard';
import {MeterExplorer} from '../components/modules/monitoring';
import {buildEnergyReport} from '../components/modules/energy';
import {SupervisorDashboard} from '../components/modules/supervisor-dashboard';
import {meters} from '../lib/data';
import {dummyFrame,formatReading} from '../lib/telemetry';
import {simulationSnapshot,resetSimulation,nextSimulation,setConnection} from '../lib/simulation';
import {useDemo,newEvent,acknowledge,recover} from '../lib/demo-store';
import {makeHistory} from '../lib/domain';
import {frameAt,currentHistory} from '../lib/measurements';
import {renderHook} from '@testing-library/react';
const tariff={version:1,accounting:'1000',lwbp:'1000',wbp:'1500'};
it('machine card, reference summary, parameter detail, triangle and monthly closing counter use one frame',()=>{
 const {tick}=simulationSnapshot(),f=dummyFrame('PM-002',tick);
 const card=render(<SupervisorDashboard/>);expect(screen.getByRole('heading',{name:'Kompresor 01'}).closest('article')).toHaveTextContent(formatReading(f.kw,3));card.unmount();
 const summary=render(<ReferenceDashboard meterId="PM-002"/>);expect(screen.getByRole('heading',{name:'Ptot',level:2}).closest('article')).toHaveTextContent(formatReading(f.kw,3));expect(screen.getByRole('heading',{name:'Edel',level:2}).closest('article')).toHaveTextContent(formatReading(f.counter,4));expect(screen.getByText(`PF = ${f.pf.toFixed(3)}`)).toBeVisible();summary.unmount();
 render(<MeterExplorer meter={meters[1]}/>);expect(screen.getByText('Daya aktif',{selector:'.parameter-grid span'}).parentElement).toHaveTextContent(formatReading(f.kw,3));
 const latest=makeHistory('PM-002',tick).at(-1)!;expect(latest.kw).toBe(Number(f.kw.toFixed(3)));expect(latest.counter).toBe(Number(f.counter.toFixed(4)));const report=buildEnergyReport('2026-11','PM-002','monthly',tariff,tick);expect(report.rows[0][2]).toBe(Number(f.counter.toFixed(4)));expect(report.rows[0][3]).toBeCloseTo(Number(report.rows[0][2])-Number(report.rows[0][1]),4);
});
it('one shared clock advances both views and global pause freezes both',()=>{
 vi.useFakeTimers();resetSimulation();const view=render(<><ReferenceDashboard meterId="PM-001"/><MeterExplorer meter={meters[0]}/></>);
 try{const start=simulationSnapshot().tick;act(()=>vi.advanceTimersByTime(10000));expect(simulationSnapshot().tick).toBe(start+1);fireEvent.click(screen.getByRole('button',{name:'Jeda data dummy'}));const paused=simulationSnapshot().tick;act(()=>vi.advanceTimersByTime(20000));expect(simulationSnapshot().tick).toBe(paused);act(()=>nextSimulation());const f=dummyFrame('PM-001',paused+1);expect(screen.getByRole('heading',{name:'Ptot',level:2}).closest('article')).toHaveTextContent(formatReading(f.kw,3));expect(screen.getByText('Daya aktif',{selector:'.parameter-grid span'}).parentElement).toHaveTextContent(formatReading(f.kw,3));}finally{view.unmount();vi.useRealTimers()}
});
it('rule violations follow the same voltage and acknowledgment does not change the measurement',()=>{
 const h=renderHook(useDemo);act(()=>newEvent());const event=h.result.current.events.find(e=>e.id.startsWith('AUTO-')&&!e.recovered)!;expect(event).toBeDefined();expect(frameAt(event.meterId,simulationSnapshot().tick).v12).toBeGreaterThan(event.limit);
 act(()=>acknowledge(event.id,'Supervisor'));expect(h.result.current.events.find(e=>e.id===event.id)?.recovered).toBeNull();
 const detectedTick=Math.round((Date.parse(event.detected)-Date.UTC(2026,10,6,4,10))/10000);const detectedValue=frameAt(event.meterId,detectedTick).v12;act(()=>recover(event.id,'Supervisor'));expect(frameAt(event.meterId,detectedTick).v12).toBe(detectedValue);expect(h.result.current.events.find(e=>e.id===event.id)?.recovered).toBeTruthy();expect(frameAt(event.meterId,simulationSnapshot().tick).v12).toBe(396);
});
it('connection changes remove measurements from history and the current-period report together',()=>{
 act(()=>setConnection('PM-001',480));expect(currentHistory('PM-001')).toEqual([]);const r=buildEnergyReport('2026-11','PM-001','monthly',tariff);expect(r.rows[0][2]).toBeNull();expect(r.rows[0][3]).toBeNull();
});
it('calendar boundaries join without counter resets between monthly reports',()=>{const oct=buildEnergyReport('2026-10','PM-003','monthly',tariff),nov=buildEnergyReport('2026-11','PM-003','monthly',tariff);expect(oct.rows[0][2]).toBe(nov.rows[0][1]);expect(Number(oct.rows[0][3])).toBeGreaterThan(0)});

it('late readings stay at their held timestamp while other machines advance',()=>{act(()=>setConnection('PM-001',60));const at=currentHistory('PM-001').at(-1)!.at;act(()=>nextSimulation());expect(currentHistory('PM-001').at(-1)!.at).toBe(at);expect(currentHistory('PM-002').at(-1)!.at).not.toBe(at)});
