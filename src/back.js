import { installHook } from '@back/hook'
import { initBackend } from '@back'
import { Bridge } from '@utils/bridge'
import createUrl from 'licia/createUrl'
import devtools from 'raw-loader!./devtools.js'

installHook(window)

export function initDevtools(iframe) {
  const bridge = new Bridge({
    listen(fn) {
      window.addEventListener('message', (evt) => fn(evt.data))
    },
    send(data) {
      iframe.contentWindow.postMessage(data, '*')
    },
  })
  initBackend(bridge)

  const devtoolsUrl = createUrl(
    `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      </head>
      <body>
        <div id="app"></div>
        <script>${devtools}</script>
      </body>
    </html>`,
    {
      type: 'text/html',
    }
  )

  iframe.__vdevtools__injected = true
  iframe.src = devtoolsUrl
}
