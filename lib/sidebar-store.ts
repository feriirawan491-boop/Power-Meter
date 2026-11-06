'use client';
import {useSyncExternalStore} from 'react';
const key='sakuratex-sidebar-collapsed';
let collapsed=false,loaded=false;
const listeners=new Set<()=>void>();
function snapshot(){if(!loaded&&typeof window!=='undefined'){loaded=true;try{collapsed=localStorage.getItem(key)==='true'}catch{}}return collapsed}
function subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener)}}
export function useSidebarCollapsed(){return useSyncExternalStore(subscribe,snapshot,()=>false)}
export function toggleSidebar(){collapsed=!snapshot();try{localStorage.setItem(key,String(collapsed))}catch{}listeners.forEach(listener=>listener())}
