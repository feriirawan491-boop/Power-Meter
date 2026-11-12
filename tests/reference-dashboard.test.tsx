import {it,expect} from 'vitest';
import {render,screen,within} from '@testing-library/react';
import {ReferenceDashboard} from '../components/modules/reference-dashboard';
it('shows five timestamp readings in each table',()=>{
 render(<ReferenceDashboard/>);
 const tables=screen.getAllByRole('table');
 expect(tables).toHaveLength(5);
 for(const table of tables){
  expect(within(table).getAllByRole('row')).toHaveLength(6);
  expect(within(table).getAllByRole('cell').length).toBeGreaterThanOrEqual(10);
 }
 expect(screen.getAllByText('1–5 of 36')).toHaveLength(5);
 expect(screen.getByRole('button',{name:'Next page Main'})).toBeEnabled();
});
