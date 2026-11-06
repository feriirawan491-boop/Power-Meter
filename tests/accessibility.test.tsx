import {it,expect} from 'vitest';
import {render} from '@testing-library/react';
import axe from 'axe-core';
import {Dashboard} from '../components/dashboard';
import type {View} from '../constants/navigation';
for(const view of ['Ringkasan Pabrik','Alarm & Gangguan','Energi & Biaya','Laporan','Pengaturan'] satisfies View[]){it(`accessible semantics: ${view}`,async()=>{const {container}=render(<Dashboard initialView={view}/>);const result=await axe.run(container,{rules:{'color-contrast':{enabled:false}}});expect(result.violations.filter(v=>v.impact==='critical'||v.impact==='serious').map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([])});}
