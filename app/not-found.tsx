import Link from 'next/link';
export default function NotFound(){return <main className="card placeholder"><h1>Page not found</h1><p>Check the address or return to the dashboard.</p><Link href="/" className="button primary">Back to dashboard</Link></main>}
