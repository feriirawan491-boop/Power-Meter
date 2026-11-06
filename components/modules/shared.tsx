'use client';
import {useState,useEffect} from 'react';
import {createPortal,flushSync} from 'react-dom';
import {FileDown,Sheet,Printer} from 'lucide-react';
import type {Report} from '@/lib/reports';

import {download} from '@/lib/reports';
export function ReportTable({report}:{report:Report}){return <div className="table-scroll"><table><thead><tr>{report.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{report.rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j}>{v===null?'—':typeof v==='number'?new Intl.NumberFormat('id-ID',{maximumFractionDigits:report.headers[j]?.includes('(Rp)')?0:4}).format(v):v}</td>)}</tr>)}</tbody></table>{!report.rows.length&&<div className="empty">Tidak ada data sesuai filter.</div>}</div>}
export function ExportActions({report}:{report:Report}){const [printing,setPrinting]=useState<Report|null>(null);
useEffect(()=>{const done=()=>{setPrinting(null);document.body.removeAttribute('data-report-print')};window.addEventListener('afterprint',done);return()=>{window.removeEventListener('afterprint',done);document.body.removeAttribute('data-report-print')}},[]);
function print(){flushSync(()=>setPrinting(structuredClone(report)));document.body.setAttribute('data-report-print','true');window.print()}
return <><div className="preview-tags no-print"><button className="button secondary" onClick={()=>download(report,'csv')}><FileDown size={16} aria-hidden="true"/>Unduh CSV simulasi</button><button className="button secondary" onClick={()=>download(report,'xlsx')}><Sheet size={16} aria-hidden="true"/>Unduh Excel simulasi</button><button className="button secondary" onClick={print}><Printer size={16} aria-hidden="true"/>Cetak pratinjau</button></div>{printing&&createPortal(<div className="selected-print-target"><ReportPreview report={printing}/></div>,document.body)}</>}
export function ReportPreview({report}:{report:Report}){return <section className="report-print"><h2>{report.title}</h2><dl className="report-meta">{report.metadata.map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><ReportTable report={report}/></section>}
export function Notice({children}:{children:React.ReactNode}){return <p className="health-note">{children}</p>}
