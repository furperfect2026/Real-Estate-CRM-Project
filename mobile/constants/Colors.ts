export const THEME = {
  bg: '#f8fafc', // crisp off-white slate-50
  card: '#ffffff', // pure white card
  cardSub: '#f1f5f9', // slate-100
  border: '#e2e8f0', // slate-200 subtle border
  borderDark: '#cbd5e1', // slate-300
  text: '#0f172a', // deep navy slate-900
  textSecondary: '#475569', // slate-600
  textMuted: '#94a3b8', // slate-400
  primary: '#2563eb', // royal corporate blue
  primaryHover: '#1d4ed8',
  primaryBg: '#eff6ff', // blue-50
  success: '#10b981', // emerald
  successBg: '#ecfdf5',
  warning: '#f59e0b', // amber
  warningBg: '#fffbeb',
  danger: '#ef4444', // rose red
  dangerBg: '#fef2f2',
  purple: '#8b5cf6', // purple
  purpleBg: '#f5f3ff',
};

export default {
  light: {
    text: THEME.text,
    background: THEME.bg,
    tint: THEME.primary,
    tabIconDefault: THEME.textMuted,
    tabIconSelected: THEME.primary,
  },
  dark: {
    text: THEME.text,
    background: THEME.bg,
    tint: THEME.primary,
    tabIconDefault: THEME.textMuted,
    tabIconSelected: THEME.primary,
  },
};
