'use strict'

const test = require('tape')
const series = require('run-series')
const path = require('path')
const fs = require('fs-extra')
const flatten = require('lodash.flatten')
const folderSize = require('get-folder-size')
const download = require('./')
const async = require('async')

test('download', function (t) {
  t.plan(3)
  const TARGET_DIRECTORY = process.env.TARGET_DIRECTORY || './packages'

  const COUNT = parseInt(process.env.COUNT, 10) || 10
  console.log('Expecting: '+COUNT)

  series([
    (callback) => download(COUNT, callback),
    verifyCount,
    verifySize,
    verifyLodash
  ], t.end)

  async function verifyCount(callback) { 
    const base = TARGET_DIRECTORY
    const isScoped = x => x.match(/^@/)
    const notDotfile = x => !x.match(/^\./)
    const packages = await fs.readdir(base)
    const unscoped = packages.filter(x => !isScoped(x)).filter(notDotfile)
    const scoped = flatten(await Promise.all(
      packages.filter(isScoped).map(x => fs.readdir(path.join(base, x)))
    ))

    const total = scoped.length + unscoped.length
    t.equal(total, COUNT, `files found: ${COUNT} (scoped:"${scoped.length}" + unscoped:"${unscoped.length}")`)
    callback()
  }

  function verifySize (callback) {
    folderSize(TARGET_DIRECTORY, function (err, size) {
      if (err) return callback(err)
      t.ok(size / 1024 > 5 * COUNT, 'min 5k per package')
      callback()
    })
  }

  function verifyLodash (callback) {
    const _ = require(TARGET_DIRECTORY+'/lodash')
    t.equal(typeof _.map, 'function', '_.map exists')
    callback()
  }
})
