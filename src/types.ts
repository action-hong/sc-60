export interface Options {
  totalLine?: number
  include?: string[]
  exclude?: string[]
  name?: string
}

export interface FileMeta {
  lines: number
  content: string
  file: string
  // 还需要补上几个换行
  padLines: number
}
