export const dynamic = 'force-dynamic';

export default function ExpensesPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Accounting & Finance / Expenses Payment Entry</div>
          <h1 style={{ margin: '8px 0 0 0' }}>Expenses Payment Entry</h1>
        </div>
      </div>

      <div className="panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h2>Coming Soon</h2>
        <p>The Expenses Entry module is currently under development.</p>
      </div>
    </div>
  );
}
