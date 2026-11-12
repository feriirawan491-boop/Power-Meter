'use client';
import {useId} from 'react';
import type {HistorySample} from '@/lib/domain';
import {formatReading} from '@/lib/telemetry';

export default function TelemetryChart({samples,parameter}:{samples:readonly HistorySample[];parameter:'kw'|'voltage'|'current'}){
 const gradient=useId();
 const config={kw:{label:'ACTIVE POWER',unit:'kW',color:'#d46b26',digits:3},voltage:{label:'VOLTAGE',unit:'V',color:'#7560d9',digits:2},current:{label:'CURRENT',unit:'A',color:'#138c83',digits:2}}[parameter];
 const values=samples.map(s=>s[parameter]).filter((v):v is number=>v!==null);
 if(!values.length)return <div className="empty">Chart unavailable: no valid samples.</div>;
 const min=Math.min(...values),max=Math.max(...values),padding=Math.max((max-min)*.2,.05),low=min-padding,high=max+padding;
 const x=(index:number)=>70+index/Math.max(samples.length-1,1)*700;
 const y=(value:number)=>180-(value-low)/(high-low)*150;
 const segments:{line:string;area:string}[]=[];
 let points:{x:number;y:number}[]=[];
 function finish(){if(!points.length)return;const line=points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');segments.push({line,area:`${line} L${points.at(-1)!.x},180 L${points[0].x},180 Z`});points=[]}
 samples.forEach((sample,index)=>{const value=sample[parameter];if(value===null){finish();return}points.push({x:x(index),y:y(value)})});finish();
 const latest=samples.at(-1)?.[parameter]??null;
 const time=(index:number)=>new Date(samples[index].at).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour12:false});
 return <div className="history-area-chart"><div className="trend-heading"><div><h3>{config.label}</h3><p><span className="trend-live-dot" style={{background:config.color}}/>{samples.length} samples · WIB · line breaks when data is missing</p></div><div className="trend-current-value" style={{color:config.color}}><strong>{latest===null?'—':formatReading(latest,config.digits)}</strong><span>{config.unit}</span><small>Latest sample</small></div></div>
 <svg viewBox="0 0 800 222" role="img" aria-label={`Chart of ${parameter}, ${samples.length} simulated samples. Line breaks where data is missing.`}><defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={config.color} stopOpacity=".23"/><stop offset="100%" stopColor={config.color} stopOpacity=".01"/></linearGradient></defs>
 {[0,1,2,3].map(i=>{const position=30+i*50;return <g key={i}><line x1="70" x2="770" y1={position} y2={position} stroke="#e8ebf0" strokeDasharray="3 5"/><text x="58" y={position+4} textAnchor="end">{formatReading(high-(high-low)*i/3,2)}</text></g>})}
 {segments.map((segment,i)=><g key={i}><path d={segment.area} fill={`url(#${gradient})`}/><path d={segment.line} fill="none" stroke={config.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/></g>)}
 {latest!==null&&<g><line x1="770" x2="770" y1="26" y2="180" stroke={config.color} opacity=".3" strokeDasharray="3 4"/><circle cx="770" cy={y(latest)} r="7" fill={config.color} opacity=".13"/><circle cx="770" cy={y(latest)} r="3.5" fill={config.color} stroke="white" strokeWidth="2"/></g>}
 {[0,Math.floor((samples.length-1)/2),samples.length-1].filter((v,i,a)=>a.indexOf(v)===i).map((index,i)=><text key={index} x={x(index)} y="208" textAnchor={i===0?'start':index===samples.length-1?'end':'middle'}>{time(index)}</text>)}
 </svg><div className="trend-stats"><span>Minimum<strong>{formatReading(min,config.digits)} <small>{config.unit}</small></strong></span><span>Valid sample average<strong>{formatReading(values.reduce((a,b)=>a+b,0)/values.length,config.digits)} <small>{config.unit}</small></strong></span><span>Maksimum<strong>{formatReading(max,config.digits)} <small>{config.unit}</small></strong></span></div></div>
}
