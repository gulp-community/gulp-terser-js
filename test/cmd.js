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
          a: get('expect/to-be-one/a.txt'),
          b: get('expect/to-be-one/b.txt')
        }

        assert.strictEqual(result.a, expect.a, 'should be the same output with a.txt')
        assert.strictEqual(result.a, expect.a, 'should be the same output with b.txt')
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
