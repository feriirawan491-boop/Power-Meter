import {setConnection} from '../lib/simulation';
import {describe,it,expect} from 'vitest';
import {render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Dashboard} from '../components/dashboard';
describe('Review prototype',()=>{
 it('labels fixture data and never represents disconnected meter as normal zero',()=>{setConnection('PM-004',480);render(<Dashboard initialView="Panel & Meter"/>);expect(screen.getByText(/Semua angka simulasi/)).toBeVisible();expect(screen.getByText('Belum dapat dinilai',{selector:'.badge'})).toBeVisible();expect(screen.getByText('Terputus')).toBeVisible()});
 it('search debounces to the relevant panel',async()=>{render(<Dashboard initialView="Panel & Meter"/>);await userEvent.type(screen.getByLabelText('Cari panel'),'Kompresor');await waitFor(()=>expect(screen.queryByRole('button',{name:'Lihat detail MDB Utama A'})).not.toBeInTheDocument());expect(screen.getByRole('button',{name:'Lihat detail Kompresor 01'})).toBeVisible()});
 it('opens meter detail in an accessible Radix dialog',async()=>{render(<Dashboard initialView="Panel & Meter"/>);await userEvent.click(screen.getByRole('button',{name:'Lihat detail Kompresor 01'}));expect(screen.getByRole('dialog')).toHaveAccessibleName('Kompresor 01');await userEvent.click(screen.getByRole('button',{name:'Tutup detail'}));expect(screen.queryByRole('dialog')).not.toBeInTheDocument()});
 it('validates empty review note before saving',async()=>{render(<Dashboard/>);await userEvent.click(screen.getByRole('button',{name:'Catatan review'}));await userEvent.click(screen.getByRole('button',{name:'Simpan catatan lokal'}));expect(await screen.findByText('Tulis minimal 10 karakter.')).toBeVisible();expect(screen.getByLabelText('Masukan Anda')).toHaveFocus()});
 it('keeps the overview focused and removes design system navigation',()=>{render(<Dashboard/>);expect(screen.queryByRole('button',{name:'Design System'})).not.toBeInTheDocument();expect(screen.getByRole('region',{name:'Daftar mesin'})).toBeVisible();expect(screen.queryByLabelText('Cari panel')).not.toBeInTheDocument()});
});
it('collapses to the brand icon, preserves navigation names and remembers the choice',async()=>{
 const user=userEvent.setup();const view=render(<Dashboard/>);
 await user.click(screen.getByRole('button',{name:'Ciutkan sidebar'}));
 expect(screen.getByRole('button',{name:'Perluas sidebar'})).toHaveAttribute('aria-expanded','false');
 expect(screen.getByRole('img',{name:'Ikon Sakuratex'})).toHaveAttribute('src','/icon-sakuratex.png');
 expect(screen.getByRole('button',{name:'Panel & Meter'})).toHaveAttribute('title','Panel & Meter');
 expect(localStorage.getItem('sakuratex-sidebar-collapsed')).toBe('true');
 await user.click(screen.getByRole('button',{name:'Panel & Meter'}));
 expect(screen.getByRole('heading',{level:1,name:'Panel & Meter'})).toBeVisible();
 view.unmount();render(<Dashboard/>);
 expect(screen.getByRole('button',{name:'Perluas sidebar'})).toHaveAttribute('aria-expanded','false');
 await user.click(screen.getByRole('button',{name:'Perluas sidebar'}));
 expect(screen.getByRole('button',{name:'Ciutkan sidebar'})).toHaveAttribute('aria-expanded','true');
 expect(localStorage.getItem('sakuratex-sidebar-collapsed')).toBe('false');
});
