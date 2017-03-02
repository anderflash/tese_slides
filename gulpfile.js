#!/usr/bin/env node
var rollup  = require('rollup');
var rts     = require('rollup-plugin-typescript');
var rwatch  = require('rollup-watch');
var ruglify = require('rollup-plugin-uglify');
var ts      = require('typescript');
var minify  = require('uglify-js').minify;
var chalk   = require('chalk');
var fs      = require('fs');
var gulp    = require('gulp');
var sass    = require('node-sass');
var Emitter = require('events').EventEmitter;
var stdout  = require('stdout-stream');
var grapher = require('sass-graph');
var Gaze    = require('gaze');
var path    = require('path');
var util    = require('util');
var browserSync = require('browser-sync').create();

var cache;

const p    = gulp.parallel;
const s    = gulp.series;
console.log(p);

process.title = "Tese Slides";

// Creating dist folder if it doesn't exist
if(!fs.existsSync('dist'))
  fs.mkdirSync('dist');

// Set configuration
const config = {
  entry: 'ts/tese.ts',
  dest: 'dist/tese.js',
  format: 'cjs',
  cache: cache,
  external: ['fs','chalk', 'path', 'child_process'],
  plugins: [
    rts({typescript: ts}),
    ruglify({
      mangle: {
        toplevel:true
      },
      compress: true
    }, minify)
  ]
};


// Converting TypeScript to JavaScript
// if(process.argv.length > 2 && process.argv[2] == '-w'){
//   const watcher = rwatch(rollup, config);
//   watcher.on('event', event => {
//     switch(event.code){
//       case 'ERROR':
//         console.error(chalk.red(event.code));
//       break;
//       case 'BUILD_START':
//         process.stdout.write(chalk.green("Recompiling..."));
//       break;
//       case 'BUILD_END':
//         fs.writeFileSync(config.dest, "#!/usr/bin/env node\n" + fs.readFileSync(config.dest));
//         process.stdout.write(chalk.green("end.\n"));
//       break;
//     }
//   });
// }else{
//   //---------------------------------------------------
//   // Converting TS to JS
//   process.stdout.write(chalk.white("Compiling TS..."));
//   rollup.rollup(config).then(bundle => {
//     // Generate bundle + sourcemap
//     var result = bundle.generate({
//       // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
//       format: 'cjs'
//     });
//     // Cache our bundle for later use (optional)
//     cache = bundle;
//     fs.writeFileSync(config.dest, result.code);
//     console.log(chalk.green("Build success"));
//   });
//   process.stdout.write(chalk.green("done.\n"));

//   //---------------------------------------------------
//   // Converting SCSS to CSS
//   process.stdout.write(chalk.white("Compiling SCSS..."));
//   var sass = require('node-sass');
//   sass.render({
//     file: 'scss/tese.scss',
//     outFile: 'dist/tese.css'
//   }, function(err, result) { 
//     if(err) 
//       console.error(err.formatted); 
//     else
//       fs.writeFileSync('dist/tese.css', result.css);
//   });
//   process.stdout.write(chalk.green("done.\n"));
// }

function scripts(done) {
  return rollup.rollup(config).then(bundle => {
    // Generate bundle + sourcemap
    var result = bundle.generate({
      // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
      format: 'cjs'
    });
    // Cache our bundle for later use (optional)
    cache = bundle;
    fs.writeFileSync(config.dest, result.code);
  });
}
function styles() {
  return new Promise((resolve, reject)=>{
    sass.render({
      file: 'scss/tese.scss',
      outFile: 'dist/tese.css'
    }, function(err, result) { 
      if(err) reject(err.formatted);
      else fs.writeFileSync('dist/tese.css', result.css);
      resolve();
    });
  })
}

function watch() {
  const watcher = rwatch(rollup, config);
  watcher.on('event', event => {
    switch(event.code){
      case 'ERROR':
        console.error(chalk.red(event.code));
      break;
      case 'BUILD_START':
        process.stdout.write(chalk.green("Recompiling..."));
      break;
      case 'BUILD_END':
        //fs.writeFileSync(config.dest, fs.readFileSync(config.dest));
        process.stdout.write(chalk.green("end.\n"));
      break;
    }
  });
  //sasswatch({src:'scss/tese.scss', watch:true},emitter);
  gulp.watch('scss/**/*.scss', styles);
  gulp.watch('assets/**/*', assets);
  gulp.watch('index.html', index);
}

function serve() {
  browserSync.init({
    server: {
      baseDir: "dist/"
    },
    files: [
      'dist/*.css'
    ],
    browser: 'firefox'
  });
  gulp.watch('dist/**/*.js').on('change', browserSync.reload);
  gulp.watch('dist/index.html').on('change', browserSync.reload);
}

function assets() {
  return gulp.src('assets/**/*', {since: gulp.lastRun(assets)})
    .pipe(gulp.dest('dist/assets'));
}
function index() {
  return gulp.src('index.html', {since: gulp.lastRun(index)})
    .pipe(gulp.dest('dist'));
}
function polyfills() {
  return gulp.src('node_modules/web-animations-js/web-animations-next.min.js', {since: gulp.lastRun(assets)})
    .pipe(gulp.dest('dist'));
}

var build = p(polyfills, scripts, styles, index, assets);

exports.scripts   = scripts;
exports.styles    = styles;
exports.watch     = s(build,watch);
exports.build     = build;
exports.default   = build;
exports.polyfills = polyfills;
exports.serve     = serve;
exports.assets    = assets;
exports.index     = index;