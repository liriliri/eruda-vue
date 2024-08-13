const { initDevtools } = require('./devtools')

module.exports = function (eruda) {
  let { evalCss } = eruda.util

  class Vue extends eruda.Tool {
    constructor() {
      super()
      this.name = 'vue'
      this._style = evalCss(require('./style.scss'))
    }
    init($el, container) {
      super.init($el, container)
      $el.html('<div class="eruda-tip">Put whatever you want here:)</div>')

      initDevtools()
    }
    show() {
      super.show()
    }
    hide() {
      super.hide()
    }
    destroy() {
      super.destroy()
      evalCss.remove(this._style)
    }
  }

  return new Vue()
}
