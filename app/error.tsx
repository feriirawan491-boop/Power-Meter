'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="card placeholder"><h1>Page failed to load</h1><p>Please try again. Simulated data is not a production reading.</p><button className="button primary" onClick={reset}>Try again</button></main>}
