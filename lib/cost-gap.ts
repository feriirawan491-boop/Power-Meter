import {meters} from './data';
import {buildEnergyReport} from './energy-reports';
import {counterAt,dummyFrame} from './telemetry';
import {cost,timeWib} from './domain';
import {simulationSnapshot} from './simulation';
import type {Report} from './reports';
export interface GapTariff{version:number;accounting:string;lwbp:string;wbp:string;plnLwbp?:string;plnWbp?:string}
export interface PlnBill{month:string;amount:string;tick:number;at:string}
export function calculateCostGap(month:string,tariff:GapTariff,bill?:PlnBill,tick=simulationSnapshot().tick){
 const cutoffTick=bill?.tick??tick;
 const machine=buildEnergyReport(month,'all','accounting',tariff,cutoffTick);
 const sim=simulationSnapshot();const periodFinalized=month==='2026-10';
 const usable=machine.rows.filter((row,index)=>typeof row[5]==='number'&&(periodFinalized||(sim.ages[meters[index].id]??(meters[index].connected?10:480))<=30));
 const available=usable.length;
 const complete=available===meters.length;
 const machineCost=complete?machine.rows.reduce((sum,row)=>sum+Number(row[5]),0):null;
 const availableCost=usable.reduce((sum,row)=>sum+(typeof row[5]==='number'?Number(row[5]):0),0);
 const startAt=Date.parse(`${month}-01T00:00:00+07:00`);
 const endAt=Math.min(Date.parse(dummyFrame('PM-001',cutoffTick).at),Date.parse(month==='2026-10'?'2026-11-01T00:00:00+07:00':'2026-12-01T00:00:00+07:00'));
 const modelKwh=meters.reduce((sum,m)=>sum+counterAt(m.id,endAt)-counterAt(m.id,startAt),0);
 // Separate dummy bill scenario, explicitly including extra load and illustrative charges.
 const plnEnergy=modelKwh*1.04;
 const base=Number(cost([{kwh:(plnEnergy*.8).toFixed(4),rate:tariff.plnLwbp??tariff.lwbp},{kwh:(plnEnergy*.2).toFixed(4),rate:tariff.plnWbp??tariff.wbp}])??0);
 const dummyBill=Math.round((base+2500000)*1.03);
 const plnBill=bill?Number(bill.amount):dummyBill;
 const gap=machineCost===null?null:plnBill-machineCost;
 const percent=gap===null||plnBill===0?null:gap/plnBill*100;
 return {month,machine,available,complete,machineCost,availableCost,plnBill,dummyBill,gap,percent,cutoffTick,endAt,manual:Boolean(bill)};
}
export function buildCostGapReport(month:string,tariff:GapTariff,bill?:PlnBill,tick=simulationSnapshot().tick):Report{
 const g=calculateCostGap(month,tariff,bill,tick);
 return {title:'SIMULASI — Selisih biaya mesin dan PLN',metadata:[['Periode',month],['Cakupan','Seluruh titik ukur eksklusif; bukan mesin terpilih saja'],['Batas perbandingan WIB',timeWib(new Date(g.endAt).toISOString())],['Tagihan PLN',g.manual?'Input lokal pengguna untuk rentang yang sama':'Dummy otomatis, bukan tagihan PLN nyata'],['Kelengkapan',`${g.available}/${meters.length} titik ukur`],['Tarif mesin',`Internal v${tariff.version}: Rp${tariff.accounting}/kWh`],['Tarif PLN simulasi',`LWBP Rp${tariff.plnLwbp??tariff.lwbp}/kWh; WBP Rp${tariff.plnWbp??tariff.wbp}/kWh`],['Rumus','Gap = tagihan PLN − biaya mesin; persen = gap / tagihan PLN × 100'],['Asumsi dummy','Energi PLN 104% model mesin; LWBP/WBP 80/20; biaya tetap Rp2.500.000 dan tambahan 3%. Bukan aturan tarif PLN.'],['Batas makna','Selisih biaya bukan ukuran susut energi atau kerugian listrik']],headers:['Biaya mesin (Rp)','Tagihan PLN (Rp)','Gap PLN − mesin (Rp)','Gap (%)','Status'],rows:[[g.machineCost,g.plnBill,g.gap,g.percent,g.complete?'Dapat dibandingkan pada data dummy':'BELUM LENGKAP / TIDAK SEWAKTU — gap tidak dihitung']]};
}
