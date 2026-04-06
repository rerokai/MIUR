import { darkTheme } from './themes'
export const colors = { ...darkTheme }
export const applyTheme = (theme: typeof darkTheme) => {
  Object.assign(colors, theme)
}