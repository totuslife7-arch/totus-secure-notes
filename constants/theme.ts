export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppTheme {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  inputBackground: string;
  inputText: string;
  placeholder: string;
  primary: string;
  primaryText: string;
  danger: string;
  success: string;
  successSurface: string;
  flag: string;
}

export const lightTheme: AppTheme = {
  background: '#f5f7fb',
  surface: '#ffffff',
  surfaceSecondary: '#e5e7eb',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  inputBackground: '#ffffff',
  inputText: '#111827',
  placeholder: '#9ca3af',
  primary: '#2563eb',
  primaryText: '#ffffff',
  danger: '#b91c1c',
  success: '#047857',
  successSurface: '#ecfdf5',
  flag: '#d97706',
};

export const darkTheme: AppTheme = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceSecondary: '#334155',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  border: '#334155',
  inputBackground: '#1e293b',
  inputText: '#f1f5f9',
  placeholder: '#64748b',
  primary: '#3b82f6',
  primaryText: '#ffffff',
  danger: '#f87171',
  success: '#34d399',
  successSurface: '#064e3b',
  flag: '#fbbf24',
};
