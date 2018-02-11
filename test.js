'use strict'

const test = require('tape')
const series = require('run-series')
const fs = require('fs')
const folderSize = require('get-folder-size')
const download = require('./')
const async = require('async')

test('download', function (t) {
  t.plan(3)

  const COUNT = parseInt(process.env.COUNT, 10) || 10
  console.log('Expecting Count: '+COUNT)

  series([
    (callback) => download(COUNT, callback),
    verifyCount,
    verifySize,
    verifyLodash
  ], t.end)

  function verifyCount (callback) {
    fs.readdir('./packages', function (err, files) {
      if (err) return callback(err);

      const sub_packages = [];
      files = files.filter((file) => {
        if (file.match(/^\@/)) {
          sub_packages.push(file);
          return false;
        }
        return !/^\./.test(file);
      });

      // check the existance of sub-packages
      async.each(sub_packages, (name, cb) => {
        fs.readdir(`./packages/${name}`, (err, sub_files) => {
          if (err) return cb(err);
          sub_files = sub_files.filter((sub_file) => {
              if (!/^\./.test(sub_files)) {
                files.push(`${name}/${sub_file}`);
                return true;
              }
              return false;
          });

          cb();
        });
      }, (err) => {
        if(err) return callback(err);
        t.equal(files.length, COUNT, `has ${COUNT} files`);
        callback();
      });
    });
  }

  function verifySize (callback) {
    folderSize('./packages', function (err, size) {
      if (err) return callback(err)
      t.ok(size / 1024 > 5 * COUNT, 'min 5k per package')
      callback()
    })
  }

  function verifyLodash (callback) {
    const _ = require('./packages/lodash')
    t.equal(typeof _.map, 'function', '_.map exists')
    callback()
  }
})
