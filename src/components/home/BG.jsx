export const BG = () => (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "linear-gradient(160deg,#e8f5e0 0%,#d4edda 45%,#c3e6cb 100%)" }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0 }}>
            <defs>
                <pattern id="fp" x="0" y="0" width="145" height="145" patternUnits="userSpaceOnUse">
                    <g transform="translate(8,8)" opacity="0.14" stroke="#1a6a1a" fill="none" strokeWidth="1.7">
                        <ellipse cx="22" cy="32" rx="22" ry="6"/><rect x="2" y="14" width="40" height="16" rx="3"/><ellipse cx="22" cy="12" rx="22" ry="7"/>
                    </g>
                    <g transform="translate(85,5)" opacity="0.12" stroke="#1a6a1a" fill="none" strokeWidth="1.7">
                        <rect x="4" y="16" width="28" height="22" rx="3"/><line x1="11" y1="16" x2="8" y2="2"/><line x1="18" y1="16" x2="18" y2="0"/><line x1="25" y1="16" x2="28" y2="2"/>
                    </g>
                    <g transform="translate(0,80)" opacity="0.12" stroke="#1a6a1a" fill="none" strokeWidth="1.7">
                        <polygon points="5,5 32,5 27,40 10,40"/><path d="M14 5 Q18 0 23 5"/>
                    </g>
                    <g transform="translate(82,80)" opacity="0.12" stroke="#1a6a1a" fill="none" strokeWidth="1.7">
                        <circle cx="22" cy="22" r="18"/><circle cx="22" cy="22" r="8"/>
                    </g>
                    <g transform="translate(42,42)" opacity="0.12" stroke="#1a6a1a" fill="none" strokeWidth="1.7">
                        <path d="M14 24 L6 48 L22 48 Z"/><circle cx="14" cy="16" r="10"/>
                    </g>
                    <g transform="translate(108,42)" opacity="0.10" stroke="#1a6a1a" fill="none" strokeWidth="1.7">
                        <path d="M16 2 L2 30 L30 30 Z"/>
                        <circle cx="10" cy="22" r="2.5" fill="#1a6a1a" stroke="none"/>
                        <circle cx="20" cy="20" r="2.5" fill="#1a6a1a" stroke="none"/>
                    </g>
                    <g transform="translate(38,100)" opacity="0.10" stroke="#1a6a1a" fill="none" strokeWidth="1.7">
                        <line x1="8" y1="2" x2="8" y2="32"/><line x1="4" y1="2" x2="4" y2="12"/><line x1="8" y1="2" x2="8" y2="12"/><line x1="12" y1="2" x2="12" y2="12"/>
                    </g>
                    <g transform="translate(110,105)" opacity="0.10" stroke="#1a6a1a" fill="none" strokeWidth="1.7">
                        <rect x="2" y="8" width="24" height="20" rx="4"/><path d="M8 8 Q14 0 20 8"/>
                    </g>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#fp)"/>
        </svg>
    </div>
);