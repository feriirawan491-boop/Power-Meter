'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="card placeholder"><h1>Tampilan gagal dimuat</h1><p>Coba muat ulang. Data simulasi bukan pembacaan produksi.</p><button className="button primary" onClick={reset}>Coba lagi</button></main>}
