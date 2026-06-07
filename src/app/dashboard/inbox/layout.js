// Layout para inbox: ocupa toda la altura disponible sin scroll externo
export default function InboxLayout({ children }) {
  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {children}
    </div>
  );
}
