var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    fileinclude = require('gulp-file-include'),
    react = require('gulp-react'),
	webpack = require('webpack-stream'),
	babel = require('gulp-babel'),
	proxyMiddleware = require('http-proxy-middleware'),
	runSequence = require('run-sequence'),
	postcss = require('gulp-postcss'),
	path = require('path'),
	px2rem = require('postcss-px2rem'), /*为了解决flexible冲突引入*/
	ComponentPlugin = require("component-webpack-plugin"),
	browserSync = require('browser-sync').create();

var DEST = 'html/'; // real wechat生成地址
var FROM = 'source/src';
var WPFROM = './' + FROM + '/jsx/compile/';
var wpObj = {
	'contract_view_test' : WPFROM + 'contract_view_test.js'
};

// TODO 把lib/js下面的内容也包括进去
gulp.task('scripts', function() {
    return gulp.src([
		FROM + '/js/helpers/*.js',
		FROM + '/js/*.js'
      ])
      .pipe(concat('custom.js'))
      .pipe(gulp.dest(DEST+'/js'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest(DEST+'/js'))
      .pipe(browserSync.stream());
});

var compileSASS = function (filename, options) {
	return sass(FROM + '/scss/custom.scss', options)
		.pipe(autoprefixer({ browsers: ['last 2 versions', '> 5%'], remove: false }))
		.pipe(concat(filename))
		.pipe(gulp.dest(DEST+'/css'))
		.pipe(browserSync.stream());
};
gulp.task('sass', function() {
    return compileSASS('custom.css', {});
});

gulp.task('sass-minify', function() {
    return compileSASS('custom.min.css', {style: 'compressed'});
});

// include partial files
gulp.task('fileinclude', function() {
    gulp.src([FROM + '/**.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(DEST));
});

gulp.task('browser-sync', function() {
	var proxyEstate = proxyMiddleware('/myhome/api', {
		target: 'http://test.memorhome.com/',
		changeOrigin: true,
		logLevel: 'debug'
	});

	browserSync.init({
		server: {
			baseDir: './',
			port: 3000,
			middleware: [proxyEstate]
		},
		startPath: DEST + 'contract_view_test.html',
		open: false,
		logLevel: "debug"
	});
});

gulp.task('reactNwebpack', function () {
	runSequence('react', 'webpack');
});

gulp.task('react', function () {
	gulp.src(FROM + '/jsx/*.jsx')
		.pipe(react({
			harmony: false,
			es6module: true
		}))
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest(FROM + '/jsx/compile'));
});
gulp.task('webpack', function () {
	setTimeout(function(){
		gulp.src(FROM + '/jsx/compile')
			.pipe(webpack({
				entry: wpObj,
				output: {
					path: require("path").resolve('./' + DEST + 'jsx'),
					filename: '[name].js'
				},
				stats: {
					colors: true,
					modules: true,
					reasons: true,
					errorDetails: true
				},
				module: {
					loaders: [
						{ test: /\.css$/, loader: "style-loader!css-loader" },
						{ test: /\.png$/, loader: "url-loader?limit=100000" },
						{ test: /\.jpg$/, loader: "file-loader" }
					]
				},
				plugins: [
					new ComponentPlugin()
				],
				resolve: {
					root: path.resolve('./'),
					extensions: ['', '.js']
				},
				externals: {    // 指定采用外部 CDN 依赖的资源，不被webpack打包
					"react": "React",
					"react-dom": "ReactDOM",
					"moment": "moment"
				},
			}))
			// .pipe(uglify())
			.pipe(gulp.dest(DEST + '/jsx'));
	}, 500); // TODO 这里很无奈 react的task都结束了 编译好的文件还没有生成 直接进入webpack的执行就会报错或者数据不同步 只能等待

});

gulp.task('img', function () {
	gulp.src(FROM + '/img/*').pipe(gulp.dest(DEST + '/img'));
});

gulp.task('libjs', function () {
	gulp.src(FROM + '/js/lib/*').pipe(gulp.dest(DEST + '/js/lib'));
});

gulp.task('fonts', function () {
	gulp.src(FROM + '/scss/fonts/*').pipe(gulp.dest(DEST + '/css/fonts'));
});

gulp.task('watch', function() {
	// Watch .js files
	gulp.watch(FROM + '/js/*.js', ['scripts']);
	// Watch .scss files
	gulp.watch(FROM + '/scss/*.scss', ['sass', 'sass-minify']);
	gulp.watch(FROM + '/jsx/*.jsx', ['reactNwebpack', browserSync.reload]);
	// Watch src/*.html change
	gulp.watch([FROM + '/*.html', FROM + '/partials/*.html'], ['fileinclude', browserSync.reload]);
	// watch image change
	gulp.watch(FROM + '/img/*', ['img', browserSync.reload]);
	// watch lib/js change
	gulp.watch(FROM + '/js/lib/*', ['libjs', browserSync.reload]);
	// watch fonts change
	gulp.watch(FROM + '/scss/fonts/*', ['fonts', browserSync.reload]);
});

gulp.task('default', ['browser-sync', 'watch']);













