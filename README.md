# gulp-terser-js

[![NPM Version](https://img.shields.io/npm/v/gulp-terser-js.svg)](https://www.npmjs.com/package/gulp-terser-js) [![Build Status](https://travis-ci.org/A-312/gulp-terser-js.svg?branch=master)](https://travis-ci.org/A-312/gulp-terser-js)

A [Terser-js](https://github.com/terser-js/) plugin for Gulp

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
    .pipe(gulp.dest('public/js/'))


gulp.task('minifyJS', minifyJS)
```

## Options

The options you can use [can be found here](https://github.com/terser-js/terser#parse-options).

## Avanced Usage

```js
const gulp = require('gulp'),
  concat = require('gulp-concat'),
  sourcemaps = require('gulp-sourcemaps'),
  terser = require('gulp-terser-js')

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
    })).on('error', function () {
      this.emit('end')
    })
    .pipe(sourcemaps.write(mapsFolder, sourceMapOpt))
    .pipe(gulp.dest('./public/js/'))

gulp.task('minifyJS', minifyJS)
```

## Can I use terser to format error of an other gulp module ?

```js
const generateCSS = () =>  
  gulp.src("./asset/css/*.less", srcOptions)
    .pipe(less()).on("error", printLESSError)
    .pipe(postcss([cssnano]))
    .pipe(sourcemaps.write(path.relative(srcOptions.cwd, mapsFolder), sourceMapOpt))
    .pipe(gulp.dest(outputBuildFolder))

function printLESSError(error) {
	terser.printError.call(this, {
		name: error.type,
		line: error.line,
		col: error.column,
		filePath: error.filename,
		fileContent: '' + fs.readFileSync(error.filename),
		message: (error.message || '').replace(error.filename, path.basename(error.filename)).split(' in file')[0],
		plugin: error.plugin
	})
  this.emit('end')
}
```

## Version

| Description    | gulp-terser-js |
| -------------- | -------------- |
| Node Version   | >= 8.0.0       |
| Terser Version | 4.1.4+         |
| Gulp Version   | >= 4.X         |
