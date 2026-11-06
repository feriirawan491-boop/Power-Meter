'use client';
import {useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Factory,Gauge} from 'lucide-react';
import {formatReading} from '@/lib/telemetry';
import {timeWib} from '@/lib/domain';
import {useMeasurements} from '@/lib/measurements';
import {useDemo} from '@/lib/demo-store';
import {type Meter} from '@/lib/data';
import {Badge} from '@/components/ui/badge';
import {ReferenceDashboard} from './reference-dashboard';

export function SupervisorDashboard(){
 const shared=useMeasurements();const demo=useDemo();const meters=shared.meters.map(m=>({...m,status:m.age>30?'Belum dapat dinilai':demo.events.some(e=>e.meterId===m.id&&!e.recovered)?'Peringatan':'Normal teramati'}));
 const [selectedMeter,setSelected]=useState<Meter|null>(null);const selected=selectedMeter?meters.find(m=>m.id===selectedMeter.id)??null:null;
 const heading=useRef<HTMLHeadingElement>(null);
 const triggers=useRef<Record<string,HTMLButtonElement|null>>({});
 function open(meter:Meter){setSelected(meter);requestAnimationFrame(()=>heading.current?.focus())}
 function back(){const id=selected?.id;setSelected(null);requestAnimationFrame(()=>{if(id)triggers.current[id]?.focus()})}
 if(selected)return <section className="machine-detail"><button className="text-button machine-back" onClick={back}><ArrowLeft size={16}/>Kembali ke daftar mesin</button><div className="machine-detail-heading"><div><p className="machine-meta">{selected.id} · {selected.area}</p><h2 ref={heading} tabIndex={-1}>{selected.name}</h2></div><span className={`data-state ${selected.connected?'':'disconnected'}`}><span className="dot"/>{selected.connected?'Data contoh tersedia':'Data terputus'}</span></div>{selected.connected?<><p className="machine-demo-note">Seluruh pengukuran dan alarm mengikuti sumber dummy bersama per mesin, diperbarui setiap 10 detik.</p><ReferenceDashboard meterId={selected.id}/></>:<div className="card empty"><Gauge size={28}/><h3>Data mesin belum tersedia</h3><p>Meter belum mengirim data. Pengukuran akan muncul saat koneksi tersedia.</p></div>}</section>;
 return <section className="machine-overview" aria-label="Daftar mesin"><div className="machine-list-heading"><div><h2>Mesin & titik ukur</h2><p>Pilih mesin untuk melihat pengukuran dan riwayat listrik.</p></div><span>{meters.length} titik ukur</span></div><div className="machine-grid">{meters.map(m=><article className="machine-card" key={m.id}><div className="machine-card-top"><span className="machine-symbol"><Factory size={22}/></span><Badge text={m.status}/></div><div className="machine-card-title"><p className="machine-meta">{m.id} · {m.area}</p><h3>{m.name}</h3></div><dl className="machine-values"><div><dt>Daya aktif</dt><dd>{m.connected?formatReading(m.frame.kw,3):'—'} <small>kW</small></dd></div><div><dt>Counter energi</dt><dd>{m.connected?formatReading(m.frame.counter,4):'—'} <small>kWh</small></dd></div></dl><p className="machine-meta">{m.connected?`${timeWib(m.frame.at)} WIB`:'Data tidak tersedia'}</p><div className="machine-card-bottom"><span className={`data-state ${m.connected?'':'disconnected'}`}><span className="dot"/>{m.connected?'Data contoh':'Terputus'}</span><button ref={el=>{triggers.current[m.id]=el}} onClick={()=>open(m)} aria-label={`Lihat dashboard ${m.name}`}>Lihat data<ArrowRight size={16}/></button></div></article>)}</div></section>
}
