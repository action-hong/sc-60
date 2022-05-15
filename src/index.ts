/* eslint-disable no-console */
import fs from 'fs'
import fg from 'fast-glob'
import pc from 'picocolors'
import { program } from 'commander'
import { version } from '../package.json'
import type { FileMeta, Options } from './types'
import { clacTotalLineCount, getLineCount, joinPath, randomAddLine } from './utils'

type RequiredOptions = Required<Options>

const defaultOptions: RequiredOptions = {
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

export default function cli() {
  program
    .option('-c, --config <path>', '指定配置文件路径，默认sc60.config.json')
    .option('-i, --include <include>', '指定源码范围，默认为src/**/*,逗号分开')
    .option('-e, --exclude <exclude>', '指定源码排除范围,逗号分开')
    .option('-n, --name <name>', '指定生成的文件名，默认sc')
    .option('-t, --total-line <total-line>', '指定生成的总行数，默认53*30=1590')
    .version(version)

  program.parse(process.argv)

  const options = program.opts()

  let _option = {
    ...defaultOptions,
  }

  options.config ??= 'sc60.config.json'
  if (fs.existsSync(options.config)) {
    const config = JSON.parse(fs.readFileSync(options.config, 'utf-8')) as Options
    _option = {
      ..._option,
      ...config,
    }
  }
  else {
    console.log(pc.yellow(`配置文件${options.config}不存在`))
  }
  if (options.include)
    _option.include = options.include.split(',')

  if (options.exclude)
    _option.exclude = options.exclude.split(',')

  if (options.name)
    _option.name = options.name

  if (options.totalLine)
    _option.totalLine = options.totalLine

  generateCopywright(_option)
}

export async function generateCopywright(_option?: Options) {
  const option = {
    ...defaultOptions,
    ...(_option || {}),
  }
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
  calcTo30(res, option)
}

// 根据输入的每个文件的行数，计算出刚好是53行的文件
function calcTo30(res: FileMeta[], option: RequiredOptions) {
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
        writeToFile(newRes, name, option)
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

function writeToFile(res: FileMeta[], name: string, option: RequiredOptions) {
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
