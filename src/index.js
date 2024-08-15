const { initDevtools, setTheme } = require('./back')

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
      $el.html('<iframe class="eruda-vue-devtools"></iframe>')
      const iframe = $el.find('.eruda-vue-devtools').get(0)

      initDevtools(iframe)

      setTheme(this._getTheme())
      eruda.get().config.on('change', this._onThemeChange)
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
    _getTheme() {
      return eruda.util.isDarkTheme() ? 'dark' : 'light'
    }
    _onThemeChange = (name) => {
      if (name === 'theme') {
        setTheme(this._getTheme())
      }
    }
  }

  return new Vue()
}
