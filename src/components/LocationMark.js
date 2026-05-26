export default function LocationMark({ type = 'jumog', size = 48 }) {
  const isMadirda = type === 'madirda'

  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: isMadirda
          ? 'linear-gradient(135deg, #1d4ed8, #60a5fa)'
          : 'linear-gradient(135deg, #0284c7, #38bdf8)',
        display: 'grid',
        placeItems: 'center',
        color: 'white',
        boxShadow: '0 10px 24px rgba(2, 132, 199, 0.18)',
        flex: '0 0 auto',
      }}
    >
      {isMadirda ? <LakeIcon /> : <WaterfallIcon />}
    </div>
  )
}

function WaterfallIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M6 7.8C7.3 5.4 9.7 4 12.6 4h8.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11 8h9.6c1.6 0 2.7 1.3 2.4 2.8l-1.5 7.1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d="M13.1 8.4v11.1M17.1 8.4v9.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.96" />
      <path d="M6 21.2c1.5-1.1 3-1.1 4.5 0 1.5 1 3 1 4.5 0 1.5-1.1 3-1.1 4.5 0 1.1.8 2.2 1 3.4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

function LakeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M5 15.4c1.6-1.1 3.2-1.1 4.8 0 1.6 1 3.2 1 4.8 0 1.6-1.1 3.2-1.1 4.8 0 1.2.8 2.4 1 3.6.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M5 20.4c1.6-1.1 3.2-1.1 4.8 0 1.6 1 3.2 1 4.8 0 1.6-1.1 3.2-1.1 4.8 0 1.2.8 2.4 1 3.6.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" opacity="0.85" />
      <path d="M7.4 12.5 11.8 7l3.1 4 2-2.5 4 4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
    </svg>
  )
}
