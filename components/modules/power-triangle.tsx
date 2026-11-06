'use client';
import {useId} from 'react';
import type {DummyFrame} from '@/lib/telemetry';
import {Triangle} from 'lucide-react';

export function PowerTriangle({frame}:{frame:DummyFrame}){const titleId=useId();const p=frame.kw,q=frame.kvar,s=frame.kva,phi=Math.atan2(q,p)*180/Math.PI;const top=260-350*q/p;return <article className="power-triangle" aria-labelledby={titleId}><header><h3 id={titleId}><Triangle size={22} aria-hidden="true"/>Power Triangle</h3><span>S² = P² + Q²</span></header><p className="power-triangle-caption">Dihitung dari sampel mesin yang sama · data dummy</p><div className="triangle-layout"><div className="triangle-plot"><svg viewBox="0 0 660 320" role="img" aria-label={`Segitiga daya P ${p.toFixed(3)} kW, Q ${q.toFixed(3)} kvar, S ${s.toFixed(3)} kVA, PF ${frame.pf.toFixed(3)}`}>
{Array.from({length:15},(_,i)=><line key={`v${i}`} x1={60+i*40} x2={60+i*40} y1="20" y2="280" stroke="#f0f1f4"/>)}
{Array.from({length:7},(_,i)=><line key={`h${i}`} x1="60" x2="620" y1={20+i*40} y2={20+i*40} stroke="#f0f1f4"/>)}
<path d="M100 35V260H610" fill="none" stroke="#c7cbd2" strokeWidth="1.5"/>
<text x="72" y="30" textAnchor="middle" className="triangle-axis">Q (kvar)</text><text x="600" y="290" textAnchor="end" className="triangle-axis">P (kW)</text>
<path d={`M100 260H450V${top}Z`} fill="#b33fff" fillOpacity=".07"/>
<path d="M434 260V244H450" stroke="#b9bec7" fill="none" strokeWidth="1.5"/>
<path d="M100 260H450" stroke="#00a876" strokeWidth="4"/><path d="m450 260-12-6v12Z" fill="#00a876"/>
<path d={`M450 260V${top}`} stroke="#ef8a00" strokeWidth="4"/><path d={`m450 ${top}-6 12h12Z`} fill="#ef8a00"/>
<path d={`M100 260 450 ${top}`} stroke="#a943ef" strokeWidth="4"/><path d={`m450 ${top}-14-2 4 13Z`} fill="#a943ef"/>
<path d="M155 260A55 55 0 0 0 153 245" fill="none" stroke="#008ccc" strokeWidth="2"/>
<text x="164" y="238" fill="#0078ad" fontSize="16">φ = {phi.toFixed(1)}°</text>
<text x="275" y="285" fill="#00865e" textAnchor="middle" fontSize="18" fontWeight="600">P = {p.toFixed(3)} kW</text>
<text x="472" y="206" fill="#a85b00" fontSize="18" fontWeight="600">Q = {q.toFixed(3)}</text><text x="472" y="229" fill="#a85b00" fontSize="13">kvar</text>
<text x="270" y="184" fill="#8c2ace" textAnchor="middle" fontSize="18" fontWeight="600">S = {s.toFixed(3)} kVA</text>
</svg></div><aside className="triangle-sidebar" aria-label="Legenda dan faktor daya"><div className="triangle-legend"><span><i className="active-power"/>Active (P)</span><span><i className="reactive-power"/>Reactive (Q)</span><span><i className="apparent-power"/>Apparent (S)</span></div><div className="triangle-pf"><strong>PF = {frame.pf.toFixed(3)}</strong><span>P / S · sampel yang sama</span></div></aside></div><p className="triangle-verification">S² = P² + Q² · {s.toFixed(3)}² ≈ {p.toFixed(3)}² + {q.toFixed(3)}² · φ = atan(Q/P). Diagram ilustrasi; angka mengikuti sampel mesin.</p></article>}
