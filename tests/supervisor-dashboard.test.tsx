import {setConnection} from '../lib/simulation';
import {it,expect} from 'vitest';
import {render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {SupervisorDashboard} from '../components/modules/supervisor-dashboard';
it('opens the selected machine dashboard and returns focus to its card',async()=>{
 render(<SupervisorDashboard/>);
 await userEvent.click(screen.getByRole('button',{name:'Lihat dashboard Kompresor 01'}));
 expect(screen.getByRole('heading',{name:'Kompresor 01'})).toBeVisible();
 expect(screen.getByRole('heading',{name:'VOLTAGE'})).toBeVisible();
 await userEvent.click(screen.getByRole('button',{name:'Kembali ke daftar mesin'}));
 await waitFor(()=>expect(screen.getByRole('button',{name:'Lihat dashboard Kompresor 01'})).toHaveFocus());
});
it('shows unavailable data for a disconnected machine',async()=>{setConnection('PM-004',480);
 render(<SupervisorDashboard/>);
 await userEvent.click(screen.getByRole('button',{name:'Lihat dashboard Dyeing & Finishing'}));
 expect(screen.getByRole('heading',{name:'Data mesin belum tersedia'})).toBeVisible();
 expect(screen.queryByRole('heading',{name:'Vavg'})).not.toBeInTheDocument();
});
