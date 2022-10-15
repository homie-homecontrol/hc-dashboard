const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

const merge = require("merge-stream");
const spawn = require('child_process').spawn;
const ASSETS = ['src/*.Schema.json', 'package.json'];

const DEST = 'dist';

const TS_CONFIG = './tsconfig.json';


// JSON Schema generation
const tsj = require("ts-json-schema-generator");
const fs = require("fs");
const path = require("path");

const JSONS_CONVERSIONS = [
  {
    source: 'src/model/dash.model.ts',
    type: 'PageDef',
    output: 'PageDef.Schema.json',
    defaultCfg: { encodeRefs: false },
    // schemaPostAction: function (schema) {
    //   schema.definitions['PropertyPath']['pattern'] = "^(?!\\-)[a-z0-9\\-]+(?<!\\-)\/(?!\\-)[a-z0-9\\-]+(?<!\\-)\/(?!\\-)[a-z0-9\\-]+(?<!\\-)$";
    // }
  },
  {
    source: 'src/model/dash.model.ts',
    type: 'PageMenu',
    output: 'PageMenu.Schema.json',
    defaultCfg: { encodeRefs: false },
    // schemaPostAction: function (schema) {
    //   schema.definitions['PropertyPath']['pattern'] = "^(?!\\-)[a-z0-9\\-]+(?<!\\-)\/(?!\\-)[a-z0-9\\-]+(?<!\\-)\/(?!\\-)[a-z0-9\\-]+(?<!\\-)$";
    // }
  },
  {
    source: 'src/model/api.model.ts',
    type: 'APIMessage',
    output: 'WSAPI.Schema.json',
    defaultCfg: { encodeRefs: false },
    // schemaPostAction: function (schema) {
    //   schema.definitions['PropertyPath']['pattern'] = "^(?!\\-)[a-z0-9\\-]+(?<!\\-)\/(?!\\-)[a-z0-9\\-]+(?<!\\-)\/(?!\\-)[a-z0-9\\-]+(?<!\\-)$";
    // }
  }
]


var server = null;

// pull in the project TypeScript config
const tsProject = ts.createProject(TS_CONFIG);


function ensureDist(cb) {
  if (!fs.existsSync(`./${DEST}`)) {
    fs.mkdirSync(`./${DEST}`);
    cb();
  } else {
    cb();
  }
}


function generateSchema(jsons_conf) {
  return new Promise((resolve, reject) => {
    const config = {
      ...{
        path: jsons_conf.source,
        tsconfig: TS_CONFIG,
        type: jsons_conf.type,
      },
      ...jsons_conf.defaultCfg
    };

    const schema = tsj.createGenerator(config).createSchema(config.type);
    // if (jsons_conf.schemaPostAction) { jsons_conf.schemaPostAction(schema); }
    const schemaString = JSON.stringify(schema, null, 2);
    fs.writeFile(path.join(DEST, jsons_conf.output), schemaString, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  })
}


function generateJSONSchema(cb) {

  const generators = JSONS_CONVERSIONS.map(jsons_conf => generateSchema(jsons_conf))

  Promise.all(generators).then(() => {
    cb();
  })



}


function copyModelToFrontend() {
  return merge([
    gulp.src('src/model/dash.model.ts').pipe(gulp.dest('../frontend/src/app/models', { overwrite: true })),
    gulp.src('src/model/api.model.ts').pipe(gulp.dest('../frontend/src/app/models', { overwrite: true })),
  ]);
}

function devBuild() {
  const tsResult = tsProject.src()
    .pipe(sourcemaps.init({ debug: true }))
    .pipe(tsProject());
  return tsResult.js
    .pipe(sourcemaps.mapSources(function (sourcePath, file) {
      // source paths are prefixed with '../src/'

      return sourcePath.slice(1);
    }))
    .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: function (file) { return file.cwd + '/src/'; } }))
    .pipe(gulp.dest(DEST));
}


function prodBuild() {
  const tsResult = tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject());
  return tsResult.js
    .pipe(gulp.dest(DEST));
}

function assets() {
  return gulp.src(ASSETS).pipe(gulp.dest(DEST));
}


function watch(done) {
  gulp.watch(['./src/**/*.ts', './src/**/*.json'], gulp.series(gulp.parallel(generateJSONSchema, copyModelToFrontend, devBuild, assets), makeRunServer('test')));
  done();
}

function makeRunServer(target) {
  return (done) => {
    if (server) {
      server.once('exit', () => { done(); })
      server.kill('SIGTERM');
    }
    server = spawn('yarn', ['run', target], { stdio: 'inherit' });
    server.on('close', function (code) {
      if (code > 0) {
        console.log('Error detected, waiting for changes...');
      }
    });
    done();
  }
}

// function runServer(done) {

// }


gulp.task('default', gulp.series(ensureDist, generateJSONSchema, copyModelToFrontend, devBuild, assets));
gulp.task('build', gulp.series(ensureDist, generateJSONSchema, copyModelToFrontend, devBuild, assets));
gulp.task('prod', gulp.series(ensureDist, generateJSONSchema, copyModelToFrontend, prodBuild, assets));
gulp.task('watch', gulp.series(ensureDist, generateJSONSchema, copyModelToFrontend, devBuild, assets, makeRunServer('test'), watch));
gulp.task('debug', gulp.series(ensureDist, generateJSONSchema, copyModelToFrontend, devBuild, assets, makeRunServer('debug')));