"use strict";

const through2 = require("through2"),
      assign = require("object-assign"),
      PluginError = require("plugin-error"),
      applySourceMap = require("vinyl-sourcemaps-apply");

const terser = require("terser");

module.exports = function (options) {
  // Mixes in default options.
  const opts = assign({}, {}, options);

  return through2.obj(function(file, enc, next) {
    if (file.isNull()) {
      return next(null, file);
    }

    if (file.isStream()) {
      return next(new PluginError('gulp-terser', 'Streaming not supported'));
    }

    const str = file.contents.toString();
    let build = {};

    // Bootstrap source maps
    if (file.sourceMap) {
      opts.sourceMap = {};
      opts.sourceMap.filename = file.sourceMap.file;
    }

    if (file.sourceMap && file.sourceMap.file) {
      build[file.sourceMap.file] = str;
    } else {
      build = str;
    }
    const res = terser.minify(build, opts);

    if (res.error) {
      res.error.filePath = file.path; 
      res.error.fileContent = (typeof build === "string") ? build : build[res.error.filename]; 
      return next(new PluginError('gulp-terser', res.error));
    }

    file.contents = new (Buffer.from || Buffer)(res.code); // source-map

    if (file.sourceMap && res.map) {
      applySourceMap(file, res.map);
    }

    return next(null, file);
  });
};
