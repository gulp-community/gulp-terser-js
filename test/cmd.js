const assert = require('assert')

const path = require('path')
const fs = require('fs')

const gulp = require('gulp')
const terser = require('../')

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
        const sourcemaps = require('gulp-sourcemaps')

        const sourceMapOpt = {
          sourceMappingURL: (file) => {
            const filepath = file.relative.replace(new RegExp('\\' + path.sep, 'g'), '/') // replace windows separator
            return 'http://127.0.0.1/' + filepath + '.map'
          }
        }

        const stream = gulp.src('fixtures/sm-test/*.js', srcOptions)
          .pipe(sourcemaps.init())
          .pipe(terser({
            mangle: {
              toplevel: true
            }
          })).on('error', function(err) {
            done(err)
          })
          .pipe(sourcemaps.write('./', sourceMapOpt))
          .pipe(gulp.dest(outputFolder))

        stream.on('end', function() {
          done()
        })
      })


      it('should have the expected result', function() {
        const result = {
          a: get('.output/fixtures/sm-test/a.js'),
          b: get('.output/fixtures/sm-test/b.js'),
          amap: get('.output/fixtures/sm-test/a.js.map'),
          bmap: get('.output/fixtures/sm-test/b.js.map')
        }

        const expect = {
          a: get('expect/sm-test/a.js'),
          b: get('expect/sm-test/b.js'),
          amap: get('expect/sm-test/a.js.map'),
          bmap: get('expect/sm-test/b.js.map')
        }

        assert.strictEqual(result.a, expect.a, 'should be the same output with a.js')
        assert.strictEqual(result.b, expect.b, 'should be the same output with b.js')
        assert.strictEqual(result.amap, expect.amap, 'should be the same output with a.js')
        assert.strictEqual(result.bmap, expect.bmap, 'should be the same output with b.js')
      })


      it('should catch error', function(done) {
        const logfn = console.log
        const logstore = []

        let error = null

        console.log = function() {
          logstore.push([].join.call(arguments, ','))
        }

        const stream = gulp.src('fixtures/script-with-error.js', srcOptions)
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
          const expect = JSON.parse(get('expect/script-with-error.json'))
          // if you want check the current log use :
          // console.log(JSON.stringify(logstore, 0, 4))
          // console.log(JSON.stringify(expect, 0, 4))
          assert.strictEqual(logstore.slice(0, -1).join(''), expect.join(''), 'is the expected error')
          done()
        })
      })

      it('test print error function', function() {
        let error
        console.error = (v) => { error = v }
        terser.printError("'----o----'")

        assert.strictEqual(error, "'----o----'")
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
