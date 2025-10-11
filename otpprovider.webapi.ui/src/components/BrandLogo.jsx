export default function BrandLogo({ size = 42, withText = true }) {
    const styleWrap = {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        color: '#111'
    };
    const styleMark = {
        width: size,
        height: size,
        borderRadius: 14,
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.42,
        color: '#fff',
        letterSpacing: 0.5,
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
        userSelect: 'none'
    };
    const styleText = {
        fontSize: size * 0.52,
        fontWeight: 700,
        letterSpacing: 0.5,
        fontFamily: 'system-ui, Arial, sans-serif'
    };
    return (
        <div style={styleWrap} aria-label="otpfy logo">
            {/* If you provide an actual image, replace this gradient block with an <img src="/assets/otpfy-logo.svg" ... /> */}
            <div style={styleMark}>O</div>
            {withText && <span style={styleText}>otpfy</span>}
        </div>
    );
}