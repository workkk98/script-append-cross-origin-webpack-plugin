const { name } = require('../package.json')

let HtmlWebpackPlugin
try {
  HtmlWebpackPlugin = require('html-webpack-plugin')
} catch (e) {
  if (!(e instanceof Error) || e.code !== 'MODULE_NOT_FOUND') throw e
}

function getSrcFromScript(element) {
  const srcValue = element.match(/src="([^"']*)"/)
  return srcValue ? srcValue[1] : ''
}

function isScriptNeedCrossOriginAttr(srcValue, matcher) {
  if (!matcher.length) return true
  return matcher.some(exp => new RegExp(exp).test(srcValue))
}

function processHTML(html, options) {
  const scriptTagWithSrc = /(<script[^>]*src="[:\-@\/\.\w\d]+"[^>]*)>/g
  const injectAttr = ` crossorigin="${options.crossorigin}"`
  return html.replace(scriptTagWithSrc, (match, p1) => {
    const srcValue = getSrcFromScript(p1)
    return isScriptNeedCrossOriginAttr(srcValue, options.matcher) ? p1 + injectAttr + ">" : match
  })
}

function processOptions(options) {
  return {
    crossorigin: options.crossorigin ? options.crossorigin : 'anonymous',
    matcher: options.matcher == null ? [] : Array.isArray(options.matcher) ? options.matcher : [options.matcher]
  }
}

module.exports = class CrossOriginWebpackPlugin {
  constructor (options) {
    console.log(
      'options', options
    )
    this.options = options ? processOptions(options) : { crossorigin: 'anonymous', matcher: [] }
  }

  apply (compiler) {
    // Hook into the html-webpack-plugin processing
    if (!HtmlWebpackPlugin || !HtmlWebpackPlugin.getHooks) {
      console.error(name, 'html-webpack-plugin not installed or version is below 4/5')
      return
    }

    compiler.hooks.compilation.tap('CrossOriginWebpackPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('CrossOriginWebpackPlugin', (htmlPluginData, callback) => {
        htmlPluginData.html = processHTML(htmlPluginData.html, {
          crossorigin: this.options.crossorigin,
          matcher: this.options.matcher
        })
        callback(null, htmlPluginData)
      })
    })
  }
}
