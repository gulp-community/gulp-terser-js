const fs = require('fs')
const path = require('path')

const sourceMap = require('source-map')
const through2 = require('through2')
const PluginError = require('plugin-error')
const applySourceMap = require('vinyl-sourcemaps-apply')

const terser = require('terser')

function gulpTerser(options) {
  // Mixes in default options.
  const opts = Object.assign({}, {}, options)

  return through2.obj(async function(file, enc, next) {
    const str = file.contents.toString()
    let build = {}

    if (file.sourceMap) {
      if (!('sourceMap' in opts)) {
        opts.sourceMap = {}
      }

      if (!('filename' in opts.sourceMap)) {
        opts.sourceMap.filename = file.sourceMap.file
      }

      if ('content' in opts.sourceMap && typeof opts.sourceMap.content === 'boolean' && opts.sourceMap.content === true) {
        opts.sourceMap.content = file.sourceMap
      }
    }

    if (file.sourceMap && file.sourceMap.file) {
      build[file.sourceMap.file] = str
    } else {
      build = str
    }
    const res = terser.minify(build, opts)

    if (res.error) {
      if (file.sourceMap) {
        const consumer = await new sourceMap.SourceMapConsumer(file.sourceMap)
        const original = consumer.originalPositionFor({
          source: file.path,
          line: res.error.line,
          column: res.error.col
        })

        if (original.line !== null) {
          const error = new Error(res.error.message, path.basename(original.source))

          error.name = res.error.name
          error.line = original.line
          error.col = original.column || res.error.col
          error.filePath = path.resolve(file.cwd, original.source)
          error.fileContent = fs.readFileSync(error.filePath).toString()

          return next(printError(new PluginError('gulp-terser-js', error)), file)
        }
      }
      res.error.filePath = file.path
      res.error.fileContent = (typeof build === 'string') ? build : build[res.error.filename]

      return next(printError(new PluginError('gulp-terser-js', res.error)), file)
    }

    file.contents = new Buffer.from(res.code) // eslint-disable-line new-cap

    if (file.sourceMap && res.map) {
      applySourceMap(file, res.map)
    }

    return next(null, file)
  })
}

function alignLine(num, text, longer, maxsize) {
  let maxlength = process.stdout.columns - 1
  const spaces = num + Array(longer - (num + '').length).join(' ')
  maxlength -= spaces.length + 3
  console.log('\x1B[36m' + spaces + ' |\x1B[00m ' + text.slice(0, (maxsize < maxlength) ? maxlength : maxsize))
}

function printError(error) {
  if (!error.fileContent || (error.line === undefined && error.col === undefined)) {
    return console.error(error.stack || error)
  }

  const fileContent = error.fileContent.replace(/\r/g, '')
  const lines = fileContent.replace(/\t/g, '    ').split('\n')
  const more = (error.line + ' ').length
  const col = error.col + 1
  const lastline = fileContent.split('\n')[error.line - 1]
  const pos = (more + 2) + lastline.replace(/[^\t]/g, '').length * 3 + parseInt(col)

  console.log(`\nError with ${error.plugin} :`)
  for (let i = error.line - 5; i < error.line; i++) {
    if (lines[i]) {
      alignLine(i + 1, lines[i], more, pos)
    }
  }

  console.log(Array(pos).join(' ') + '\x1B[91m^\x1B[00m')
  console.log('(' + error.name + ') ' + error.message + ' (line : \x1B[96m' + error.line + '\x1B[00m, col : \x1B[96m' + col + '\x1B[00m).')
  console.log(`in : ${error.filePath}\n`)

  return error
}

gulpTerser.printError = printError

module.exports = gulpTerser
