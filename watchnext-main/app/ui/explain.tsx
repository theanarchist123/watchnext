export function Explain({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="explain">
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  );
}

export function ModuleChip({ children }: { children: React.ReactNode }) {
  return <span className="module-chip">{children}</span>;
}
