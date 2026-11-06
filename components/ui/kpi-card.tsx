import {Zap} from 'lucide-react';
export function Kpi({label,value,unit,foot}:{label:string;value:string;unit?:string;foot:string}){return <article className="kpi"><div className="kpi-label">{label}<Zap size={18}/></div><div className="kpi-value">{value} <span>{unit}</span></div><p>{foot}</p></article>}
