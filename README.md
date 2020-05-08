# gulp-terser-js

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Linux Build][travis-image]][travis-url]
  [![Test Coverage][coveralls-image]][coveralls-url]

A [Terser-js](https://github.com/terser/terser) plugin for Gulp

[npm-image]: https://img.shields.io/npm/v/gulp-terser-js.svg
[npm-url]: https://npmjs.org/package/gulp-terser-js
[downloads-image]: https://img.shields.io/npm/dm/gulp-terser-js.svg
[downloads-url]: https://npmjs.org/package/gulp-terser-js
[travis-image]: https://img.shields.io/travis/com/gulp-community/gulp-terser-js/master.svg?label=linux
[travis-url]: https://travis-ci.com/gulp-community/gulp-terser-js
[coveralls-image]: https://img.shields.io/coveralls/gulp-community/gulp-terser-js/master.svg
[coveralls-url]: https://coveralls.io/r/gulp-community/gulp-terser-js?branch=master

## Why choose terser?

> `uglify-es` is [no longer maintained](https://github.com/mishoo/UglifyJS2/issues/3156#issuecomment-392943058) and `uglify-js` does not support ES6+.
> 
> **`terser`** is a fork of `uglify-es` that retains API and CLI compatibility
> with `uglify-es` and `uglify-js@3`.
Source:[Why choose terser?](https://github.com/terser-js/terser/blob/master/README.md#why-choose-terser)

## Why choose `gulp-terser-js`

This plugin displays formatted error:

![error screenshot](https://i.imgur.com/eZUpLmB.png)

## Installation

```
npm install gulp-terser-js
```

## Basic Usage

```js
const terser = require('gulp-terser-js')

const minifyJS = () =>
  gulp.src('asset/js/*.js')
    .pipe(terser({
       mangle: {
         toplevel: true
       }
    }))
    .on('error', function (error) {
      this.emit('end')
    })
    .pipe(gulp.dest('public/js/'))


gulp.task('minifyJS', minifyJS)
```

## Options

The options you can use [can be found here](https://github.com/terser-js/terser#parse-options).

## Avanced Usage

```js
const gulp = require('gulp')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const terser = require('gulp-terser-js')

const sourceMapOpt = {
  sourceMappingURL: (file) => 'http://127.0.0.1/map/' + file.relative + '.map'
}
const mapsFolder = './public/map'

const minifyJS = () =>  
  gulp.src('./asset/js/*.js')
    .pipe(gulp.dest(mapsFolder))
    .pipe(sourcemaps.init())
    .pipe(concat('script.js'))
    .pipe(terser({
      mangle: {
        toplevel: true
      }
    }))
    .on('error', function (error) {
      if (error.plugin !== "gulp-terser-js") {
        console.log(error.message)
      }
      this.emit('end')
    })
    .pipe(sourcemaps.write(mapsFolder, sourceMapOpt))
    .pipe(gulp.dest('./public/js/'))

gulp.task('minifyJS', minifyJS)
```

### Source maps

When running Terser on compiled Javascript, you may run into issues with source maps.
If you need to pass the content of your source maps to Terser, first you must set the `loadMaps` option to `true` when initializing `gulp-sourcemaps`.
Next, make the `content` source map option `true` when piping Terser.

A basic setup may look like this:
```js
gulp.src('asset/js/*.js')
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(terser({
     sourceMap: {
       content: true
     }
  }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('dist'))
```

## Can I use terser to format error of an other gulp module ?

```js
// ... 
const less = require('gulp-less');

const generateCSS = () =>  
  gulp.src("./asset/css/*.less", srcOptions)
    .pipe(less()).on("error", printLESSError)
    .pipe(postcss([cssnano]))
    .pipe(sourcemaps.write(path.relative(srcOptions.cwd, mapsFolder), sourceMapOpt))
    .pipe(gulp.dest(outputBuildFolder))

function printLESSError(error) {
  if (error.plugin === "gulp-less") {
    terser.printError.call(this, {
      name: error.type,
      line: error.line,
      col: error.column,
      filePath: error.filename,
      fileContent: '' + fs.readFileSync(error.filename),
      message: (error.message || '').replace(error.filename, path.basename(error.filename)).split(' in file')[0],
      plugin: error.plugin
    })
  } else {
    console.log(error.message);
  }
  this.emit('end')
}
```

## Version

| Description    | gulp-terser-js |
| -------------- | -------------- |
| Node Version   | >= 8.10.0      |
| Terser Version | 4.1.4+         |
| Gulp Version   | >= 4.X         |
