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
  },
  Button: {
    borderRadiusSmall: '4px',
    borderRadiusMedium: '5px',
    borderRadiusLarge: '6px',
  },
  Input: {
    border: 'none',
    color: 'transparent',
  },
}

export const lightThemeOverrides = {
  ...globalOverrides,
  Categories: <CategoriesColors> {
    favouritesColor: '#3CBCBC',
    gamesColor: '#ff7b72',
    tvshowsColor: '#2080F0',
    filmsColor: '#F0A020',
    booksColor: '#18A058',
  },
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
  Categories: <CategoriesColors> {
    favouritesColor: '#008080',
    gamesColor: '#ff7b72',
    tvshowsColor: '#79c0ff',
    filmsColor: '#FFB87A',
    booksColor: '#5CB969',
  },
  Badge: {
    color: 'rgb(215, 69, 98)',
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
