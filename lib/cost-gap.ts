import {meters} from './data';
import {buildEnergyReport} from './energy-reports';
import {counterAt,dummyFrame} from './telemetry';
import {cost,timeWib} from './domain';
import {simulationSnapshot} from './simulation';
import type {Report} from './reports';
import {meterReading,type ReadingState} from './reading-state';
import {periodBounds} from './report-period';
export interface GapTariff{version:number;accounting:string;lwbp:string;wbp:string;plnLwbp?:string;plnWbp?:string}
export interface PlnBill{month:string;amount:string;tick:number;at:string;readings?:ReadingState}
export function calculateCostGap(month:string,tariff:GapTariff,bill?:PlnBill,tick=simulationSnapshot().tick){
 const cutoffTick=bill?.tick??tick;
 const readings=bill?.readings??simulationSnapshot();
 const machine=buildEnergyReport(month,'all','accounting',tariff,cutoffTick,readings);
 const {startAt,nextAt}=periodBounds(month);
 const endAt=Math.min(Date.parse(dummyFrame('PM-001',cutoffTick).at),nextAt);
 const periodFinalized=endAt===nextAt;
 const legacyBill=Boolean(bill&&!bill.readings&&!periodFinalized);
 const usable=machine.rows.filter((row,index)=>!legacyBill&&typeof row[5]==='number'&&(periodFinalized||meterReading(meters[index].id,cutoffTick,readings).current));
 const available=usable.length;
 const complete=available===meters.length;
 const machineCost=complete?machine.rows.reduce((sum,row)=>sum+Number(row[5]),0):null;
 const availableCost=usable.reduce((sum,row)=>sum+(typeof row[5]==='number'?Number(row[5]):0),0);
 const modelKwh=meters.reduce((sum,m)=>sum+counterAt(m.id,endAt)-counterAt(m.id,startAt),0);
 // Separate dummy bill scenario, explicitly including extra load and illustrative charges.
 const plnEnergy=modelKwh*1.04;
 const lwbpKwh=Number((plnEnergy*.8).toFixed(4)),wbpKwh=Number((plnEnergy*.2).toFixed(4));
 const lwbpCost=Number(cost([{kwh:String(lwbpKwh),rate:tariff.plnLwbp??tariff.lwbp}])??0);
 const wbpCost=Number(cost([{kwh:String(wbpKwh),rate:tariff.plnWbp??tariff.wbp}])??0);
 const base=Number(cost([{kwh:String(lwbpKwh),rate:tariff.plnLwbp??tariff.lwbp},{kwh:String(wbpKwh),rate:tariff.plnWbp??tariff.wbp}])??0);
 const energyRounding=base-lwbpCost-wbpCost;
 const fixedCost=2500000,additionalCost=Math.round((base+fixedCost)*.03);
 const dummyBill=base+fixedCost+additionalCost;
 const plnBill=bill?Number(bill.amount):dummyBill;
 const gap=machineCost===null?null:plnBill-machineCost;
 const percent=gap===null||plnBill===0?null:gap/plnBill*100;
 return {month,machine,available,complete,machineCost,availableCost,plnBill,dummyBill,gap,percent,cutoffTick,endAt,manual:Boolean(bill),legacyBill,modelKwh,plnEnergy,lwbpKwh,wbpKwh,lwbpCost,wbpCost,energyRounding,base,fixedCost,additionalCost};
}
export function costGapDetails(g:ReturnType<typeof calculateCostGap>,tariff:GapTariff):Report{
 const quantity=(value:number)=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:4}).format(value);
 const money=(value:number)=>'Rp'+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(value);
 const rows:Report['rows']=g.manual?[
  ['Tagihan PLN input manual','Nominal tersimpan untuk periode dan batas waktu yang sama',g.plnBill],
 ]:[
  ['Biaya LWBP',`${quantity(g.lwbpKwh)} kWh × Rp${quantity(Number(tariff.plnLwbp??tariff.lwbp))}/kWh (80% energi PLN)`,g.lwbpCost],
  ['Biaya WBP',`${quantity(g.wbpKwh)} kWh × Rp${quantity(Number(tariff.plnWbp??tariff.wbp))}/kWh (20% energi PLN)`,g.wbpCost],
  ...(g.energyRounding!==0?[['Penyesuaian pembulatan energi','Pembulatan gabungan LWBP + WBP',g.energyRounding]]:[]),
  ['Subtotal energi PLN','Biaya LWBP + biaya WBP + penyesuaian pembulatan',g.base],
  ['Biaya tetap simulasi','Asumsi biaya tetap per periode',g.fixedCost],
  ['Tambahan simulasi 3%',`3% × (${money(g.base)} + ${money(g.fixedCost)}), dibulatkan ke rupiah`,g.additionalCost],
 ];
 return {title:'Rincian perhitungan total PLN dan selisih',metadata:g.manual?[
  ['Rincian tagihan manual','Komponen energi, biaya tetap, dan tambahan tidak tersedia dari input nominal.'],
 ]:[
  ['Energi model seluruh mesin',`${quantity(g.modelKwh)} kWh`],
  ['Energi PLN simulasi',`${quantity(g.modelKwh)} kWh × 104% = ${quantity(g.plnEnergy)} kWh; tambahan beban 4% adalah asumsi dummy.`],
 ],headers:['Komponen','Dasar perhitungan','Nilai (Rp)'],rows:[...rows,
  ['Total PLN pembanding',g.manual?'Nominal tagihan input manual':'Subtotal energi PLN + biaya tetap + tambahan 3%',g.plnBill],
  ['Total biaya mesin',`Jumlah biaya internal seluruh ${meters.length} titik ukur; tarif Rp${quantity(Number(tariff.accounting))}/kWh`,g.machineCost],
  ['Selisih PLN − mesin',g.machineCost===null?`Belum lengkap: ${g.available}/${meters.length} titik ukur; subtotal tersedia ${money(g.availableCost)}`:`${money(g.plnBill)} − ${money(g.machineCost)}`,g.gap],
 ]};
}
export function buildCostGapReport(month:string,tariff:GapTariff,bill?:PlnBill,tick=simulationSnapshot().tick):Report{
 const g=calculateCostGap(month,tariff,bill,tick),details=costGapDetails(g,tariff);
 return {title:'SIMULASI — Selisih biaya mesin dan PLN',metadata:[['Periode',month],['Cakupan','Seluruh titik ukur eksklusif; bukan mesin terpilih saja'],['Batas perbandingan WIB',timeWib(new Date(g.endAt).toISOString())],['Tagihan PLN',g.manual?'Input lokal pengguna untuk rentang yang sama':'Dummy otomatis, bukan tagihan PLN nyata'],['Kelengkapan',`${g.available}/${meters.length} titik ukur`],['Tarif mesin',`Internal v${tariff.version}: Rp${tariff.accounting}/kWh`],['Tarif PLN simulasi',`LWBP Rp${tariff.plnLwbp??tariff.lwbp}/kWh; WBP Rp${tariff.plnWbp??tariff.wbp}/kWh`],['Rumus','Gap = tagihan PLN − biaya mesin; persen = gap / tagihan PLN × 100'],['Asumsi dummy','Energi PLN 104% model mesin; LWBP/WBP 80/20; biaya tetap Rp2.500.000 dan tambahan 3%. Bukan aturan tarif PLN.'],['Batas makna','Selisih biaya bukan ukuran susut energi atau kerugian listrik'],...details.metadata,...details.rows.map((row):[string,string]=>[String(row[0]),`${row[1]} — ${row[2]===null?'Belum dapat dihitung':`Rp${new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(row[2]))}`}`])],headers:['Biaya mesin (Rp)','Tagihan PLN (Rp)','Gap PLN − mesin (Rp)','Gap (%)','Status'],rows:[[g.machineCost,g.plnBill,g.gap,g.percent,g.complete?'Dapat dibandingkan pada data dummy':'BELUM LENGKAP / TIDAK SEWAKTU — gap tidak dihitung']]};
}
