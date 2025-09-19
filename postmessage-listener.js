// postmessage-listener.js
;(function () {
  if (window.__postMessageListenerAttached) return
  window.__postMessageListenerAttached = true

  var allowedSenderOrigins = ['https://ai.dnv.com']   // the iframe origin
  var dataLayerName = 'dataLayer'

  function parseMaybeJson (v) {
    if (typeof v !== 'string') return v
    try { return JSON.parse(v) } catch (_) { return null }
  }

  function allowedOrigin (origin) {
    for (var i = 0; i < allowedSenderOrigins.length; i++) {
      if (origin === allowedSenderOrigins[i]) return true
    }
    return false
  }

  function onMessage (e) {
    if (!allowedOrigin(e.origin)) return

    var payload = parseMaybeJson(e.data)
    if (!payload || typeof payload !== 'object') return

    // only accept your sender format
    if (payload.event !== 'iframe_event') return

    var dl = window[dataLayerName] = window[dataLayerName] || []
    dl.push({
      event: 'iframe_event',
      postMessageData: payload,         // contains event_name, click_url, page_location, etc
      postMessageOrigin: e.origin
    })
  }

  if (window.addEventListener) window.addEventListener('message', onMessage)
  else if (window.attachEvent) window.attachEvent('onmessage', onMessage)

  console.log('postmessage-listener loaded')
})()
