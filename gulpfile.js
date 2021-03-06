import gulp from "gulp";
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import concat from "gulp-concat";
import autoprefixer from "gulp-autoprefixer";
import htmlmin from "gulp-htmlmin";
import cleanCss from "gulp-clean-css";
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from "gulp-imagemin";
import webpConvert from "gulp-webp";
import del from "del";
import browserSync from "browser-sync";

browserSync.create();
const sass = gulpSass(dartSass);

export const browsersync = () => {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
    notify: false,
  });
};

export const styles = () => {
  return gulp.src("app/scss/index.scss")
    .pipe(sass())
    .pipe(concat("index.css"))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["defaults, not IE 11"]
      })
    )
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.stream());
};

export const htmlMin = () => {
  return gulp.src("app/**/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("dist"))
};

export const cssMin = () => {
  return gulp.src("app/css/**/*.css")
    .pipe(cleanCss({ level: 2 }))
    .pipe(gulp.dest("dist/css"));
};

export const imagesMin = () => {
  return gulp.src("app/images/**/*.*")
    .pipe(
      imagemin([
        gifsicle({ interlaced: true }),
        mozjpeg({ quality: 82, progressive: true }),
        optipng({ optimizationLevel: 5 }),
        svgo({
          plugins: [
            { name: 'removeViewBox', active: true },
            { name: 'cleanupIDs', active: false },
          ],
        }),
      ])
    )
    .pipe(gulp.dest("dist/images"));
};

export const webp = () => {
  return gulp.src(["app/images/**/*.{jpg,jpeg,png}", "!app/images/favicon/*"], { since: gulp.lastRun(webp) })
    .pipe(webpConvert({ quality: 82 }))
    .pipe(gulp.dest("app/images"));
}

export const webpDel = () => {
  return del("app/images/**/*.webp");
};

export const buildOther = () => {
  return gulp.src(["app/**/manifest.json"]).pipe(gulp.dest("dist"));
};

export const cleanDist = () => {
  return del("dist");
};

export const watching = () => {
  gulp.watch(["app/scss/**/*.scss"], styles);
  gulp.watch("app/images/**/*.{jpg,jpeg,png}").on("add", webp);
  gulp.watch(["app/**/*.html"]).on("change", browserSync.reload);
};

export const build = gulp.series(cleanDist, gulp.parallel(htmlMin, cssMin, buildOther, imagesMin));

export default gulp.parallel(styles, browsersync, watching);