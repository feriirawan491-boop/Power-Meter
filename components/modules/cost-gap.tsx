'use client';
import {useId,useState} from 'react';
import {ArrowLeftRight,Save,RotateCcw,Info,Factory,ReceiptText} from 'lucide-react';
import {useDemo,savePlnBill,resetPlnBill} from '@/lib/demo-store';
import {useSimulation} from '@/lib/simulation';
import {timeWib} from '@/lib/domain';
import {calculateCostGap,buildCostGapReport,type GapTariff} from '@/lib/cost-gap';
import {meters} from '@/lib/data';
import {ExportActions} from './shared';
const rupiah=(value:number)=>'Rp'+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(value);
export function CostGap({month,tariff,selectedMeter}:{month:string;tariff:GapTariff;selectedMeter:string}){
 const state=useDemo(),sim=useSimulation();const inputId=useId();const [draft,setDraft]=useState(''),[message,setMessage]=useState('');
 const bill=state.plnBills.find(b=>b.month===month),gap=calculateCostGap(month,tariff,bill,sim.tick);
 const quantity=(value:number)=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:2}).format(value);
 const rate=(value:string)=>'Rp'+new Intl.NumberFormat('id-ID',{maximumFractionDigits:4}).format(Number(value))+'/kWh';
 const internalEnergy=gap.machine.rows.reduce((sum,row)=>sum+(typeof row[1]==='number'?row[1]:0),0);
 return <section className="cost-gap" aria-label="Perbandingan biaya mesin dan PLN"><header className="cost-gap-heading"><div><h3><ArrowLeftRight size={20} aria-hidden="true"/>Perhitungan Internal & PLN</h3><p>{month==='2026-10'?'Oktober 2026':'November 2026 · berjalan'} · sampai {timeWib(new Date(gap.endAt).toISOString())} WIB</p></div><span className="badge unknown">{gap.manual?'Input tagihan lokal':'Tagihan PLN dummy'}</span></header>
 <p className="cost-gap-scope">Membandingkan total seluruh titik ukur dengan satu tagihan PLN untuk rentang yang sama.{selectedMeter!=='all'?' Filter satu mesin di atas tidak memperkecil cakupan perbandingan tagihan pabrik.':''}</p>
 <div className="cost-gap-columns">
 <section className="cost-gap-panel" aria-label="Perhitungan Internal">
 <h4><Factory size={18} aria-hidden="true"/>Perhitungan Internal</h4>
 <p>Konsumsi mesin × tarif internal</p>
 <dl><div><dt>Konsumsi mesin</dt><dd>{gap.complete?quantity(internalEnergy)+' kWh':'Belum lengkap'}</dd></div><div><dt>Tarif internal</dt><dd>Rp{quantity(Number(tariff.accounting))}/kWh</dd></div></dl>
 <div className="cost-gap-panel-total"><span>Total Internal</span><strong>{gap.machineCost===null?'Belum lengkap':rupiah(gap.machineCost)}</strong></div>
 <p>{gap.available} dari {meters.length} titik ukur · tarif internal v{tariff.version}</p>
 {gap.machineCost===null&&<p>Subtotal tersedia {rupiah(gap.availableCost)}. Total menunggu seluruh data mesin.</p>}
 </section>
 <section className="cost-gap-panel" aria-label="Perhitungan PLN">
 <h4><ReceiptText size={18} aria-hidden="true"/>Perhitungan PLN</h4>
 <p>{gap.manual?'Menggunakan nominal tagihan yang dimasukkan.':'Biaya listrik + biaya tetap + biaya tambahan'}</p>
 {!gap.manual&&<dl><div><dt>Konsumsi PLN (simulasi)</dt><dd>{quantity(gap.plnEnergy)} kWh</dd></div><div><dt>Tarif PLN LWBP</dt><dd>{rate(tariff.plnLwbp??tariff.lwbp)}</dd></div><div><dt>Tarif PLN WBP</dt><dd>{rate(tariff.plnWbp??tariff.wbp)}</dd></div><div><dt>Biaya listrik (LWBP + WBP)</dt><dd>{rupiah(gap.base)}</dd></div><div><dt>Biaya tetap</dt><dd>{rupiah(gap.fixedCost)}</dd></div><div><dt>Biaya tambahan (3%)</dt><dd>{rupiah(gap.additionalCost)}</dd></div></dl>}
 <div className="cost-gap-panel-total"><span>Total PLN</span><strong>{rupiah(gap.plnBill)}</strong></div>
 <p>{gap.manual?'Nilai input tersimpan; batas waktu perbandingan dibekukan.':'Asumsi: beban tambahan 4%; LWBP 80% dan WBP 20%.'}</p>
 </section>
 </div>
 {gap.legacyBill&&<p role="status" className="cost-gap-note">Tagihan lama belum menyimpan status pembacaan mesin. Simpan ulang tagihan untuk membandingkan dengan batas data saat ini.</p>}
 <p className="cost-gap-difference">{gap.gap===null?'Selisih belum dapat dihitung karena data mesin belum lengkap.':gap.gap===0?'Total Internal dan PLN sama.':<>Total PLN {gap.gap>0?'lebih besar':'lebih kecil'} <strong>{rupiah(Math.abs(gap.gap))}</strong> dari Total Internal.</>}</p>
 <details className="cost-gap-input"><summary>Masukkan nominal tagihan PLN pembanding</summary><p>Gunakan tagihan untuk seluruh titik ukur dan rentang yang tertulis di atas. Saat disimpan, perhitungan mesin memakai batas waktu tersebut; bukan membandingkan tagihan sebulan dengan data beberapa hari.</p><form onSubmit={e=>{e.preventDefault();if(!/^\d{1,15}$/.test(draft)){setMessage('Masukkan nominal rupiah bulat, tanpa titik atau koma.');return}const ok=savePlnBill(month as '2026-10'|'2026-11',draft,gap.legacyBill?sim.tick:gap.cutoffTick);setMessage(ok?'Tagihan tersimpan lokal. Perbandingan menggunakan batas waktu yang sama.':'Nominal tidak valid.');setDraft('')}}><label htmlFor={inputId}>Tagihan PLN untuk rentang ini (Rp)<input id={inputId} type="text" inputMode="numeric" pattern="[0-9]{1,15}" maxLength={15} required value={draft} onChange={e=>setDraft(e.target.value)} placeholder={String(gap.plnBill)} aria-describedby={`${inputId}-status`}/></label><button className="button primary" type="submit"><Save size={16} aria-hidden="true"/>Simpan pembanding</button>{bill&&<button className="button secondary" type="button" onClick={()=>{resetPlnBill(month);setMessage('Kembali memakai tagihan dummy otomatis.')}}><RotateCcw size={16} aria-hidden="true"/>Gunakan dummy otomatis</button>}</form><p id={`${inputId}-status`} role="status">{message}</p></details>
 <p className="cost-gap-note"><Info size={16} aria-hidden="true"/><span>{gap.manual?'Tagihan berasal dari input lokal.':'Angka PLN adalah simulasi, bukan tagihan resmi.'} Selisih biaya bukan berarti listrik terbuang.</span></p>
 <ExportActions report={buildCostGapReport(month,tariff,bill,sim.tick)}/></section>
}
