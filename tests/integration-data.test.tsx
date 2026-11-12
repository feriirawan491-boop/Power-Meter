import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {act,render,renderHook,screen,within,cleanup} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useDemo,resetDemoForTests,saveTariff,savePlnBill,publish} from '../lib/demo-store';
import {simulationSnapshot,resetSimulation,setConnection,nextSimulation} from '../lib/simulation';
import {currentHistory,useMeasurements} from '../lib/measurements';
import {buildEnergyReport,energyReportView} from '../lib/energy-reports';
import {calculateCostGap,buildCostGapReport} from '../lib/cost-gap';
import {inReportPeriod} from '../lib/report-period';
import {EnergyWorkspace} from '../components/modules/energy';
import {ReportsWorkspace} from '../components/modules/reports';
import {SettingsWorkspace} from '../components/modules/settings';
const rates={version:1,accounting:'1000',lwbp:'1000',wbp:'1500',plnLwbp:'1200',plnWbp:'1800'};
beforeEach(()=>{vi.spyOn(Date,'now').mockReturnValue(Date.parse('2026-11-10T05:00:00Z'));resetSimulation();resetDemoForTests()});
afterEach(()=>{cleanup();vi.restoreAllMocks()});

it('a saved current-period PLN comparison survives later clock and connection changes',()=>{
 const state=renderHook(useDemo);
 act(()=>{expect(savePlnBill('2026-11','900000000',simulationSnapshot().tick)).toBe(true)});
 const bill=state.result.current.plnBills[0],before=calculateCostGap('2026-11',rates,bill);
 expect(before.complete).toBe(true);
 act(()=>{setConnection('PM-001',480);nextSimulation()});
 const after=calculateCostGap('2026-11',rates,state.result.current.plnBills[0]);
 expect(after.machine.rows).toEqual(before.machine.rows);
 expect(after.machineCost).toBe(before.machineCost);
 expect(after.gap).toBe(before.gap);
 expect(calculateCostGap('2026-11',rates).machineCost).toBeNull();
 expect(buildCostGapReport('2026-11',rates,bill).rows[0][2]).toBe(before.gap);
 const persisted=JSON.parse(localStorage.getItem('sakuratex-demo-v1')!);
 expect(persisted.plnBills[0].readings).toEqual(bill.readings);
});

it('reconnecting a missing meter cannot fill a previously saved incomplete comparison',()=>{
 const state=renderHook(useDemo);
 act(()=>{setConnection('PM-004',480);savePlnBill('2026-11','900000000',simulationSnapshot().tick)});
 const bill=state.result.current.plnBills[0];
 act(()=>{setConnection('PM-004',10);nextSimulation()});
 expect(calculateCostGap('2026-11',rates,bill).machineCost).toBeNull();
 expect(calculateCostGap('2026-11',rates).machineCost).toBeGreaterThan(0);
});

it('late samples expire consistently in monitoring, history, energy, and the PLN comparison',()=>{
 const readings=renderHook(useMeasurements);
 act(()=>setConnection('PM-001',60));
 const held=currentHistory('PM-001').at(-1)!;
 const energy=buildEnergyReport('2026-11','PM-001','monthly',rates);
 expect(energy.rows[0][2]).toBe(Number(held.counter.toFixed(4)));
 expect(energy.rows[0][5]).toBe('TERLAMBAT');
 expect(calculateCostGap('2026-11',rates).gap).toBeNull();
 act(()=>{for(let i=0;i<7;i++)nextSimulation()});
 expect(readings.result.current.meters[0].connected).toBe(false);
 expect(currentHistory('PM-001')).toEqual([]);
 expect(buildEnergyReport('2026-11','PM-001','monthly',rates).rows[0][3]).toBeNull();
});

it('new tariffs update unpinned energy and reports while an explicit old version remains unchanged',async()=>{
 render(<><EnergyWorkspace role="Supervisor"/><ReportsWorkspace/><SettingsWorkspace role="Admin"/></>);
 await userEvent.click(screen.getByRole('tab',{name:'Rates'}));
 for(const [label,value] of [['Accounting rate (Rp/kWh)','2000'],['PLN LWBP rate (Rp/kWh)','2300'],['PLN WBP rate (Rp/kWh)','3400']]){
  await userEvent.clear(screen.getByLabelText(label));
  await userEvent.type(screen.getByLabelText(label),value);
 }
 await userEvent.type(screen.getByLabelText('Reason for change'),'Integration tariff scenario');
 await userEvent.click(screen.getByRole('button',{name:'Save rate version'}));
 expect(screen.getByLabelText('Rate used')).toHaveValue('2');
 const pln=within(screen.getByRole('region',{name:'PLN calculation'}));
 expect(pln.getByText('Rp2,300/kWh')).toBeVisible();
 expect(pln.getByText('Rp3,400/kWh')).toBeVisible();
 await userEvent.selectOptions(screen.getByLabelText('Report type'),'accounting');
 await userEvent.click(screen.getByRole('button',{name:'Apply report filters'}));
 const preview=screen.getByRole('heading',{name:'Reports & manual printing'}).closest('section')!;
 expect(within(preview).getByRole('columnheader',{name:'Tarif internal (Rp/kWh)'})).toBeVisible();
 expect(within(preview).getAllByRole('cell',{name:'2,000'})).toHaveLength(5);
 await userEvent.selectOptions(screen.getByLabelText('Report rate version'),'1');
 act(()=>saveTariff({...rates,accounting:'3000',effectiveFrom:'2027-01-01'},'Another tariff scenario','Admin'));
 expect(screen.getByLabelText('Report rate version')).toHaveValue('1');
});

it('published reports keep both PLN tariffs and never change when settings change',()=>{
 const state=renderHook(useDemo);
 act(()=>{saveTariff({...rates,effectiveFrom:'2026-12-01'},'Publish tariff scenario','Admin');expect(publish('2026-10','Supervisor')).toBe(true)});
 const snapshot=structuredClone(state.result.current.publications[0].snapshot!);
 expect(snapshot.tariff.version).toBe(2);
 expect(snapshot.tariff.plnLwbp).toBe('1200');
 expect(snapshot.tariff.plnWbp).toBe('1800');
 act(()=>saveTariff({...rates,plnLwbp:'9999',effectiveFrom:'2027-01-01'},'Future tariff scenario','Admin'));
 expect(state.result.current.publications[0].snapshot).toEqual(snapshot);
});

it('filters months at WIB boundaries for history and alarm reports',()=>{
 expect(inReportPeriod('2026-10-31T16:59:59Z','2026-10')).toBe(true);
 expect(inReportPeriod('2026-10-31T17:00:00Z','2026-11')).toBe(true);
 expect(inReportPeriod('2026-10-31T17:00:00Z','2026-10')).toBe(false);
 expect(inReportPeriod('2026-11-30T17:00:00Z','2026-11')).toBe(false);
});

it('uses the same accounting report contract for screen and exports',()=>{
 const report=energyReportView(buildEnergyReport('2026-10','all','accounting',rates),'accounting',rates);
 expect(report.headers).toHaveLength(4);
 expect(report.rows.every(row=>row.length===report.headers.length)).toBe(true);
 expect(report.rows.reduce((sum,row)=>sum+Number(row[3]),0)).toBe(calculateCostGap('2026-10',rates).machineCost);
 expect(report.metadata.some(([label])=>label==='Basis kategori')).toBe(false);
});

it('requires a new reading snapshot before comparing a legacy current-period bill',()=>{
 const legacy={month:'2026-11',amount:'900000000',tick:simulationSnapshot().tick-10,at:new Date().toISOString()};
 const comparison=calculateCostGap('2026-11',rates,legacy);
 expect(comparison.legacyBill).toBe(true);
 expect(comparison.gap).toBeNull();
 expect(comparison.machineCost).toBeNull();
});
