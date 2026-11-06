'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {LogOut,LoaderCircle} from 'lucide-react';
export function LogoutButton(){const router=useRouter();const [busy,setBusy]=useState(false),[error,setError]=useState('');return <div className="logout-control"><button type="button" className="icon-button logout-button" aria-label="Keluar dari akun demo" title="Keluar" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{const response=await fetch('/api/auth/logout',{method:'POST'});if(!response.ok)throw new Error('Logout gagal');router.replace('/login');router.refresh()}catch{setError('Gagal keluar. Coba lagi.');setBusy(false)}}}>{busy?<LoaderCircle size={18} className="login-spinner" aria-hidden="true"/>:<LogOut size={18} aria-hidden="true"/>}</button>{error&&<span role="alert" className="logout-error">{error}</span>}</div>}
