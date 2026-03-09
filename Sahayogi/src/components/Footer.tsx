import { Link } from 'react-router-dom';

// ─── Trust signal data ────────────────────────────────────────────────
const TRUST_SIGNALS = [
    { icon: '✓', label: 'Verified Community' },
    { icon: '🔒', label: 'Secure Platform' },
    { icon: '⚡', label: 'Real-time Updates' },
    { icon: '❤️', label: 'Community First' },
];

// ─── Navigation links ─────────────────────────────────────────────────
const NAV_LINKS = [
    { label: 'Home', to: '/' },
    { label: 'Feed', to: '/feed' },
    { label: 'Community Needs', to: '/community-needs' },
    { label: 'About Us', to: '/about' },
];

// ─── CTA buttons ───────────────────────────────────────────────────────
const CTA_BUTTONS = [
    { label: 'About Us', to: '/about' },
    { label: 'Create a Post', to: '/create-post' },
    { label: 'Community Needs', to: '/community-needs' },
];

// ─── Component ────────────────────────────────────────────────────────
const Footer = () => {
    return (
        <footer
            style={{
                background: 'linear-gradient(to bottom, hsl(30 12% 96%), hsl(34 25% 94%))',
                borderTop: '1px solid hsl(30 12% 87% / 0.55)',
                paddingTop: '64px',
                paddingBottom: '0',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* ── Subtle mandala accent (top-right, barely visible) ──────── */}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    top: '-60px',
                    right: '-80px',
                    width: '320px',
                    height: '320px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, hsl(355 68% 40% / 0.04) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            <div className="container mx-auto px-4 max-w-5xl">

                {/* ── Main 3-zone grid ──────────────────────────────────────── */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        gap: '2.5rem',
                        alignItems: 'start',
                    }}
                    className="footer-grid"
                >

                    {/* ── LEFT: Brand ─────────────────────────────────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link
                            to="/"
                            className="footer-logo-link"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                textDecoration: 'none',
                                transition: 'transform 150ms ease',
                                width: 'fit-content',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <div
                                style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '10px',
                                    background: 'hsl(355 68% 40%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    boxShadow: '0 2px 10px hsl(355 68% 40% / 0.25)',
                                    flexShrink: 0,
                                }}
                            >
                                S
                            </div>
                            <span
                                style={{
                                    fontWeight: 600,
                                    fontSize: '15px',
                                    letterSpacing: '-0.01em',
                                    color: 'hsl(20 25% 10%)',
                                }}
                            >
                                Sahayogi<span style={{ color: 'hsl(355 68% 40%)' }}>.</span>
                            </span>
                        </Link>

                        <p
                            style={{
                                fontSize: '13px',
                                color: 'hsl(20 12% 48% / 0.72)',
                                maxWidth: '260px',
                                lineHeight: '1.65',
                                margin: 0,
                            }}
                        >
                            Giving with heart. Helping communities across Nepal.
                        </p>
                    </div>

                    {/* ── CENTER: Navigation + CTA ─────────────────────────────── */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px',
                        }}
                    >
                        {/* Nav links */}
                        <nav
                            aria-label="Footer navigation"
                            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 20px' }}
                        >
                            {NAV_LINKS.map(({ label, to }) => (
                                <Link
                                    key={label}
                                    to={to}
                                    style={{
                                        fontSize: '14px',
                                        color: 'hsl(20 12% 48% / 0.7)',
                                        textDecoration: 'none',
                                        position: 'relative',
                                        transition: 'color 180ms ease, opacity 180ms ease',
                                        paddingBottom: '2px',
                                    }}
                                    className="footer-nav-link"
                                    onMouseEnter={e => {
                                        e.currentTarget.style.color = 'hsl(355 68% 40%)';
                                        const line = e.currentTarget.querySelector('.footer-underline') as HTMLElement;
                                        if (line) line.style.width = '100%';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.color = 'hsl(20 12% 48% / 0.7)';
                                        const line = e.currentTarget.querySelector('.footer-underline') as HTMLElement;
                                        if (line) line.style.width = '0%';
                                    }}
                                >
                                    {label}
                                    <span
                                        className="footer-underline"
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            height: '1px',
                                            width: '0%',
                                            background: 'hsl(355 68% 40%)',
                                            transition: 'width 180ms ease',
                                            borderRadius: '9999px',
                                        }}
                                    />
                                </Link>
                            ))}
                        </nav>

                        {/* CTA ghost buttons */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                            {CTA_BUTTONS.map(({ label, to }) => (
                                <Link
                                    key={label}
                                    to={to}
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: 'hsl(20 12% 48%)',
                                        border: '1px solid hsl(30 12% 87%)',
                                        borderRadius: '9999px',
                                        padding: '5px 14px',
                                        textDecoration: 'none',
                                        transition: 'background 160ms ease, border-color 160ms ease, color 160ms ease',
                                        background: 'transparent',
                                        letterSpacing: '0.01em',
                                        whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => {
                                        const el = e.currentTarget;
                                        el.style.background = 'hsl(355 68% 40% / 0.06)';
                                        el.style.borderColor = 'hsl(355 68% 40% / 0.28)';
                                        el.style.color = 'hsl(355 68% 40%)';
                                    }}
                                    onMouseLeave={e => {
                                        const el = e.currentTarget;
                                        el.style.background = 'transparent';
                                        el.style.borderColor = 'hsl(30 12% 87%)';
                                        el.style.color = 'hsl(20 12% 48%)';
                                    }}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: Location / Meta ───────────────────────────────── */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '6px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img
                                src="https://flagcdn.com/w40/np.png"
                                alt="Nepal"
                                style={{ height: '13px', borderRadius: '2px', opacity: 0.85 }}
                            />
                            <span style={{ fontSize: '13px', color: 'hsl(20 12% 48%)', fontWeight: 500 }}>
                                📍 Kathmandu, Nepal
                            </span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: 'hsl(20 12% 48% / 0.55)', margin: 0, textAlign: 'right' }}>
                            Built for local communities
                        </p>
                    </div>

                </div>{/* /main grid */}

                {/* ── Trust Signals Row ─────────────────────────────────────────── */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '6px 28px',
                        marginTop: '40px',
                        paddingTop: '28px',
                        borderTop: '1px solid hsl(30 12% 87% / 0.45)',
                    }}
                >
                    {TRUST_SIGNALS.map(({ icon, label }) => (
                        <div
                            key={label}
                            className="trust-signal"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '11.5px',
                                color: 'hsl(20 12% 48% / 0.62)',
                                cursor: 'default',
                                transition: 'color 160ms ease',
                                userSelect: 'none',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'hsl(355 68% 40%)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'hsl(20 12% 48% / 0.62)')}
                        >
                            <span style={{ fontSize: '13px', lineHeight: 1 }}>{icon}</span>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>

                {/* ── Bottom bar ───────────────────────────────────────────────── */}
                <div
                    style={{
                        marginTop: '28px',
                        padding: '14px 0 18px',
                        borderTop: '1px solid hsl(30 12% 87% / 0.3)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <p style={{ fontSize: '11px', color: 'hsl(20 12% 48% / 0.5)', margin: 0 }}>
                        © 2024 Sahayogi Nepal
                    </p>
                    <p
                        style={{
                            fontSize: '11px',
                            fontStyle: 'italic',
                            color: 'hsl(20 12% 48% / 0.45)',
                            margin: 0,
                            letterSpacing: '0.01em',
                        }}
                    >
                        बनाइएको माया साथ, नेपालको लागि
                    </p>
                </div>

            </div>{/* /container */}

            {/* ── Responsive styles via <style> ────────────────────────────── */}
            <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .footer-grid > div:first-child {
            align-items: center;
          }
          .footer-grid > div:first-child p {
            text-align: center;
          }
          .footer-grid > div:last-child {
            align-items: center !important;
          }
          .footer-grid > div:last-child p {
            text-align: center !important;
          }
        }
      `}</style>
        </footer>
    );
};

export default Footer;
