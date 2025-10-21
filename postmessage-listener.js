(function () {
  if (window.__postMessageListenerAttached) return
  window.__postMessageListenerAttached = true

  var allowedSenderOrigins = ['https://ai.dnv.com']
  var dataLayerName = 'dataLayer'
  var acceptNullOrigin = false

  function isAllowedOrigin (origin) {
    if (origin === 'null') return !!acceptNullOrigin
    for (var i = 0; i < allowedSenderOrigins.length; i++) {
      if (origin === allowedSenderOrigins[i]) return true
    }
    return false
  }

  function parsePayload (data) {
    if (typeof data === 'string') {
      try { return JSON.parse(data) } catch (_) { return null }
    }
    return data && typeof data === 'object' ? data : null
  }

  function onMessage (e) {
    var origin = e.origin || (e.originalEvent && e.originalEvent.origin) || ''
    if (!isAllowedOrigin(origin)) return

    var payload = parsePayload(e.data)
    if (!payload || payload.event !== 'iframe_event') return

    var dl = (window[dataLayerName] = window[dataLayerName] || [])
    dl.push({
      event: 'iframe_event',
      postMessageData: payload,
      postMessageOrigin: origin,
      pm_timestamp: Date.now()
    })
  }

  if (window.addEventListener) {
    window.addEventListener('message', onMessage, { capture: true, passive: true })
  } else if (window.attachEvent) {
    window.attachEvent('onmessage', onMessage)
  }

  console.log('postmessage-listener ready')
})()
