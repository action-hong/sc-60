# sc60

[![NPM version](https://img.shields.io/npm/v/sc60?color=a1b858&label=)](https://www.npmjs.com/package/sc60)

编写软著时，总是需要复制前30页和后30页的代码，没什么技术含量还得保证刚好结尾的时候是完整的（完全不明白他们的脑回路）因此写了该脚本自动将计算每个源码的文件行数，拼接处刚好符合要求的30页+30页

**发现好像其实办不太到，word上每一行能放多少个字符也不是固定的，只能说搞个大概吧, 没法很准确。**

## 安装

```bash
npm i sc60 -g
```

## 使用

在你的源码工作目录上执行以下命令

```bash
sc60
```
然后你就会得到两个`txt`文档，对应前30页和后30页的代码

```bash
Options:
  -c, --config <path>            指定配置文件路径，默认sc60.config.json
  -i, --include <include>        指定源码范围，默认为src/**/*,逗号分开
  -e, --exclude <exclude>        指定源码排除范围,逗号分开
  -n, --name <name>              指定生成的文件名，默认sc
  -t, --total-line <total-line>  指定生成的总行数，默认53*30=1590
```

## 配置

由于工作目录下有一些依赖或编译生成文件，这些不应该包含在内，因此可以自行配置：

|key|默认值|说明|
|--|--|--|
|name|`"sc"`|输出的文件名前缀|
|totalLine|`1590`|30页的word总共要多少行代码(这个需要用户自行计算)|
|include|`["src/**/*"]`|源代码的路径，是一个数组，`glob`匹配|
|exlucde|`['**/node_modules/**/*','dist/**/*','**/*.{png,jpg,jpeg,gif,webp,svg}','**/*.{woff,woff2,eot,ttf,otf}','**/*.{mp4,webm,ogg,mp3,wav,flac,aac,m4a}']`|不会计算在内的文件, 例如node_module的依赖，图片等等|

在工作目录创建一个文件`sc60.config.json`，填上相关的配置：

```json
{
  "name": "xx",
  "totalLine": 1590,
  "include": ["你的源码"],
  "exclude": ["不是源码", "的文件"]
}
```



## License

[MIT](./LICENSE) License © 2021 [kkopite](https://github.com/action-hong)
