import {it,expect,vi,afterEach} from 'vitest';
import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {LoginScreen} from '../components/login-screen';
afterEach(()=>vi.unstubAllGlobals());
it('fills the supplied demo credentials and toggles password visibility',async()=>{
 render(<LoginScreen/>);await userEvent.type(screen.getByLabelText('Email'),'demo@sakuratex.id');await userEvent.type(screen.getByLabelText('Password'),'demo123');expect(screen.getByLabelText('Password')).toHaveAttribute('type','password');await userEvent.click(screen.getByRole('button',{name:'Show password'}));expect(screen.getByLabelText('Password')).toHaveAttribute('type','text');
});
it('shows invalid credentials without navigating',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,json:async()=>({error:'Email or password is incorrect.'})}));render(<LoginScreen/>);await userEvent.type(screen.getByLabelText('Email'),'demo@sakuratex.id');await userEvent.type(screen.getByLabelText('Password'),'wrong');await userEvent.click(screen.getByRole('button',{name:'Sign in to dashboard'}));expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect.');expect(screen.getByRole('button',{name:'Sign in to dashboard'})).toBeEnabled();
});
it('submits demo credentials to the server and uses the intended destination',async()=>{
 const request=vi.fn().mockResolvedValue({ok:true,json:async()=>({ok:true,next:'/meters'})});vi.stubGlobal('fetch',request);render(<LoginScreen next="/meters"/>);await userEvent.type(screen.getByLabelText('Email'),'demo@sakuratex.id');await userEvent.type(screen.getByLabelText('Password'),'demo123');await userEvent.click(screen.getByRole('button',{name:'Sign in to dashboard'}));expect(request).toHaveBeenCalledWith('/api/auth/login',expect.objectContaining({method:'POST',body:JSON.stringify({email:'demo@sakuratex.id',password:'demo123',next:'/meters'})}));
});

it('reports a server error instead of mislabeling a non-JSON response as a connection failure',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:500,json:async()=>{throw new SyntaxError('Unexpected HTML')}}));render(<LoginScreen/>);await userEvent.type(screen.getByLabelText('Email'),'demo@sakuratex.id');await userEvent.type(screen.getByLabelText('Password'),'demo123');await userEvent.click(screen.getByRole('button',{name:'Sign in to dashboard'}));expect(await screen.findByRole('alert')).toHaveTextContent('The login service is having trouble. Please try again or contact the administrator.');});
