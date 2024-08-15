import { installHook } from '@back/hook'
import { initBackend } from '@back'
import { Bridge } from '@utils/bridge'
import { SharedData } from '@utils/shared-data'
import createUrl from 'licia/createUrl'
import devtools from 'raw-loader!./devtools.txt'

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
  SharedData.theme = value
}
