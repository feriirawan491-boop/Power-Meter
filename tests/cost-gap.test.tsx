import {beforeEach,it,expect} from 'vitest';
import {render,screen,act,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {CostGap} from '../components/modules/cost-gap';
import {calculateCostGap,buildCostGapReport,costGapDetails} from '../lib/cost-gap';
import {resetPlnBill} from '../lib/demo-store';
import {simulationSnapshot,nextSimulation,setConnection} from '../lib/simulation';
const tariff={version:1,accounting:'1000',lwbp:'1000',wbp:'1500'};
beforeEach(()=>act(()=>{resetPlnBill('2026-10');resetPlnBill('2026-11')}));
it('calculates a signed rupiah difference and uses the bill as percentage denominator',()=>{
 const initial=calculateCostGap('2026-10',tariff),machine=initial.machineCost!;
 const bill={month:'2026-10',amount:String(machine+1000000),tick:simulationSnapshot().tick,at:new Date().toISOString()};
 const result=calculateCostGap('2026-10',tariff,bill);
 expect(result.gap).toBe(1000000);expect(result.percent).toBeCloseTo(1000000/Number(bill.amount)*100,8);
 expect(calculateCostGap('2026-10',tariff,{...bill,amount:String(machine-1000000)}).gap).toBe(-1000000);
 expect(calculateCostGap('2026-10',tariff,{...bill,amount:'0'}).percent).toBeNull();
});
it('reconciles PLN components, total, and machine difference with the exported details',()=>{
 const rates={...tariff,plnLwbp:'1111.1234',plnWbp:'1666.5678'};
 const g=calculateCostGap('2026-10',rates),details=costGapDetails(g,rates);
 expect(g.lwbpCost+g.wbpCost+g.energyRounding).toBe(g.base);
 expect(g.additionalCost).toBe(Math.round((g.base+2500000)*.03));
 expect(g.base+g.fixedCost+g.additionalCost).toBe(g.plnBill);
 expect(g.plnBill-g.machineCost!).toBe(g.gap);
 expect(details.rows.find(row=>row[0]==='Total PLN pembanding')?.[2]).toBe(g.plnBill);
 const report=buildCostGapReport('2026-10',rates);
 expect(report.metadata.some(([label])=>label==='Biaya LWBP')).toBe(true);
 expect(report.metadata.some(([label])=>label==='Total PLN pembanding')).toBe(true);
 render(<CostGap month="2026-10" tariff={rates} selectedMeter="all"/>);
 const internal=screen.getByRole('region',{name:'Perhitungan Internal'});
 const pln=screen.getByRole('region',{name:'Perhitungan PLN'});
 expect(within(internal).getByText('Total Internal')).toBeVisible();
 expect(within(pln).getByText('Total PLN')).toBeVisible();
 expect(within(pln).getByText('Biaya listrik (LWBP + WBP)')).toBeVisible();
 expect(screen.queryByRole('table')).not.toBeInTheDocument();
});
it('does not invent a component breakdown for a manually entered PLN total',()=>{
 const bill={month:'2026-10',amount:'900000000',tick:simulationSnapshot().tick,at:new Date().toISOString()};
 const details=costGapDetails(calculateCostGap('2026-10',tariff,bill),tariff);
 expect(details.rows.find(row=>row[0]==='Total PLN pembanding')?.[2]).toBe(900000000);
 expect(details.rows.some(row=>row[0]==='Biaya LWBP')).toBe(false);
 expect(details.metadata[0][1]).toContain('tidak tersedia');
});
it('blocks the comparison when any current-period machine counter is missing',()=>{
 act(()=>setConnection('PM-004',480));const result=calculateCostGap('2026-11',tariff);expect(result.available).toBe(4);expect(result.machineCost).toBeNull();expect(result.gap).toBeNull();expect(result.availableCost).toBeGreaterThan(0);
 const report=buildCostGapReport('2026-11',tariff);expect(report.rows[0][2]).toBeNull();expect(report.rows[0][4]).toContain('BELUM LENGKAP');
});
it('keeps plant scope despite a single-machine filter and exports the same comparison',()=>{
 render(<CostGap month="2026-10" tariff={tariff} selectedMeter="PM-002"/>);
 expect(screen.getByText(/Filter satu mesin/)).toBeVisible();const report=buildCostGapReport('2026-10',tariff),expected=calculateCostGap('2026-10',tariff);
 expect(report.rows[0][0]).toBe(expected.machineCost);expect(report.rows[0][1]).toBe(expected.plnBill);expect(report.rows[0][2]).toBe(expected.gap);
});
it('saves a local bill per period and pins its comparison timestamp',async()=>{
 render(<CostGap month="2026-10" tariff={tariff} selectedMeter="all"/>);
 await userEvent.click(screen.getByText('Masukkan nominal tagihan PLN pembanding'));
 await userEvent.type(screen.getByLabelText('Tagihan PLN untuk rentang ini (Rp)'),'900000000');
 await userEvent.click(screen.getByRole('button',{name:'Simpan pembanding'}));
 expect(screen.getByText('Input tagihan lokal')).toBeVisible();expect(screen.getByText('Rp900.000.000')).toBeVisible();
 act(()=>nextSimulation());expect(screen.getByText('Rp900.000.000')).toBeVisible();
 const section=screen.getByRole('region',{name:'Perbandingan biaya mesin dan PLN'});expect(within(section).getByText(/batas waktu perbandingan dibekukan/)).toBeVisible();
 await userEvent.click(screen.getByRole('button',{name:'Gunakan dummy otomatis'}));expect(screen.getByText('Tagihan PLN dummy')).toBeVisible();
});

it('does not compare a delayed machine against a newer PLN cutoff',()=>{act(()=>{setConnection('PM-004',10);setConnection('PM-001',60)});const result=calculateCostGap('2026-11',tariff);expect(result.complete).toBe(false);expect(result.available).toBe(4);expect(result.gap).toBeNull()});

it('shows complete dummy machine cost and PLN gap by default for the current month',()=>{const gap=calculateCostGap('2026-11',tariff);expect(gap.available).toBe(5);expect(gap.machineCost).toBeGreaterThan(0);expect(gap.gap).not.toBeNull();expect(gap.percent).not.toBeNull();render(<CostGap month="2026-11" tariff={tariff} selectedMeter="all"/>);expect(screen.getByText('Tagihan PLN dummy')).toBeVisible();expect(screen.queryByText('Belum dapat dihitung')).not.toBeInTheDocument();expect(screen.queryByText('Belum lengkap')).not.toBeInTheDocument();expect(screen.getByText('5 dari 5 titik ukur · tarif internal v1')).toBeVisible()});
