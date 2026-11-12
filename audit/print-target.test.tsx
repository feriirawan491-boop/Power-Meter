import {it,expect,vi} from 'vitest';
import {render,screen,within,fireEvent,cleanup} from '@testing-library/react';
import {EnergyWorkspace} from '../components/modules/energy';
vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn(),replace:vi.fn()})}));
it('A-11 the cost-gap print button targets the cost-gap report',()=>{const spy=vi.spyOn(window,'print').mockImplementation(()=>{});try{render(<EnergyWorkspace role="Supervisor"/>);const gap=screen.getByRole('region',{name:'Machine and PLN cost comparison'});fireEvent.click(within(gap).getByRole('button',{name:'Print preview'}));expect(spy).toHaveBeenCalledOnce();expect(document.body.getAttribute('data-report-print')).toBe('true');const printable=document.querySelector('.selected-print-target .report-print')?.textContent;expect(printable).toContain('SIMULASI — Selisih biaya mesin dan PLN')}finally{cleanup();spy.mockRestore()}});
