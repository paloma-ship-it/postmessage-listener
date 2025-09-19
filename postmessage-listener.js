// postmessage-listener.js

;(function () {
  // Only accept messages sent from the iframe origin
  var allowedSenderOrigins = ['https://ai.dnv.com']

  function isAllowedSenderOrigin (origin) {
    for (var i = 0; i < allowedSenderOrigins.length; i++) {
      if (origin === allowedSenderOrigins[i]) return true
    }
    return false
  }

  function safeParseMaybeJson (value) {
    if (typeof value !== 'string') return value
    try { return JSON.parse(value) } catch (_) { return null }
  }

  function onMessage (e) {
    if (!isAllowedSenderOrigin(e.origin)) return

    var data = safeParseMaybeJson(e.data)
    if (!data || typeof data !== 'object') return
    if (!data.event) return

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: data.event,
      postMessageData: data,
      postMessageOrigin: e.origin
    })
  }

  if (window.addEventListener) window.addEventListener('message', onMessage)
  else if (window.attachEvent) window.attachEvent('onmessage', onMessage)
})()
