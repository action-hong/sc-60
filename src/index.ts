import fs from 'fs'
import fg from 'fast-glob'
import pc from 'picocolors'
export interface Options {
  pageLine: number
  include?: string[]
  exclude?: string[]
  name: string
}

export interface FileMeta {
  lines: number
  content: string
  file: string
  // 还需要补上几个换行
  padLines: number
}

const defaultOptions: Required<Options> = {
  name: 'sc',
  pageLine: 53 * 30,
  include: [
    'src/**/*',
  ],
  exclude: [
    '**/node_modules/**/*',
    'dist/**/*',
    // iamge
    '**/*.{png,jpg,jpeg,gif,webp,svg}',
    // font
    '**/*.{woff,woff2,eot,ttf,otf}',
    // video
    '**/*.{mp4,webm,ogg,mp3,wav,flac,aac,m4a}',
  ],
}

const bash = 'd:/old-jornco-data/jornco-car-2/'

const paths = [defaultOptions.include.map(p => bash + p), defaultOptions.exclude.map(p => `!${bash}${p}`)].flat()

async function generateCopywright() {
  const files = await fg(paths)
  const res = files.map((file) => {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = getLineCount(content)
    if (file.includes('HelloWorld.vue')) {
      console.log(content)
    }
    return {
      lines,
      content,
      file,
      padLines: 0,
    }
  }).filter(item => item.content.length > 0)
  // 开始计算零钱问题
  calcTo30(res)
}

// 根据输入的每个文件的行数，计算出刚好是53行的文件
function calcTo30(res: FileMeta[]) {
  // 最多只能补150行，不然太那啥了
  const max = 150
  const delta = 10
  // 输出两个文件
  const num = 2

  for (let i = 0; i < num; i++) {
    const name = `${defaultOptions.name}-${i}.txt`
    console.log('==> 当前还剩余的文件', res.length)
    for (let j = 0; j < max; j += delta) {
      const newRes = clacLines(res, defaultOptions.pageLine, [], j)
      if (newRes) {
        writeToFile(newRes, name)
        console.log(pc.green(`文件${name}在限度${j}行内生成成功`))
        // 过滤掉用过的文件
        res = res.filter(file => !newRes.find(item => item.file === file.file))
        break
      }
      else if (j === max - delta) {
        console.log(pc.red(`文件${name}在限度${j}行内生成失败，请尝试更大的限度或者增加源码范围！`))
      }
      console.log(pc.yellow(`文件${name}在限度${j}行内生成失败`))
    }
  }
}

function clacLines(res: FileMeta[], lines: number, temp: FileMeta[], start: number, min = 0): FileMeta[] | null {
  if (lines < 0)
    return null

  // 差个1590以内，每个文件里面中间赛点换行
  if (lines <= min) {
    console.log(`==> 还少了${lines}就返回了`, clacLinesCount(temp))
    return temp
  }

  const left = clacLinesCount(res)
  if (left < lines) {
    // eslint-disable-next-line no-console
    console.log(pc.red(`实在无能为力了，剩余的代码加起来也不够，还差${lines - left}`))
    return null
  }

  for (let i = start; i < res.length; i++) {
    const file = res[i]
    const newLines = lines - file.lines
    const newTemp = [...temp, file]
    const newRes = clacLines(res, newLines, newTemp, i + 1, min)
    if (newRes)
      return newRes
  }
  return null
}

function writeToFile(res: FileMeta[], name: string) {
  const all = clacLinesCount(res)
  let pad = defaultOptions.pageLine - all
  // 每一个文件轮流加上空行
  while (pad > 0) {
    for (let i = 0; i < res.length && pad > 0; i++) {
      res[i].padLines++
      pad--
    }
  }
  const content = res.map(transformContent).join('\n')
  fs.writeFileSync(name, content)
  fs.writeFileSync(`${name}.json`, JSON.stringify({
    all,
    res,
    // : res.map(item => ({
    //   file: item.file,
    //   lines: item.lines,
    // })),
  }, null, 2))
}

function clacLinesCount(res: FileMeta[]) {
  return res.map(file => file.lines).reduce((a, b) => a + b, 0)
}

// 任意加上多个空行
function transformContent(file: FileMeta) {
  const arr = file.content.split('\n')
  for (let i = 0; i < file.padLines; i++)
    arr.splice(random(0, arr.length - 1), 0, '\n')
  return arr.join('')
}

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getLineCount(content: string) {
  const lines = content.split('\n')
  const len = lines.length
  return lines[len - 1] === '' ? len - 1 : len
}

generateCopywright()
