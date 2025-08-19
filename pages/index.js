import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <header>
        <h1>Apartamenty — Demo</h1>
        <p className="badge">MVP • multi-tenant</p>
      </header>
      <div className="grid two">
        <div className="card">
          <h3>Co tu jest?</h3>
          <p>To starter aplikacji. Zawiera stronę główną, prosty dashboard i endpointy API.</p>
          <ul>
            <li><span className="kolor k-zielony"></span> Wolne dni</li>
            <li><span className="kolor k-czerwony"></span> Zajęte dni</li>
          </ul>
          <p>Przejdź do <Link href="/dashboard">Panelu</Link> i sprawdź, czy wszystko działa lokalnie.</p>
        </div>
        <div className="card">
          <h3>Sekrety środowiska</h3>
          <p>Utwórz plik <code>.env.local</code> i wklej klucze z Supabase:</p>
          <pre>{`NEXT_PUBLIC_SUPABASE_URL=...\nNEXT_PUBLIC_SUPABASE_ANON_KEY=...`}</pre>
          <p>Następnie <code>npm i</code> i <code>npm run dev</code>.</p>
        </div>
      </div>
    </div>
  );
}
