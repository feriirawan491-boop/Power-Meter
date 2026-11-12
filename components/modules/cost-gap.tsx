'use client';
import {useId,useState} from 'react';
import {ArrowLeftRight,Save,RotateCcw,Info,Factory,ReceiptText} from 'lucide-react';
import {useDemo,savePlnBill,resetPlnBill} from '@/lib/demo-store';
import {useSimulation} from '@/lib/simulation';
import {timeWib} from '@/lib/domain';
import {calculateCostGap,buildCostGapReport,type GapTariff} from '@/lib/cost-gap';
import {meters} from '@/lib/data';
import {ExportActions} from './shared';
const rupiah=(value:number)=>'Rp'+new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
export function CostGap({month,tariff,selectedMeter}:{month:string;tariff:GapTariff;selectedMeter:string}){
 const state=useDemo(),sim=useSimulation();const inputId=useId();const [draft,setDraft]=useState(''),[message,setMessage]=useState('');
 const bill=state.plnBills.find(b=>b.month===month),gap=calculateCostGap(month,tariff,bill,sim.tick);
 const quantity=(value:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(value);
 const rate=(value:string)=>'Rp'+new Intl.NumberFormat('en-US',{maximumFractionDigits:4}).format(Number(value))+'/kWh';
 const internalEnergy=gap.machine.rows.reduce((sum,row)=>sum+(typeof row[1]==='number'?row[1]:0),0);
 return <section className="cost-gap" aria-label="Machine and PLN cost comparison"><header className="cost-gap-heading"><div><h3><ArrowLeftRight size={20} aria-hidden="true"/>Internal & PLN calculation</h3><p>{month==='2026-10'?'October 2026':'November 2026 · in progress'} · through {timeWib(new Date(gap.endAt).toISOString())} WIB</p></div><span className="badge unknown">{gap.manual?'Local bill entry':'Simulated PLN bill'}</span></header>
 <p className="cost-gap-scope">Compares all metering points with one PLN bill for the same period.{selectedMeter!=='all'?' The single-machine filter above does not reduce the plant bill comparison scope.':''}</p>
 <div className="cost-gap-columns">
 <section className="cost-gap-panel" aria-label="Internal calculation">
 <h4><Factory size={18} aria-hidden="true"/>Internal calculation</h4>
 <p>Machine consumption × internal rate</p>
 <dl><div><dt>Machine consumption</dt><dd>{gap.complete?quantity(internalEnergy)+' kWh':'Incomplete'}</dd></div><div><dt>Internal rate</dt><dd>Rp{quantity(Number(tariff.accounting))}/kWh</dd></div></dl>
 <div className="cost-gap-panel-total"><span>Internal total</span><strong>{gap.machineCost===null?'Incomplete':rupiah(gap.machineCost)}</strong></div>
 <p>{gap.available} of {meters.length} metering points · internal rate v{tariff.version}</p>
 {gap.machineCost===null&&<p>Available subtotal {rupiah(gap.availableCost)}. Total is pending data from all machines.</p>}
 </section>
 <section className="cost-gap-panel" aria-label="PLN calculation">
 <h4><ReceiptText size={18} aria-hidden="true"/>PLN calculation</h4>
 <p>{gap.manual?'Using the entered bill amount.':'Electricity cost + fixed fee + additional fee'}</p>
 {!gap.manual&&<dl><div><dt>PLN consumption (simulated)</dt><dd>{quantity(gap.plnEnergy)} kWh</dd></div><div><dt>PLN LWBP rate</dt><dd>{rate(tariff.plnLwbp??tariff.lwbp)}</dd></div><div><dt>PLN WBP rate</dt><dd>{rate(tariff.plnWbp??tariff.wbp)}</dd></div><div><dt>Electricity cost (LWBP + WBP)</dt><dd>{rupiah(gap.base)}</dd></div><div><dt>Fixed fee</dt><dd>{rupiah(gap.fixedCost)}</dd></div><div><dt>Additional fee (3%)</dt><dd>{rupiah(gap.additionalCost)}</dd></div></dl>}
 <div className="cost-gap-panel-total"><span>PLN total</span><strong>{rupiah(gap.plnBill)}</strong></div>
 <p>{gap.manual?'Entered value saved; comparison time boundary is fixed.':'Assumption: 4% additional load; 80% LWBP and 20% WBP.'}</p>
 </section>
 </div>
 {gap.legacyBill&&<p role="status" className="cost-gap-note">The previous bill did not save machine reading status. Save the bill again to compare it with the current data boundary.</p>}
 <p className="cost-gap-difference">{gap.gap===null?'Difference cannot be calculated because machine data is incomplete.':gap.gap===0?'Internal total dan PLN sama.':<>PLN total {gap.gap>0?'greater':'less'} <strong>{rupiah(Math.abs(gap.gap))}</strong> of Internal total.</>}</p>
 <details className="cost-gap-input"><summary>Enter the PLN bill amount for comparison</summary><p>Use a bill for all metering points and the period shown above. When saved, machine calculations use that time boundary; a full-month bill is not compared with only a few days of data.</p><form onSubmit={e=>{e.preventDefault();if(!/^\d{1,15}$/.test(draft)){setMessage('Enter a whole rupiah amount, without periods or commas.');return}const ok=savePlnBill(month as '2026-10'|'2026-11',draft,gap.legacyBill?sim.tick:gap.cutoffTick);setMessage(ok?'Bill saved locally. The comparison uses the same time boundary.':'Invalid amount.');setDraft('')}}><label htmlFor={inputId}>PLN bill for this period (IDR)<input id={inputId} type="text" inputMode="numeric" pattern="[0-9]{1,15}" maxLength={15} required value={draft} onChange={e=>setDraft(e.target.value)} placeholder={String(gap.plnBill)} aria-describedby={`${inputId}-status`}/></label><button className="button primary" type="submit"><Save size={16} aria-hidden="true"/>Save comparison</button>{bill&&<button className="button secondary" type="button" onClick={()=>{resetPlnBill(month);setMessage('Using the automatic simulated bill again.')}}><RotateCcw size={16} aria-hidden="true"/>Use automatic simulation</button>}</form><p id={`${inputId}-status`} role="status">{message}</p></details>
 <p className="cost-gap-note"><Info size={16} aria-hidden="true"/><span>{gap.manual?'Tagihan berasal of input lokal.':'PLN figures are simulated, not an official bill.'} A cost difference does not mean electricity was wasted.</span></p>
 <ExportActions report={buildCostGapReport(month,tariff,bill,sim.tick)}/></section>
}
