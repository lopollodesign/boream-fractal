'user strict';

var gulp = require('gulp');
var fractal = require('./fractal.js');
var logger = fractal.cli.console;
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var cssnano = require('cssnano');

// Tarea para compilar sass
gulp.task('sass', function () {
    return gulp.src('src/assets/scss/**/*.scss')
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./assets/css'));
});

// Optimizacion CSS
gulp.task('css-minify' , function(){
    var plugins = [
        autoprefixer,
        mqpacker,
        cssnano,
    ];
    return gulp.src('assets/css/style.css')
        .pipe(postcss(plugins))
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('./assets/css'));
});

// Vigilar cambios css
gulp.task('watch', function(){
    gulp.watch(['src/components/**/*.scss', 'src/assets/**/*.scss'], gulp.series('sass'));
    gulp.watch('assets/css/style.css', gulp.series('css-minify'));
});

/*
 * Start the Fractal server
 *
 * In this example we are passing the option 'sync: true' which means that it will
 * use BrowserSync to watch for changes to the filesystem and refresh the browser automatically.
 * Obviously this is completely optional!
 *
 * This task will also log any errors to the console.
 */

gulp.task('fractal:start', function () {
    const server = fractal.web.server({
      sync: true
    });
    server.on('error', err => logger.error(err.message));
    return server.start().then(() => {
      logger.success(`-------------------------------------------`);
      logger.success(`|  Local URL:   ${server.url}     |`);
      logger.success(`|  Network URL: ${server.urls.sync.external}  |`);
      logger.success(`-------------------------------------------`);
    });
  });
  
  /*
   * Run a static export of the project web UI.
   *
   * This task will report on progress using the 'progress' event emitted by the
   * builder instance, and log any errors to the terminal.
   *
   * The build destination will be the directory specified in the 'builder.dest'
   * configuration option set above.
   */
  
  gulp.task('fractal:build', function () {
    const builder = fractal.web.builder();
    builder.on('progress', (completed, total) => logger.update(`Exported ${completed} of ${total} items`, 'info'));
    builder.on('error', err => logger.error(err.message));
    return builder.build().then(() => {
      logger.success('Fractal build completed!');
    });
  });

  // Tarea a ejecutar
  gulp.task( 'default' , gulp.parallel( 'fractal:start' , 'sass' , 'watch' ));