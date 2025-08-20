export default function Home() {
  return (
    <div className="container">
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "60px 20px" }}>
        <h1 style={{ fontSize: "42px", fontWeight: "bold", marginBottom: 20 }}>
          Apartamenty Online
        </h1>
        <p style={{ fontSize: "20px", color: "#555", marginBottom: 30 }}>
          Zarządzaj rezerwacjami i kalendarzem online w prosty sposób.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <a href="/auth/register" className="btn acc">Załóż konto</a>
          <a href="/auth/login" className="btn">Zaloguj się</a>
          <a href="/dashboard" className="btn">Zobacz demo</a>
        </div>
      </section>

      {/* Cennik */}
      <section style={{ padding: "40px 20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Cennik</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <h3>Darmowy test</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>0 zł / 30 dni</p>
            <ul style={{ textAlign: "left", marginTop: 10 }}>
              <li>Pełny dostęp do kalendarza</li>
              <li>Dodawanie apartamentów i pokoi</li>
              <li>Eksport rezerwacji do CSV</li>
            </ul>
            <a href="/auth/register" className="btn acc" style={{ marginTop: 20 }}>
              Rozpocznij za darmo
            </a>
          </div>

          <div className="card" style={{ textAlign: "center" }}>
            <h3>Abonament</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>49 zł / miesiąc</p>
            <ul style={{ textAlign: "left", marginTop: 10 }}>
              <li>Bez limitu apartamentów</li>
              <li>Statystyki i raporty finansowe</li>
              <li>Udostępnianie dostępu innym</li>
              <li>Pełna historia rezerwacji</li>
            </ul>
            <a href="/auth/register" className="btn acc" style={{ marginTop: 20 }}>
              Kup abonament
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "40px 20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Najczęściej zadawane pytania</h2>
        <div className="card" style={{ marginBottom: 15 }}>
          <h4>Czy mogę przetestować system za darmo?</h4>
          <p>Tak, masz pełny dostęp przez 30 dni bez żadnych opłat.</p>
        </div>
        <div className="card" style={{ marginBottom: 15 }}>
          <h4>Czy muszę podawać dane karty przy rejestracji?</h4>
          <p>Nie, płatności dokonujesz dopiero po zakończeniu okresu próbnego.</p>
        </div>
        <div className="card">
          <h4>Czy mogę zrezygnować w dowolnym momencie?</h4>
          <p>Tak, możesz zakończyć subskrypcję w dowolnym momencie, bez dodatkowych opłat.</p>
        </div>
      </section>
      {/* Footer */}
      <footer style={{ background: "#111827", color: "white", padding: "30px 20px", marginTop: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 900, margin: "0 auto" }}>
          <div>
            <h3 style={{ marginBottom: 10 }}>Apartamenty Online</h3>
            <p style={{ color: "#d1d5db" }}>
              Prosty system do zarządzania rezerwacjami.  
              Sprawdzony przez właścicieli apartamentów i pokoi gościnnych.
            </p>
          </div>
          <div>
            <h3 style={{ marginBottom: 10 }}>Kontakt</h3>
            <p style={{ color: "#d1d5db" }}>📧 kontakt@apartamenty-online.pl</p>
            <p style={{ color: "#d1d5db" }}>📞 +48 600 000 000</p>
          </div>
        </div>
        <hr style={{ borderColor: "#374151", margin: "20px 0" }} />
        <div style={{ textAlign: "center", color: "#9ca3af" }}>
          © {new Date().getFullYear()} Apartamenty Online · 
          <a href="/polityka" style={{ color: "#60a5fa", marginLeft: 8 }}>Polityka prywatności</a> · 
          <a href="/regulamin" style={{ color: "#60a5fa", marginLeft: 8 }}>Regulamin</a>
        </div>
      </footer>


    </div>
  );
}
