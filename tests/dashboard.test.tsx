import {setConnection} from '../lib/simulation';
import {describe,it,expect} from 'vitest';
import {render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Dashboard} from '../components/dashboard';
describe('Review prototype',()=>{
 it('never represents disconnected meter as normal zero',()=>{setConnection('PM-004',480);render(<Dashboard currentUser={{id:'test-admin',email:'admin@sakuratex.id',displayName:'Test Admin',role:'Admin',active:true}} initialView="Panel & Meter"/>);expect(screen.getByText('Disconnected')).toBeVisible();expect(screen.getAllByText('—').length).toBeGreaterThan(0)});
 it('search debounces to the relevant panel',async()=>{render(<Dashboard currentUser={{id:'test-admin',email:'admin@sakuratex.id',displayName:'Test Admin',role:'Admin',active:true}} initialView="Panel & Meter"/>);await userEvent.type(screen.getByLabelText('Search panels'),'Kompresor');await waitFor(()=>expect(screen.queryByRole('button',{name:'View details MDB Utama A'})).not.toBeInTheDocument());expect(screen.getByRole('button',{name:'View details Kompresor 01'})).toBeVisible()});
 it('opens meter detail in an accessible Radix dialog',async()=>{render(<Dashboard currentUser={{id:'test-admin',email:'admin@sakuratex.id',displayName:'Test Admin',role:'Admin',active:true}} initialView="Panel & Meter"/>);await userEvent.click(screen.getByRole('button',{name:'View details Kompresor 01'}));expect(screen.getByRole('dialog')).toHaveAccessibleName('Kompresor 01');await userEvent.click(screen.getByRole('button',{name:'Close details'}));expect(screen.queryByRole('dialog')).not.toBeInTheDocument()});
 it('shows the machine overview with accessible readings and navigation',()=>{render(<Dashboard currentUser={{id:'test-admin',email:'admin@sakuratex.id',displayName:'Test Admin',role:'Admin',active:true}}/>);expect(screen.getByRole('region',{name:'Machine list'})).toBeVisible();expect(screen.getByRole('heading',{name:'Machines & metering points'})).toBeVisible();expect(screen.getByRole('button',{name:'View dashboard MDB Utama A'})).toBeVisible()});
 it('keeps the overview focused and removes design system navigation',()=>{render(<Dashboard currentUser={{id:'test-admin',email:'admin@sakuratex.id',displayName:'Test Admin',role:'Admin',active:true}}/>);expect(screen.queryByRole('button',{name:'Design System'})).not.toBeInTheDocument();expect(screen.getByRole('region',{name:'Machine list'})).toBeVisible();expect(screen.queryByLabelText('Search panels')).not.toBeInTheDocument()});
});
it('collapses to the brand icon, preserves navigation names and remembers the choice',async()=>{
 const user=userEvent.setup();const view=render(<Dashboard currentUser={{id:'test-admin',email:'admin@sakuratex.id',displayName:'Test Admin',role:'Admin',active:true}}/>);
 await user.click(screen.getByRole('button',{name:'Collapse sidebar'}));
 expect(screen.getByRole('button',{name:'Expand sidebar'})).toHaveAttribute('aria-expanded','false');
 expect(screen.getByRole('img',{name:'Sakuratex icon'})).toHaveAttribute('src','/icon-sakuratex.png');
 expect(screen.getByRole('button',{name:'Panels & Meters'})).toHaveAttribute('title','Panels & Meters');
 expect(localStorage.getItem('sakuratex-sidebar-collapsed')).toBe('true');
 await user.click(screen.getByRole('button',{name:'Panels & Meters'}));
 expect(screen.getByRole('heading',{level:1,name:'Panels & Meters'})).toBeVisible();
 view.unmount();render(<Dashboard currentUser={{id:'test-admin',email:'admin@sakuratex.id',displayName:'Test Admin',role:'Admin',active:true}}/>);
 expect(screen.getByRole('button',{name:'Expand sidebar'})).toHaveAttribute('aria-expanded','false');
 await user.click(screen.getByRole('button',{name:'Expand sidebar'}));
 expect(screen.getByRole('button',{name:'Collapse sidebar'})).toHaveAttribute('aria-expanded','true');
 expect(localStorage.getItem('sakuratex-sidebar-collapsed')).toBe('false');
});
