import {setConnection} from '../lib/simulation';
import {describe,it,expect} from 'vitest';
import {unzipSync,strFromU8} from 'fflate';
import {csv,xlsx,type Report} from '../lib/reports';
import {buildEnergyReport} from '../components/modules/energy';
const report:Report={title:'SIMULASI',metadata:[['Zona','WIB']],headers:['Nama','Nilai','Kosong','Catatan'],rows:[['Meter & satu',12.5,null,'=HYPERLINK("evil")']]};
describe('Report output contract',()=>{
 it('CSV preserves null, Indonesian decimals and neutralizes formula text',()=>{const text=csv(report);expect(text.startsWith('\ufeff')).toBe(true);expect(text).toContain('"12,5";""');expect(text).toContain("'=HYPERLINK");});
 it('XLSX is a valid archive with numeric cells and literal formula-like strings',()=>{const files=unzipSync(xlsx(report));expect(files['[Content_Types].xml']).toBeDefined();const xml=strFromU8(files['xl/worksheets/sheet1.xml']);expect(xml).toContain('t="n"><v>12.5</v>');expect(xml).toContain('Meter &amp; satu');expect(xml).not.toContain('<f>');const doc=new DOMParser().parseFromString(xml,'application/xml');expect(doc.querySelector('parsererror')).toBeNull();});
 it('filtered meter keeps source counter identity',()=>{const tariff={version:1,accounting:'1000',lwbp:'1000',wbp:'1500'};const all=buildEnergyReport('2026-10','all','monthly',tariff);const one=buildEnergyReport('2026-10','PM-003','monthly',tariff);expect(one.rows[0]).toEqual(all.rows[2]);});
 it('November provides a partial subtotal and leaves disconnected meters missing',()=>{setConnection('PM-004',480);const r=buildEnergyReport('2026-11','all','pln',{version:1,accounting:'1000',lwbp:'1000',wbp:'1500'});expect(r.rows[0][5]).toBeGreaterThan(0);expect(r.rows[3][5]).toBeNull();expect(r.metadata.find(([k])=>k==='Mutu')?.[1]).toContain('PARSIAL');});
 it('two versions have distinct fixture costs',()=>{const t={version:1,accounting:'1000',lwbp:'1000',wbp:'1500'};const a=buildEnergyReport('2026-10','PM-001','accounting',t);const p=buildEnergyReport('2026-10','PM-001','pln',t);expect(a.rows[0][5]).toBe(Math.round(Number(a.rows[0][1])*1000));expect(Number(p.rows[0][5])).toBeGreaterThan(Number(a.rows[0][5]));});
});
