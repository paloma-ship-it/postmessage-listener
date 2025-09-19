// postmessage-listener.js
;(function () {
  if (window.__postMessageListenerAttached) return
  window.__postMessageListenerAttached = true

  var allowedSenderOrigins = ['https://ai.dnv.com']   // only accept messages from the iframe
  var defaultDataLayerName = 'dataLayer'
  var debug = false

  function log () { if (debug && window.console) console.log.apply(console, arguments) }

  function safeParseMaybeJson (value) {
    if (typeof value !== 'string') return value
    try { return JSON.parse(value) } catch (_) { return null }
  }

  function isAllowedOrigin (origin) {
    for (var i = 0; i < allowedSenderOrigins.length; i++) {
      if (origin === allowedSenderOrigins[i]) return true
    }
    return false
  }

  function pushToDL (dlName, obj) {
    if (!obj || typeof obj !== 'object') return
    var dl = window[dlName] = window[dlName] || []
    dl.push(obj)
    log('pushed to', dlName, obj)
  }

  function onMessage (e) {
    // only accept from the iframe
    if (!isAllowedOrigin(e.origin)) { log('blocked origin', e.origin); return }

    var payload = safeParseMaybeJson(e.data)
    if (!payload || typeof payload !== 'object') { log('bad payload', e.data); return }

    // Protocol 2: NEW_PUSH wrapper from iframe
    if (payload.type === 'NEW_PUSH' && payload.data) {
      var dlName = payload.dataLayerName || defaultDataLayerName
      pushToDL(dlName, payload.data)    // expects payload.data.event to exist
      return
    }

    // Protocol 1: simple event payload
    if (payload.event) {
      pushToDL(defaultDataLayerName, {
        event: payload.event,
        postMessageData: payload,
        postMessageOrigin: e.origin
      })
      return
    }

    log('no recognised fields in payload', payload)
  }

  if (window.addEventListener) window.addEventListener('message', onMessage)
  else if (window.attachEvent) window.attachEvent('onmessage', onMessage)

  console.log('postmessage-listener loaded')
})()
