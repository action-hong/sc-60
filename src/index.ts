/* eslint-disable no-console */
import fs from 'fs'
import fg from 'fast-glob'
import pc from 'picocolors'
import type { FileMeta, Options } from './types'
import { clacTotalLineCount, getLineCount, joinPath, randomAddLine } from './utils'

const defaultOptions: Required<Options> = {
  name: 'sc',
  totalLine: 53 * 30,
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

const option = readConfig()

async function generateCopywright() {
  const paths = [option.include.map(p => joinPath(p)), option.exclude.map(p => `!${joinPath(p)}`)].flat()
  const files = await fg(paths)
  const res = files.map((file) => {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = getLineCount(content)

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
    const name = `${option.name}-${i}.txt`
    console.log('==> 当前还剩余的文件', res.length)
    for (let j = 0; j < max; j += delta) {
      const newRes = clacLines(res, option.totalLine, [], j)
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
    console.log(`==> 还少了${lines}就返回了`, clacTotalLineCount(temp))
    return temp
  }

  const left = clacTotalLineCount(res)
  if (left < lines) {
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
  const all = clacTotalLineCount(res)
  let pad = option.totalLine - all
  // 每一个文件轮流加上空行
  while (pad > 0) {
    for (let i = 0; i < res.length && pad > 0; i++) {
      res[i].padLines++
      pad--
    }
  }
  const content = res.map(item => randomAddLine(item.content, item.padLines)).join('\n')
  fs.writeFileSync(name, content)
}

function readConfig(): Required<Options> {
  const name = 'sc60.config.json'
  if (fs.existsSync(name)) {
    const config = JSON.parse(fs.readFileSync(name, 'utf-8'))
    return {
      ...defaultOptions,
      ...config,
    }
  }
  return defaultOptions
}

generateCopywright()
