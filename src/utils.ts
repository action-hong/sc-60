import type { FileMeta } from './types'

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomAddLine(content: string, lines: number) {
  const arr = content.split('\n')
  for (let i = 0; i < lines; i++)
    arr.splice(random(0, arr.length - 1), 0, '\n')
  return arr.join('')
}

export function getLineCount(content: string) {
  const lines = content.split('\n')
  const len = lines.length
  return lines[len - 1] === '' ? len - 1 : len
}

export function clacTotalLineCount(res: FileMeta[]) {
  return res.reduce((total, file) => total + file.lines, 0)
}

export function joinPath(path: string) {
  return path.startsWith('/') ? `.${path}` : `./${path}`
}
