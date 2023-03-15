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
  id: number | undefined,
  title: string,
  score: number,
  liked: boolean,
  label: string,
}

interface LyRecords<T> {
  [k: string]: Array<T>,
  games: Array<T>,
}
