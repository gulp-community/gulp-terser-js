const assert = require('assert')
const path = require('path')
const fs = require('fs')

const gulp = require('gulp')
const gulpif = require('gulp-if')
const concat = require('gulp-concat')
const terser = require('../')

const sourcemaps = require('gulp-sourcemaps')

const srcOptions = {
  cwd: path.resolve(__dirname),
  base: path.resolve(__dirname)
}

const outputFolder = path.resolve(__dirname, '.output')

deleteFolderRecursive(outputFolder)
fs.mkdirSync(outputFolder)

describe('gulp-terser-js(1)', function() {
  describe('default usage', function() {
    const get = (filepath) => fs.readFileSync(path.resolve(__dirname, filepath)).toString()

    describe('can run terser', function() {
      it('should run terser', function(done) {
        const stream = gulp.src('fixtures/to-be-one/*.js', srcOptions)
          .pipe(terser({
            mangle: {
              toplevel: true
            }
          })).on('error', function(err) {
            done(err)
          })
          .pipe(gulp.dest(outputFolder))

        stream.on('end', function() {
          done()
        })
      })


      it('should have the expected result', function() {
        const result = {
          a: get('.output/fixtures/to-be-one/a.js'),
          b: get('.output/fixtures/to-be-one/b.js')
        }

        const expect = {
          a: get('expect/to-be-one/a.js'),
          b: get('expect/to-be-one/b.js')
        }

        assert.strictEqual(result.a, expect.a, 'should be the same output with a.js')
        assert.strictEqual(result.b, expect.b, 'should be the same output with b.js')
      })


      it('should run terser with sourcemaps', function(done) {
        const sourceMapOpt = {
          sourceMappingURL: (file) => {
            const filepath = file.relative.replace(new RegExp('\\' + path.sep, 'g'), '/') // replace windows separator
            return 'http://127.0.0.1/' + filepath + '.map'
          }
        }

        const streamGenerator = (glob, content) => {
          const sourceMap = { sourceMap: {} }
          if (content) {
            sourceMap.sourceMap.content = true
          }

          return gulp.src(glob, srcOptions)
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(terser({
              mangle: {
                toplevel: true
              },
              ...sourceMap
            })).on('error', function(err) {
              done(err)
            })
            .pipe(sourcemaps.write('./', sourceMapOpt))
            .pipe(gulp.dest(outputFolder))
        }

        let stream = streamGenerator('fixtures/sourcemap-test/{a,b}.js', false)

        stream.on('end', function() {
          stream = streamGenerator('fixtures/sourcemap-test/c.js', true)

          stream.on('end', function() {
            done()
          })
        })
      })


      it('should have the expected result', function() {
        const EOL = (str) => str.replace(/\r/g, '')

        const result = {
          a: get('.output/fixtures/sourcemap-test/a.js'),
          b: get('.output/fixtures/sourcemap-test/b.js'),
          c: get('.output/fixtures/sourcemap-test/c.js'),
          amap: get('.output/fixtures/sourcemap-test/a.js.map').replace(/\\r\\n/g, '\\n'),
          bmap: get('.output/fixtures/sourcemap-test/b.js.map').replace(/\\r\\n/g, '\\n'),
          cmap: get('.output/fixtures/sourcemap-test/c.js.map').replace(/\\r\\n/g, '\\n')
        }

        const expect = {
          a: get('expect/sourcemap-test/a.js'),
          b: get('expect/sourcemap-test/b.js'),
          c: get('expect/sourcemap-test/c.js'),
          amap: get('expect/sourcemap-test/a.js.map'),
          bmap: get('expect/sourcemap-test/b.js.map'),
          cmap: get('expect/sourcemap-test/c.js.map')
        }

        assert.strictEqual(EOL(result.a), EOL(expect.a), 'should be the same output with a.js')
        assert.strictEqual(EOL(result.b), EOL(expect.b), 'should be the same output with b.js')
        assert.strictEqual(EOL(result.c), EOL(expect.c), 'should be the same output with c.js')
        assert.strictEqual(EOL(result.amap), EOL(expect.amap), 'should be the same output with a.js')
        assert.strictEqual(EOL(result.bmap), EOL(expect.bmap), 'should be the same output with b.js')
        assert.strictEqual(EOL(result.cmap), EOL(expect.cmap), 'should be the same output with c.js')
      })


      function catchError(src, concated, expectedJson, done) {
        const logfn = console.log
        const logstore = []

        let error = null

        console.log = function() {
          logstore.push([].join.call(arguments, ','))
        }

        const stream = gulp.src(src, srcOptions)
          .pipe(gulpif(concated, concat('script.js', { newLine: ';\r\n' })))
          .pipe(terser({
            mangle: {
              toplevel: true
            }
          })).on('error', function(err) {
            console.log = logfn
            error = err
            this.emit('end')
          })
          .pipe(gulp.dest(outputFolder))

        stream.on('end', function() {
          assert.strictEqual(error.message, 'Unexpected token: operator (&&)', 'is the expected error')
          const expect = JSON.parse(get(expectedJson))
          const last = logstore.length - 1
          logstore[last] = logstore[last].replace(__dirname, 'xxx').replace(/\\/g, '/')
          // if you want check the current log use :
          // console.log(JSON.stringify(logstore, 0, 4))
          // console.log(JSON.stringify(expect, 0, 4))
          assert.strictEqual(logstore.join('\n'), expect.join('\n'), 'is the expected error')
          done()
        })
      }


      it('should catch error', function(done) {
        catchError('fixtures/script-with-error.js', false, 'expect/script-with-error.json', done)
      })


      it('should catch error with array files list', function(done) {
        const src = [
          'fixtures/to-be-one/*.js',
          'fixtures/script-with-error.js'
        ]
        catchError(src, false, 'expect/script-with-error.json', done)
      })


      it('should catch error and not be able to get the origin position with no sourcemaps', function(done) {
        const src = [
          'fixtures/to-be-one/*.js',
          'fixtures/script-with-error.js'
        ]
        catchError(src, true, 'expect/script-contacted-with-error.json', done)
      })


      function catchErrorWithSrcMap(src, concated, expectedJson, done) {
        const logfn = console.log
        const logstore = []

        let error = null

        console.log = function() {
          logstore.push([].join.call(arguments, ','))
        }

        const stream = gulp.src(src, srcOptions)
          .pipe(sourcemaps.init())
          .pipe(gulpif(concated, concat('script.js', { newLine: ';\r\n' })))
          .pipe(terser({
            mangle: {
              toplevel: true
            }
          })).on('error', function(err) {
            console.log = logfn
            error = err
            this.emit('end')
          })
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest(outputFolder))

        stream.on('end', function() {
          assert.notStrictEqual(error, null, 'Error expected but error is null')
          assert.strictEqual(error.message, 'Unexpected token: operator (&&)', 'is the expected error')
          const expect = JSON.parse(get(expectedJson))
          const last = logstore.length - 1
          logstore[last] = logstore[last].replace(__dirname, 'xxx').replace(/\\/g, '/')
          // if you want check the current log use :
          // console.log(JSON.stringify(logstore, 0, 4))
          // console.log(JSON.stringify(expect, 0, 4))
          assert.strictEqual(logstore.join('\n'), expect.join('\n'), 'is the expected error')
          done()
        })
      }


      it('should catch error with sourcemaps', function(done) {
        catchErrorWithSrcMap('fixtures/script-srcmap-with-error-in-long-line.js', false, 'expect/script-srcmap-with-error-in-long-line.json', done)
      })


      it('should catch error with sourcemaps and should get the origin position', function(done) {
        const src = [
          'fixtures/to-be-one/*.js',
          'fixtures/script-with-error.js'
        ]

        catchErrorWithSrcMap(src, true, 'expect/script-contacted-srcmap-with-error.json', done)
      })


      it('test print error function', function() {
        let error
        console.error = (v) => { error = v }
        terser.printError("'----o----'")

        assert.strictEqual(error, "'----o----'")

        terser.printError({ fileContent: 'return;' })

        assert.strictEqual(error.toString(), '[object Object]')
      })
    })
  })
})


function deleteFolderRecursive(folderpath) {
  if (fs.existsSync(folderpath)) {
    fs.readdirSync(folderpath).forEach(function(file, index) {
      var curPath = folderpath + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(folderpath)
  }
}
