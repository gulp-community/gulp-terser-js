# gulp-terser-js

[![NPM Version](https://img.shields.io/npm/v/gulp-terser-js.svg)](https://www.npmjs.com/package/gulp-terser-js) [![Build Status](https://travis-ci.org/A-312/gulp-terser-js.svg?branch=master)](https://travis-ci.org/A-312/gulp-terser-js)

A [Terser-js](https://github.com/terser-js/) plugin for Gulp

## Why choose terser?

> `uglify-es` is [no longer maintained](https://github.com/mishoo/UglifyJS2/issues/3156#issuecomment-392943058) and `uglify-js` does not support ES6+.
> 
> **`terser`** is a fork of `uglify-es` that retains API and CLI compatibility
> with `uglify-es` and `uglify-js@3`.
Source:[Why choose terser?](https://github.com/terser-js/terser/blob/master/README.md#why-choose-terser)

## Information

<table>
<tr>
<td>Package</td><td>gulp-terser-js</td>
</tr>
<tr>
<td>Description</td>
<td>Terser-js plugin for gulp</td>
</tr>
<tr>
<td>Node Version</td>
<td>Recommanded >= 8.0.0</td>
</tr>
<tr>
<td>Terser Version</td>
<td>Recommanded v3.14+</td>
</tr>
<tr>
<td>Gulp Version</td>
<td>3.x</td>
</tr>
</table>

## Installation

```
npm install gulp-terser-js
```

## Basic Usage

```js
const terser = require('gulp-terser-js');

const minifyJS = () =>
  gulp.src('asset/js/*.js')
    .pipe(terser({
       mangle: {
         toplevel: true
       }
    }))
    .pipe(gulp.dest('public/js/'));
;

gulp.task("minifyJS", minifyJS);
```

## Options

The options you can use [can be found here](https://github.com/terser-js/terser#parse-options).

## Avanced Usage

```js
const gulp = require('gulp'),
  concat = require('gulp-concat'),
  sourcemaps = require('gulp-sourcemaps'),
  terser = require('gulp-terser-js');

const sourceMapOpt = {
  sourceMappingURL: (file) => "http://127.0.0.1/map/" + file.relative + ".map"
};
const mapsFolder = './public/map';

const minifyJS = () =>  
  gulp.src('./asset/js/*.js')
    .pipe(gulp.dest(mapsFolder))
    .pipe(sourcemaps.init())
    .pipe(concat("script.js"))
    .pipe(terser({
      mangle: {
        toplevel: true
      }
    })).on("error", printError)
    .pipe(sourcemaps.write(mapsFolder, sourceMapOpt))
    .pipe(gulp.dest('./public/js/'));
;

gulp.task("minifyJS", minifyJS);
```

## printError

![error screenshot](https://i.imgur.com/eZUpLmB.png)

```js
function alignLine(num, text, longer, maxsize) {
	let maxlength = process.stdout.columns - 1;
	num = num + Array(longer - (num + "").length).join(" ");
	maxlength -= num.length + 3;
	console.log("\033[36m" + num + " |\033[00m " + text.slice(0, (maxsize < maxlength) ? maxlength : maxsize));
}

function printLESSError(ev) {
	return printError.call(this, {
		name: ev.type,
		line: ev.line,
		col: ev.column,
		filePath: ev.filename,
		fileContent: "" + fs.readFileSync(ev.filename),
		message: (ev.message || "").replace(ev.filename, path.basename(ev.filename)).split(" in file")[0],
		plugin: ev.plugin
	});
}

function printError(ev) {
	if (!ev.fileContent || (ev.line === undefined && ev.col === undefined))
		return console.error(ev.stack || ev);

	const fileContent = ev.fileContent;
	const lines = fileContent.replace(/\t/g, "    ").split("\n"),
		more = (ev.line + " ").length,
		col = ev.col + 1,
		pos = (more + 2) + fileContent.split("\n")[ev.line - 1].replace(/[^\t]/g, "").length * 3 + parseInt(col);

	console.log(`\nError with ${ev.plugin} :`);
	for (let i = ev.line - 5; i < ev.line; i++) {
		if (lines[i]) {
			alignLine(i + 1, lines[i], more, pos);
		}
	}

	console.log(Array(pos).join(" ") + "\033[91m^\033[00m");
	console.log("(" + ev.name + ") " + ev.message + " (line : \033[96m" + ev.line + "\033[00m, col : \033[96m" + col + "\033[00m).");
	console.log(`in : ${ev.filePath}\n`);

	return this.emit('end');
}
```
