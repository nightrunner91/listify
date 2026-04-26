/// https://www.naiveui.com/en-US/dark/docs/customize-theme
/// https://www.naiveui.com/en-US/dark/components/config-provider

const globalOverrides = {
  common: {
    fontFamily: 'Onest',
    fontSize: '16px',
    fontSizeMini: '11px',
    fontSizeTiny: '12px',
    fontSizeSmall: '14px',
    fontSizeMedium: '16px',
    fontSizeLarge: '18px',
    fontSizeHuge: '20px',
    fontWeightStrong: 500,
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
  Alert: {
    padding: '10px 14px',
    borderRadius: '6px',
  },
  Card: {
    borderRadius: '6px',
  },
  Upload: {
    borderRadius: '6px',
  },
  Menu: {
    borderRadius: '6px',
  },
  List: {
    borderRadius: '6px',
  },
  Button: {
    borderRadiusSmall: '4px',
    borderRadiusMedium: '5px',
    borderRadiusLarge: '6px',
  },
  Input: {
    borderRadius: '6px',
    lineHeight: 1,
  },
  Drawer: {
    boxShadow: 'none',
  },
  Popconfirm: {
    fontSize: '14px',
    iconSize: '18px',
  },
  Rate: {
    sizeSmall: '14px',
    sizeMedium: '16px',
    sizeLarge: '18px',
  }
}

export const lightThemeOverrides = {
  ...globalOverrides,
  Categories: {
    startColor: '#0AC0C0',
    gamesColor: '#DB574E',
    tvshowsColor: '#20B5F0',
    filmsColor: '#F0A020',
    animeColor: '#E6649E',
    mangaColor: '#9574F7',
    booksColor: '#13E344',
    musicColor: '#A8B82C',
    customColor: '#A1A8B2',
    aboutColor: '#0AC0C0',
  },
  Layout: {
    headerColor: 'rgb(250, 250, 252)',
    siderColor: 'rgb(250, 250, 252)',
    siderColorInverted: 'rgb(252, 252, 254)',
    siderBorderColorInverted: 'rgb(239, 239, 245)',
  },
  Badge: {
    color: 'rgb(255, 89, 122)',
  },
  Drawer: {
    headerBorderBottom: 'rgb(239, 239, 245)',
  },
}

export const darkThemeOverrides = {
  ...globalOverrides,
  Categories: {
    startColor: '#0AC0C0',
    gamesColor: '#FF7B72',
    tvshowsColor: '#79E2FF',
    filmsColor: '#FFB672',
    animeColor: '#D87D7D',
    mangaColor: '#9A79FF',
    booksColor: '#5CB969',
    musicColor: '#CDD87D',
    customColor: '#A1A8B2',
    aboutColor: '#0AC0C0',
  },
  Layout: {
    siderColorInverted: 'rgb(28, 28, 32)',
  },
  Badge: {
    color: 'rgb(215, 69, 98)',
  },
  Drawer: {
    headerBorderBottom: 'rgba(255, 255, 255, 0.09)',
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
