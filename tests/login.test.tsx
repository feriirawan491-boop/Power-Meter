import {it,expect,vi,afterEach} from 'vitest';
import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {LoginScreen} from '../components/login-screen';
afterEach(()=>vi.unstubAllGlobals());
it('fills the supplied demo credentials and toggles password visibility',async()=>{
 render(<LoginScreen/>);await userEvent.click(screen.getByRole('button',{name:'Isi akun demo'}));expect(screen.getByLabelText('Email')).toHaveValue('demo@sakuratex.id');expect(screen.getByLabelText('Kata sandi')).toHaveValue('demo123');expect(screen.getByLabelText('Kata sandi')).toHaveAttribute('type','password');await userEvent.click(screen.getByRole('button',{name:'Tampilkan kata sandi'}));expect(screen.getByLabelText('Kata sandi')).toHaveAttribute('type','text');
});
it('shows invalid credentials without navigating',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,json:async()=>({error:'Email atau kata sandi tidak sesuai.'})}));render(<LoginScreen/>);await userEvent.click(screen.getByRole('button',{name:'Isi akun demo'}));await userEvent.click(screen.getByRole('button',{name:'Masuk ke dashboard'}));expect(await screen.findByRole('alert')).toHaveTextContent('Email atau kata sandi tidak sesuai.');expect(screen.getByRole('button',{name:'Masuk ke dashboard'})).toBeEnabled();
});
it('submits demo credentials to the server and uses the intended destination',async()=>{
 const request=vi.fn().mockResolvedValue({ok:true,json:async()=>({ok:true,next:'/meters'})});vi.stubGlobal('fetch',request);render(<LoginScreen next="/meters"/>);await userEvent.click(screen.getByRole('button',{name:'Isi akun demo'}));await userEvent.click(screen.getByRole('button',{name:'Masuk ke dashboard'}));expect(request).toHaveBeenCalledWith('/api/auth/login',expect.objectContaining({method:'POST',body:JSON.stringify({email:'demo@sakuratex.id',password:'demo123',next:'/meters'})}));
});
