// AMP layout — intentionally minimal to support AMP document structure
// The actual <html amp>, <head>, and <body> are rendered in each AMP page component.
// This layout must NOT add any HTML wrapper — AMP pages render their own full document.
export default function AmpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
