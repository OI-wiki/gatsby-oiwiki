/**
 * @file export compiled ES modules as a workaround before Gatsby properly handles it
 */

const esm = require('esm')
const fs = require('fs')

// Node: bypass [ERR_REQUIRE_ESM] limitations
const Module = require('module')
const orig = Module._extensions['.js']
Module._extensions['.js'] = function (module, filename) {
  const contents = fs.readFileSync(filename, 'utf8')
  module._compile(contents, filename)
}

// ESM: compile
const esmRequire = esm(module, {
  cjs: true,
  mode: 'all',
})

const imports = {
  remarkDetails: esmRequire('remark-details').default,
  rehypeDetails: esmRequire('rehype-details').default,
}

Module._extensions['.js'] = orig
module.exports = imports