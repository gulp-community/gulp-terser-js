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
      printError(res.error);
      return next(new PluginError('gulp-terser', res.error));
    }

    file.contents = new (Buffer.from || Buffer)(res.code); // source-map

    if (file.sourceMap && res.map) {
      applySourceMap(file, res.map);
    }

    return next(null, file);
  });
};

function alignLine(num, text, longer, maxsize) {
	let maxlength = process.stdout.columns - 1;
	num = num + Array(longer - (num + "").length).join(" ");
	maxlength -= num.length + 3;
	console.log("\033[36m" + num + " |\033[00m " + text.slice(0, (maxsize < maxlength) ? maxlength : maxsize));
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
