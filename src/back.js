import { installHook as _installHook } from '@back/hook'
import { Bridge } from '@utils/bridge'
import { SharedData } from '@utils/shared-data'
import createUrl from 'licia/createUrl'
import devtools from 'raw-loader!./devtools.txt'

let theme = 'auto'
let shareDataLoaded = false

export function installHook() {
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    return
  }
  _installHook(window)
}

export function initDevtools(iframe) {
  const bridge = new Bridge({
    listen(fn) {
      window.addEventListener('message', (evt) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('devtools -> backend', evt.data)
        }
        fn(evt.data)
      })
    },
    send(data) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('backend -> devtools', data)
      }
      iframe.contentWindow.postMessage(data, '*')
    },
  })
  bridge.on('shared-data:load-complete', () => {
    shareDataLoaded = true
    setTheme(theme)
  })
  import('@back').then(({ initBackend }) => {
    initBackend(bridge)
  })

  const devtoolsSrc = createUrl(devtools, { type: 'application/javascript' })

  const devtoolsUrl = createUrl(
    `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      </head>
      <body>
        <div id="app"></div>
        <script src="${devtoolsSrc}"></script>
      </body>
    </html>`,
    {
      type: 'text/html',
    }
  )

  iframe.__vdevtools__injected = true
  iframe.src = devtoolsUrl
}

export function setTheme(value) {
  theme = value
  if (shareDataLoaded) {
    SharedData.theme = value
  }
}

// Modified from vue-devtools
export function forceEnable() {
  if (!window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    return
  }

  let delay = 1000
  let detectRemainingTries = 10

  function runDetect() {
    // Method 1: Check Nuxt.js
    const nuxtDetected = !!(window.__NUXT__ || window.$nuxt)

    if (nuxtDetected) {
      let Vue

      if (window.$nuxt) {
        Vue = window.$nuxt.$root && window.$nuxt.$root.constructor
      }

      crack({
        devtoolsEnabled:
          (Vue && Vue.config.devtools) ||
          (window.__VUE_DEVTOOLS_GLOBAL_HOOK__ &&
            window.__VUE_DEVTOOLS_GLOBAL_HOOK__.enabled),
        vueDetected: true,
        nuxtDetected: true,
      })

      return
    }

    // Method 2: Check  Vue 3
    const vueDetected = !!window.__VUE__
    if (vueDetected) {
      crack({
        devtoolsEnabled:
          window.__VUE_DEVTOOLS_GLOBAL_HOOK__ &&
          window.__VUE_DEVTOOLS_GLOBAL_HOOK__.enabled,
        vueDetected: true,
      })

      return
    }

    // Method 3: Scan all elements inside document
    const all = document.querySelectorAll('*')
    let el
    for (let i = 0; i < all.length; i++) {
      if (all[i].__vue__) {
        el = all[i]
        break
      }
    }
    if (el) {
      let Vue = Object.getPrototypeOf(el.__vue__).constructor
      while (Vue.super) {
        Vue = Vue.super
      }
      crack({
        devtoolsEnabled: Vue.config.devtools,
        vueDetected: true,
      })
      return
    }

    if (detectRemainingTries > 0) {
      detectRemainingTries--
      setTimeout(() => {
        runDetect()
      }, delay)
      delay *= 5
    }
  }

  setTimeout(() => {
    runDetect()
  }, 100)
}

// https://github.com/hzmming/vue-force-dev
function crack(data) {
  if (data.devtoolsEnabled) {
    return
  }

  // Nuxt.js
  if (data.nuxtDetected) {
    let Vue

    if (window.$nuxt) {
      Vue = window.$nuxt.$root && window.$nuxt.$root.constructor
    }

    // Vue 2
    if (Vue) {
      crackVue2(Vue)
    } else {
      // Vue 3.2.14+
      crackVue3()
    }
  }
  // Vue 3
  else if (window.__VUE__) {
    crackVue3()
  }
  // Vue 2
  else {
    crackVue2()
  }
}

function crackVue2(Vue) {
  if (!Vue) {
    const app = getVueRootInstance(2)
    if (!app) return false // Vue may not be finished yet
    Vue = Object.getPrototypeOf(app).constructor
    while (Vue.super) {
      Vue = Vue.super
    }
  }

  const devtools = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
  Vue.config.devtools = true
  devtools.emit('init', Vue)
}

function crackVue3() {
  const app = getVueRootInstance(3)
  if (!app) return false // Vue may not be finished yet
  const devtools = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
  devtools.enabled = true
  const version = app.version
  devtools.emit('app:init' /* APP_INIT */, app, version, {
    Fragment: Symbol.for('v-fgt'),
    Text: Symbol.for('v-txt'),
    Comment: Symbol.for('v-cmt'),
    Static: Symbol.for('v-stc'),
  })
}

function getVueRootInstance(version) {
  const signProperty = version === 2 ? '__vue__' : '__vue_app__'
  const all = document.querySelectorAll('*')
  for (let i = 0; i < all.length; i++) {
    if (all[i][signProperty]) {
      return all[i][signProperty]
    }
  }
}
