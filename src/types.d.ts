interface WindowSizes {
  [k: string]: number,
  width: number,
  height: number,
}

interface GridBreakpoints {
  [k: string]: number,
  xs: number,
  s: number,
  m: number,
  l: number,
  xl: number,
  xxl: number
}

interface CategoriesColors {
  [k: string]: string,
  gamesColor: string,
  tvshowsColor: string,
  filmsColor: string,
  booksColor: string,
}

interface LyRecord {
  [k: string]: any,
  id: string | number,
  category: string,
  title: string,
  score: number,
  liked: boolean,
  label: string,
  selected?: boolean,
}

interface LyRecords<T> {
  [k: string]: Array<T>,
  games: Array<T>,
  tvshows: Array<T>,
  films: Array<T>,
  anime: Array<T>,
  manga: Array<T>,
  books: Array<T>,
  music: Array<T>,
}

interface LyLabels<T> {
  [k: string]: Array<T>,
}

interface LyLabel {
  [k: string]: string | Component,
}

interface AddRecordOptions {
  record?: LyRecord,
  listType: string,
  saveLocal: boolean,
}

interface NotificationMessage {
  message: string,
  type: string,
}
