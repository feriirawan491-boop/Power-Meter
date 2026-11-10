import {meters} from './data';
import {consumption,cost,timeWib} from './domain';
import {counterAt,dummyFrame} from './telemetry';
import {simulationSnapshot} from './simulation';
import {meterReading,type ReadingState} from './reading-state';
import {periodBounds} from './report-period';
import type {Report} from './reports';
export interface EnergyTariff{version:number;accounting:string;lwbp:string;wbp:string;plnLwbp?:string;plnWbp?:string}
export function buildEnergyReport(month:string,meterId:string,kind:string,tariff:EnergyTariff,tick=simulationSnapshot().tick,readings:ReadingState=simulationSnapshot()):Report{
 const selected=meters.filter(m=>meterId==='all'||m.id===meterId);
 const {startAt,nextAt}=periodBounds(month);
 const asOf=Date.parse(dummyFrame('PM-001',tick).at),endAt=Math.min(nextAt,asOf),partial=endAt<nextAt;
 const plnLwbp=tariff.plnLwbp??tariff.lwbp,plnWbp=tariff.plnWbp??tariff.wbp;
 return {
  title:`SIMULASI — ${kind==='monthly'?'Rekap energi':kind==='pln'?'Estimasi biaya versi PLN':'Estimasi biaya Akunting'}`,
  metadata:[['Periode',month],['Sumber','Generator dummy bersama dengan dashboard mesin'],['Batas pembacaan WIB',timeWib(new Date(endAt).toISOString())],['Tarif',`v${tariff.version} — Akunting Rp${tariff.accounting}/kWh; internal LWBP/WBP Rp${tariff.lwbp}/${tariff.wbp}; PLN simulasi LWBP/WBP Rp${plnLwbp}/${plnWbp}`],['Mutu',partial?'PARSIAL — sampai sampel terakhir, bukan tagihan akhir':'LENGKAP pada simulasi'],['Basis kategori','LWBP 80% / WBP 20% adalah asumsi dummy'],['Timezone','Asia/Jakarta (WIB)']],
  headers:kind==='monthly'?['Meter','E-awal (kWh)','E-akhir (kWh)','Konsumsi (kWh)','Waktu batas akhir WIB','Mutu']:['Meter','Konsumsi (kWh)','LWBP (kWh)','WBP (kWh)','Tarif/versi','Biaya energi (Rp)'],
  rows:selected.map(m=>{
   const reading=meterReading(m.id,tick,readings),available=!partial||reading.available;
   const readAt=partial&&!reading.current?Math.min(endAt,Date.parse(dummyFrame(m.id,reading.tick).at)):endAt;
   const start=Number(counterAt(m.id,startAt).toFixed(4)),end=available?Number(counterAt(m.id,readAt).toFixed(4)):null,delta=consumption(start,end).value;
   const amount=delta===null?null:cost(kind==='pln'?[{kwh:(delta*.8).toFixed(4),rate:plnLwbp},{kwh:(delta*.2).toFixed(4),rate:plnWbp}]:[{kwh:delta.toFixed(4),rate:tariff.accounting}]);
   return kind==='monthly'?[m.name,start,end,delta,available?timeWib(new Date(readAt).toISOString()):'Data terputus',available?(partial?(reading.current?'PARSIAL':'TERLAMBAT'):'LENGKAP'):'MISSING']:[m.name,delta,delta===null?null:Number((delta*.8).toFixed(4)),delta===null?null:Number((delta*.2).toFixed(4)),`v${tariff.version} · ${kind==='pln'?`${plnLwbp}/${plnWbp}`:tariff.accounting}`,amount===null?null:Number(amount)];
  }),
 };
}
// The energy screen, report preview, CSV, XLSX and print use the same presentation.
export function energyReportView(raw:Report,kind:string,tariff:EnergyTariff):Report{
 const monthly=kind==='monthly',pln=kind==='pln';
 return {...raw,metadata:raw.metadata.filter(([k])=>k!=='Basis kategori'||pln).filter(([k])=>k!=='Tarif'||!monthly),headers:!monthly&&!pln?['Panel / titik ukur','Konsumsi (kWh)','Tarif internal (Rp/kWh)','Biaya energi (Rp)']:raw.headers,rows:!monthly&&!pln?raw.rows.map(row=>[row[0],row[1],Number(tariff.accounting),row[5]]):raw.rows};
}
