export default function ErrorPage({ statusCode }) {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Błąd {statusCode || "?"}</h1>
      <p>Coś poszło nie tak.</p>
      <a href="/" style={{ color: "blue" }}>← Powrót na stronę główną</a>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
