export const darkTheme = {
  bg: {
    primary: '#0D0D0F',
    card: '#151518',
    elevated: '#1A1A1E',
    inner: '#1E1E22',
  },
  accent: '#00F6FF',
  semantic: {
    threat: '#FF4D4D',
    warning: '#F5A623',
    stable: '#34C78A',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    muted: '#888888',
    hint: '#555555',
    ghost: '#333333',
  },
  border: '#1E1E22',
}

export const lightTheme = {
  bg: {
    primary: '#F2F2F7',
    card: '#FFFFFF',
    elevated: '#E5E5EA',
    inner: '#D1D1D6',
  },
  accent: '#007AFF',
  semantic: {
    threat: '#FF3B30',
    warning: '#FF9500',
    stable: '#34C759',
  },
  text: {
    primary: '#000000',
    secondary: '#3C3C43',
    muted: '#6C6C70',
    hint: '#8E8E93',
    ghost: '#C7C7CC',
  },
  border: '#E5E5EA',
}

export type Theme = typeof darkTheme