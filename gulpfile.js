//
// Gulp config file
//

/**
 * Vars
 */
// Initialize Gulp
var gulp = require('gulp');
// Initialize Gutil
var gutil = require('gulp-util');
// Exec object for running shell scripts
var exec = require('child_process').exec;
// Automatically parse and load plugins
var gulpLoadPlugins = require('gulp-load-plugins');
// Plugins object holder
var plugins = gulpLoadPlugins({
    DEBUG: false,
    pattern: '*',
    replaceString: /^gulp(-|\.)/,
    camelize: true
});

/**
 *  Error handler
 */
var onError = function (err) {
    plugins.notify.onError({
        title: 'Gulp error in ' + err.plugin,
        message: err.toString()
    })(err);
    gutil.beep();
    console.log(err.toString());
    this.emit('end');
};

/**
 * Paths
 */
var paths = {
    css: {
        src: 'app/scss/main.scss',
        dest: 'dist/css/'
    },
    js: {
        src: 'app/js/**/*.js',
        dest: 'dist/js/'
    },
    plugins: {
        src: 'bower_components/**',
        css: 'dist/css/',
        js: 'dist/js/'
    },
    img: {
        src : 'app/img/**/*.{png,jpg,svg,gif}',
        dest : 'dist/img/'
    },
	fonts: {
		src : 'app/fonts/**',
		dest : 'dist/fonts/',
	},
    files: {
		src : 'app/files/**',
		dest : 'dist/files/',
	},
    html: {
        watch : 'app/**/*.html',
		src : ['app/**/*.html','!app/content/**'],
		dest : 'dist/',
	},
    iconfont: {
        src: 'app/iconfont/*.svg',
        dest: 'dist/fonts/',
    }
};


/**
 * Clean project
 */
gulp.task('clean', function() {
    var toClean = [
        './.DS_Store',
        './**/.DS_Store',
		paths.html.dest
    ];

    return plugins.del(toClean);
});


/**
 * Node
 */
// Install components
gulp.task('npm:install', function(cb) {
    exec('npm install && npm update && npm prune', function (err, stdout, stderr) {
        console.log(stderr);
        cb(err);
    });
});


/**
 * Bower
 */
// Install components
gulp.task('bower:install', function() {
    return gulp.src('./', {read:false})
        .pipe(plugins.exec('bower install && bower prune'))
        .pipe(plugins.exec.reporter());
});

// Parse and compile components to bower.css / bower.js
gulp.task('bower:compile', function() {
    var jsFiles = plugins.filter('**/*.js', {restore: true}),
        cssFiles = plugins.filter('**/*.css', {restore: true});

    return gulp.src(plugins.mainBowerFiles({
            includeDev: true,
            includeSelf: true,
            debugging: false
        }))
        .pipe(plugins.plumber({errorHandler: onError}))
		.pipe(plugins.newer(paths.plugins.js,paths.plugins.css))
        .pipe(plugins.sourcemaps.init())
        .pipe(cssFiles)
        .pipe(plugins.groupConcat({'vendors.css': 'bower_components/**/*.css'}))
        .pipe(plugins.sourcemaps.write('.'))
		.pipe(plugins.uglifycss())
        .pipe(gulp.dest(paths.plugins.css))
        .pipe(cssFiles.restore)
        .pipe(plugins.sourcemaps.init())
        .pipe(jsFiles)
        .pipe(plugins.groupConcat({'vendors.js': 'bower_components/**/*.js'}))
		.pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(paths.plugins.js));
});


/**
 * Styles
 */
gulp.task('build:styles', function () {
    var processors = [
        plugins.autoprefixer({browsers:['> 1%']}),
        plugins.combineMq,
        plugins.postcssQuantityQueries
    ];

  return gulp.src(paths.css.src)
  	.pipe(plugins.plumber({errorHandler: onError}))
  	.pipe(plugins.newer(paths.css.dest))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({outputStyle: 'compressed'}))
  	.pipe(plugins.postcss(processors))
  	.pipe(plugins.rename('app.min.css'))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(paths.css.dest))
    .pipe(plugins.connect.reload());
});


/**
 * Javascript
 */
//concatenate and compile js to app.min.js
gulp.task('build:js', function() {
  return gulp.src(paths.js.src)
   	.pipe(plugins.plumber({errorHandler: onError}))
  	.pipe(plugins.newer(paths.js.dest))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.groupConcat({'app.min.js': '**/*.js'}))
    .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(paths.js.dest))
  	.pipe(plugins.connect.reload());
});


/**
 * Images
 */
// Compress images for development
gulp.task('build:images:development', function() {
    var config = {
        optimizationLevel: 0,
        progressive: false,
        interlaced: false
    };

    return gulp.src(paths.img.src)
        .pipe(plugins.plumber({errorHandler: onError}))
		.pipe(plugins.newer(paths.img.dest))
        .pipe(plugins.imagemin(config))
        .pipe(gulp.dest(paths.img.dest))
        .pipe(plugins.connect.reload());
});

// Copy favicon to /img
gulp.task('copy:img', function() {
    return gulp.src('app/img/favicon.ico')
		.pipe(plugins.newer(paths.img.dest))
        .pipe(gulp.dest(paths.img.dest));
});


// Compress images for production (Heavy CPU!)
gulp.task('build:images:production', function() {
    var config = {
        optimizationLevel: 7,
        progressive: true,
        interlaced: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [plugins.imageminPngquant({ quality: '80', speed: 1 }), plugins.imageminMozjpeg({quality: '80'})]
    };

    return gulp.src(paths.img.src)
        .pipe(plugins.plumber({errorHandler: onError}))
		.pipe(plugins.newer(paths.img.dest))
        .pipe(plugins.imagemin(config))
        .pipe(gulp.dest(paths.img.dest))
        .pipe(plugins.connect.reload());
});


/**
 * HTML
 */
gulp.task('build:html', function () {
  return gulp.src(paths.html.src)
  	.pipe(plugins.plumber({errorHandler: onError}))
    .pipe(plugins.fileInclude({
		filters: {
			markdown: plugins.markdown.parse
		}
    }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(plugins.connect.reload());
});

gulp.task('build:html:newer', function () {
  return gulp.src(paths.html.src)
  	.pipe(plugins.plumber({errorHandler: onError}))
    .pipe(plugins.newer(paths.html.dest))
    .pipe(plugins.fileInclude({
		filters: {
			markdown: plugins.markdown.parse
		}
    }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(plugins.connect.reload());
});


/**
 * Fonts
 */
gulp.task('copy:fonts', function () {
  return gulp.src(paths.fonts.src)
  	.pipe(plugins.newer(paths.fonts.dest))
    .pipe(gulp.dest(paths.fonts.dest));
});


gulp.task('build:iconfont', function(){
    return gulp.src(paths.iconfont.src, {base: 'app/'})
    .pipe(plugins.newer(paths.iconfont.dest))
    .pipe(plugins.iconfontCss({
        fontName: 'iconfont',
        path: 'app/scss/_template.scss',
        targetPath: '../../app/scss/_iconfont.scss',
        fontPath: '../fonts/'
    }))
    .pipe(plugins.iconfont({
        fontName: 'iconfont',
        prependUnicode: true,
        fontHeight: 1024,
        formats: ['ttf', 'eot', 'woff', 'svg'],
        normalize: true,
        timestamp: Math.round(Date.now()/1000)
    }))
    .pipe(gulp.dest(paths.iconfont.dest));
});


/**
 * Files
 */
gulp.task('copy:files', function () {
return gulp.src(paths.files.src)
	.pipe(plugins.newer(paths.files.dest))
    .pipe(gulp.dest(paths.files.dest));
});


/**
 * Connect
 */
gulp.task('connect', function() {
  plugins.connect.server({
    root: 'dist',
    livereload: true
  });
});


/**
 * Sequences
 */
// Development build
gulp.task('developmentSequence', ['bower:compile', 'build:styles', 'build:js', 'build:images:development', 'build:html', 'copy:img', 'copy:fonts', 'build:iconfont', 'copy:files']);

// Production build
gulp.task('productionSequence', ['bower:compile', 'build:styles', 'build:js', 'build:images:production', 'build:html', 'copy:img', 'copy:fonts', 'copy:files']);

/**
 * Notices
 */
// Build complete
gulp.task('notice:built', function() {
    return gulp.src('./', {read:false})
        .pipe(plugins.notify('Successfully built your project!'));
});

/**
 * Watch
 */
gulp.task('watch', function () {
    var queue = plugins.watchSequence(300);

	gulp.watch(paths.plugins.src, ['bower:compile']);
	gulp.watch(paths.css.src, ['build:styles']);
	gulp.watch(paths.js.src, ['build:js']);
	gulp.watch(paths.img.src, ['build:images:development']);
	gulp.watch(paths.html.src, ['build:html:newer']);
    gulp.watch(paths.html.watch, ['build:html']);
	gulp.watch(paths.fonts.src, ['copy:fonts']);
    gulp.watch(paths.iconfont.src, queue.getHandler('build:iconfont','build:styles'));
	gulp.watch(paths.files.src, ['copy:files']);
	gulp.watch('gulpfile.js', { interval: 500 }, ['developmentSequence']);
	plugins.connect.reload();
});

/**
 * Main tasks
 */
// Production build
gulp.task('prod', function (cb) {
	plugins.sequence('clean','build:iconfont','productionSequence', 'connect', 'notice:built', cb);
});

//The default task (called when you run `gulp` from cli)
gulp.task('default', function (cb) {
	plugins.sequence('build:iconfont','developmentSequence', 'watch', 'connect', 'notice:built', cb);
});
