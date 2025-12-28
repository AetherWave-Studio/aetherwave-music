export const COLORS = {
    primary: '#00FFAA',
    accent: '#4FACFE',
    background: '#0A0A0F',
    surface: '#1F1F2E',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0B0',
    error: '#FF6464',
    warning: '#FFC800',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const TYPOGRAPHY = {
    h1: {
        fontSize: 48,
        fontWeight: '900' as const,
        letterSpacing: -2,
    },
    h2: {
        fontSize: 32,
        fontWeight: '700' as const,
        letterSpacing: -1,
    },
    h3: {
        fontSize: 24,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
    },
};
