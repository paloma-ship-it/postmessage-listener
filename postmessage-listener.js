// postmessage-listener.js

;(function () {
  // --- config ---
  var allowedSenderOrigins = ['https://ai.dnv.com'];   // iframe origin(s)
  var dataLayerName = 'dataLayer';                     // change if you use a custom dataLayer
  var allowedEvents = null;                            // e.g. ['iframe_event', 'chatbot_link_click']; keep null to allow all
  var acceptNullOrigin = false;                        // set true only if your iframe is sandboxed and you add another trust check
  var debug = false;                                   // set true to log every step

  // simple de-dup window
  var seen = {};
  var SEEN_TTL_MS = 30000; // forget keys after 30s

  function log () { if (debug && window.console) console.log.apply(console, arguments); }

  function isAllowedSenderOrigin (origin) {
    if (origin === 'null') return !!acceptNullOrigin;
    for (var i = 0; i < allowedSenderOrigins.length; i++) {
      if (origin === allowedSenderOrigins[i]) return true;
    }
    return false;
  }

  function safeParseMaybeJson (value) {
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch (_) { return null; }
  }

  function isAllowedEvent (evt) {
    if (!evt) return false;
    if (!allowedEvents) return true;
    for (var i = 0; i < allowedEvents.length; i++) {
      if (evt === allowedEvents[i]) return true;
    }
    return false;
  }

  function makeKey (origin, data) {
    try { return origin + '|' + JSON.stringify(data); } catch (_) { return origin + '|[unserializable]'; }
  }

  function pruneSeen () {
    var now = Date.now();
    for (var k in seen) {
      if (Object.prototype.hasOwnProperty.call(seen, k)) {
        if (now - seen[k] > SEEN_TTL_MS) delete seen[k];
      }
    }
  }

  function onMessage (e) {
    pruneSeen();

    if (!isAllowedSenderOrigin(e.origin)) { log('blocked origin', e.origin); return; }

    var data = safeParseMaybeJson(e.data);
    if (!data || typeof data !== 'object') { log('bad data', e.data); return; }
    if (!data.event) { log('no event field', data); return; }
    if (!isAllowedEvent(data.event)) { log('event not allowed', data.event); return; }

    var key = makeKey(e.origin, data);
    if (seen[key]) { log('duplicate message ignored', key); return; }
    seen[key] = Date.now();

    var dl = window[dataLayerName] = window[dataLayerName] || [];
    dl.push({
      event: data.event,
      postMessageData: data,
      postMessageOrigin: e.origin
    });

    log('pushed to', dataLayerName, data.event, data);
  }

  if (window.addEventListener) window.addEventListener('message', onMessage);
  else if (window.attachEvent) window.attachEvent('onmessage', onMessage);

  console.log('postmessage-listener loaded'); // quick sanity check
})();
