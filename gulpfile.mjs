"use strict";

// const gulp = require("gulp");
// const sass = require("gulp-sass");
// const browserSync = require("browser-sync").create();
// const del = require("del");
// const postcss = require("gulp-postcss");
// const autoprefixer = require("autoprefixer");
// const cssnano = require("cssnano");
// const imagemin = require("gulp-imagemin");
// const webpack = require("webpack");
// const webpackStream = require("webpack-stream");
// const webpackConfig = require("./webpack.config.js");

// const gulp = require("gulp");
// const sass = require("gulp-sass");
// const browserSync = require("browser-sync").create();
// const del = require("del");
// const postcss = require("gulp-postcss");
// const autoprefixer = require("autoprefixer");
// const cssnano = require("cssnano");
// import imagemin from "gulp-imagemin";
// const webpack = require("webpack");
// const webpackStream = require("webpack-stream");
// const webpackConfig = require("./webpack.config.js");

import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);
import browserSync from "browser-sync";
import del from "del";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import imagemin from "gulp-imagemin";
import webpack from "webpack";
import webpackStream from "webpack-stream";
import webpackConfig from "./webpack.config.js";

// initialize browsersync
function browserSyncInit() {
  browserSync.init({
    notify: false,
    server: {
      baseDir: "dist"
    }
  });
}

// reload browsersync
function reload(done) {
  browserSync.reload();
  done();
}

// clean assets
function clean() {
  return del(["'dist/**'"]);
}

// handle html
function html() {
  return gulp.src("./src/*.html").pipe(gulp.dest("./dist"));
}

// handle css
function style() {
  return gulp
    .src("./src/styles/styles.scss")
    .pipe(sass())
    .pipe(postcss([autoprefixer("last 2 versions"), cssnano()]))
    .on("error", swallowError)
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream());
}

// handle popup-related js
function scripts() {
  return gulp
    .src("./src/scripts/*.js")
    .pipe(
      webpackStream(webpackConfig),
      webpack
    )
    .on("error", swallowError)
    .pipe(gulp.dest("./dist/js"));
}

// handle background service worker
function workers() {
  return gulp
    .src("./src/service_workers/*.js")
    .on("error", swallowError)
    .pipe(gulp.dest("./dist"));
}

// move manifest.json to dist directory
function manifest() {
  return gulp
    .src("./src/manifest.json")
    .on("error", swallowError)
    .pipe(gulp.dest("./dist"));
}

// optimize images
function images() {
  return gulp
    .src("./src/images/**/*")
    .pipe(imagemin())
    .on("error", swallowError)
    .pipe(gulp.dest("./dist/images"));
}

// watch files
function watchFiles() {
  gulp.watch("./src/*.html", gulp.series(html, reload));
  gulp.watch("./src/styles/**/*.scss", style);
  gulp.watch("./src/scripts/**/*.js", gulp.series(scripts, reload));
  gulp.watch("./src/service_workers/*.js", gulp.series(workers, reload));
  gulp.watch("./src/manifest.json", gulp.series(manifest, reload));
  gulp.watch("./src/images/**/*", gulp.series(images, reload));
}

function swallowError(err) {
  console.log(err.toString());
  this.emit("end");
}

const watch = gulp.parallel(watchFiles, browserSyncInit);
const build = gulp.series(
  clean,
  gulp.parallel(html, style, scripts, workers, manifest, images)
);

// exports.watch = watch;
// exports.build = build;
export { watch, build };
