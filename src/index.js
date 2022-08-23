const { name } = require('../package.json')

let HtmlWebpackPlugin
try {
  HtmlWebpackPlugin = require('html-webpack-plugin')
} catch (e) {
  if (!(e instanceof Error) || e.code !== 'MODULE_NOT_FOUND') throw e
}

function processHTML(html, options) {
  const scriptTagWithSrc = /(<script[^>]*src="[:\-@\/\.\w\d]+"[^>]*)>/g
  const injectAttr = ` crossorigin="${options.crossorigin}"`
  return html.replace(scriptTagWithSrc, (match, p1) => {
    return p1 + injectAttr + ">"
  })
}

module.exports = class CrossOriginWebpackPlugin {
  constructor (options) {
    this.options = options || { crossorigin: 'anonymous' }
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
          domain: this.options.domain
        })
        callback(null, htmlPluginData)
      })
    })
  }
}
