/// https://www.naiveui.com/en-US/dark/docs/customize-theme
/// https://www.naiveui.com/en-US/dark/components/config-provider

const globalOverrides = {
  common: {
    fontFamily: 'Onest',
    fontSize: '16px',
    fontSizeMini: '12px',
    fontSizeTiny: '11px',
    fontSizeSmall: '14px',
    fontSizeMedium: '16px',
    fontSizeLarge: '18px',
    fontSizeHuge: '20px',
  },
  Typography: {
    headerFontSize1: '3rem',
    headerFontSize2: '2.5rem',
    headerFontSize3: '1.75rem',
    headerFontSize4: '1.25rem',
    headerFontSize5: '1rem',
    headerFontSize6: '0.875rem',
    pFontSize: '16px',
  },
  Menu: {
    borderRadius: '6px',
  }
}

export const lightThemeOverrides = {
  ...globalOverrides,
  Layout: {
    headerColor: 'rgb(250, 250, 252)',
    siderColor: 'rgb(250, 250, 252)',
  },
  Badge: {
    color: 'rgb(255, 89, 122)',
  },
}

export const darkThemeOverrides = {
  ...globalOverrides,
  Badge: {
    color: 'rgb(54, 54, 61)',
  },
}

export const breakpoints = {
  xs: 0,
  s: 640,
  m: 1024,
  l: 1280,
  xl: 1536,
  xxl: 1920
}
