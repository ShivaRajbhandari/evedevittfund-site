// Live preview for the editor: draws the same markup as build.py, with the site's own CSS.
// Keep this in step with build.py if the page layout changes.
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); };
  var inline = function (s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); };
  var DEFAULTS = {ink: '#0A1240', blue: '#2445F0', sky: '#5BCEFA', pink: '#F7A8C1', yellow: '#FFCF3F', cream: '#FFF9EA'};
  var themeStyle = function (t) {
    t = t || {}; var out = '';
    Object.keys(DEFAULTS).forEach(function (k) { var v = /^#[0-9a-fA-F]{3,8}$/.test(t[k] || '') ? t[k] : DEFAULTS[k]; out += '--' + k + ':' + v + ';'; });
    return out;
  };
  var pos = function (x) { return (x.photo_position === 'top' || x.photo_position === 'bottom') ? ' style="object-position:center ' + x.photo_position + '"' : ''; };
  var wrap = function (html, theme, extra) {
    // Colors travel inside the preview markup as a <style> tag (the site paints its blue on <body>, so :root is used).
    var css = '<style>:root{' + themeStyle(theme) + '}' + (extra || '') + '</style>';
    return h('div', {className: 'edit-preview', dangerouslySetInnerHTML: {__html: css + html}});
  };
  var photo = function (props, path) { try { return path ? String(props.getAsset(path)) : ''; } catch (e) { return path || ''; } };
  var data = function (props) { var d = props.entry.get('data'); return d && d.toJS ? d.toJS() : {}; };

  var Scholar = function (props) {
    var s = data(props);
    var html = '<section class="scholars"><div class="in"><h3 class="yr">' + esc(s.year) + '</h3><div class="sgrid"><article><div class="who"><img' + pos(s) + ' src="' + esc(photo(props, s.photo)) + '" alt="" width="64" height="64"><h4>' + esc(s.name) + '</h4></div><p>' + esc(s.bio) + '</p></article></div></div></section>';
    return wrap(html, null, 'body{background:#f4f4f4}');
  };
  var Board = function (props) {
    var b = data(props);
    var html = '<section class="about"><div class="in"><div></div><ul class="board"><li><div class="av"><img' + pos(b) + ' src="' + esc(photo(props, b.photo)) + '" alt="" width="72" height="72"></div><div><strong>' + esc(b.name) + '</strong><small>' + esc(b.role) + '</small><span class="b">' + esc(b.bio) + '</span></div></li></ul></div></section>';
    return wrap(html, null, 'body{background:#f4f4f4}');
  };
  var Settings = function (props) {
    var c = data(props), H = c.hero || {}, Hp = c.help || {}, Hw = c.how || {}, G = c.gift || {}, Sc = c.scholars || {}, A = c.about || {}, D = c.donate || {}, C = c.crisis || {}, F = c.footer || {};
    var cards = (Hp.cards || []).map(function (k) { return '<article class="card"><p class="tag">' + esc(k.tag) + '</p><h3>' + esc(k.title) + '</h3><p>' + inline(k.body) + '</p>' + (k.url ? '<a class="btn" href="#">' + esc(k.button) + '</a>' : '') + '</article>'; }).join('');
    var steps = ((Hw.steps) || []).map(function (s) { return '<li><h3>' + esc(s.title) + '</h3><p>' + esc(s.body) + '</p></li>'; }).join('');
    var amts = ((G.items) || []).map(function (i) { return '<div class="amt"><strong>' + esc(i.amount) + '</strong><span>' + esc(i.text) + '</span></div>'; }).join('');
    var story = '';
    if (A.story_body) {
      story = '<h3 class="story">' + esc(A.story_title) + '</h3>' + A.story_body.split(/\n\n/).filter(function (x) { return x.trim(); }).map(function (x) { return '<p>' + esc(x.trim()) + '</p>'; }).join('') + (A.story_link_url ? '<p><a class="storylink" href="#">' + esc(A.story_link_text) + ' &rarr;</a></p>' : '');
    }
    var html =
      '<section class="hero"><div class="in"><div><p class="eyebrow">' + inline(H.eyebrow) + '</p><h1><span class="big">' + esc(H.big) + '</span> ' + esc(H.rest) + '</h1><p class="lede">' + esc(H.lede) + '</p><div class="cta"><a class="btn y" href="#">Mutual aid</a><a class="btn" href="#">Give</a></div></div></div></section>' +
      '<section class="help"><div class="in"><p class="eyebrow">' + esc(Hp.eyebrow) + '</p><h2>' + esc(Hp.title) + '</h2><p style="max-width:40em;font-weight:600">' + esc(Hp.intro) + '</p><div class="cards">' + cards + '</div></div></section>' +
      '<section class="how"><div class="in"><p class="eyebrow">' + esc(Hw.eyebrow) + '</p><h2>' + esc(Hw.title) + '</h2><ol class="steps">' + steps + '</ol><p class="safe">' + inline(Hw.privacy) + '</p></div></section>' +
      '<section class="gift"><div class="in"><p class="eyebrow" style="color:var(--ink)">' + esc(G.eyebrow) + '</p><h2>' + esc(G.title) + '</h2><div class="amts">' + amts + '</div></div></section>' +
      '<section class="scholars"><div class="in"><p class="eyebrow">Scholarship</p><h2>' + esc(Sc.title) + '</h2><p style="max-width:40em;font-weight:600">' + esc(Sc.intro) + '</p><p style="opacity:.6">(Scholar cards: edit them under Scholars.)</p></div></section>' +
      '<section class="about"><div class="in"><div><p class="eyebrow">' + esc(A.eyebrow) + '</p><h2>' + esc(A.title) + '</h2><p>' + esc(A.body) + '</p><p style="font-weight:700">' + esc(A.pledge) + '</p>' + story + '</div><div><p style="opacity:.7">(Board members: edit them under Board.)</p></div></div></section>' +
      '<section class="donate"><div class="in"><p class="eyebrow" style="color:var(--ink)">' + esc(D.eyebrow) + '</p><h2>' + esc(D.title) + '</h2><p style="font-weight:600;max-width:36em">' + esc(D.intro) + '</p><div style="margin-top:24px;max-width:480px;min-height:160px;background:#00115e;color:#fff;border-radius:16px;display:grid;place-items:center;text-align:center;padding:20px;font-weight:700">The Zeffy donation form appears here on the real site</div><a class="btn y" href="#" style="font-size:18px;padding:14px 26px;margin-top:18px">' + esc(D.fallback_button) + '</a><p class="fine" style="margin-top:18px">' + esc(D.fine) + '</p></div></section>' +
      '<section class="crisis"><div class="in"><h2>' + esc(C.title) + '</h2><ul>' + (C.lines || []).map(function (l) { return '<li>' + inline(l) + '</li>'; }).join('') + '</ul></div></section>' +
      '<footer class="foot"><div class="in"><div><h3>' + esc(F.org) + '</h3><p>' + esc(F.address1) + '</p><p>' + esc(F.address2) + '</p></div><div><h3>Contact</h3><p>' + esc(F.email) + '</p><p>' + esc(F.phone) + '</p><p>Instagram @evedevittfund</p></div><div><h3>Get involved</h3><p>Mutual aid</p><p>Give</p></div><p class="legal">' + esc(F.legal) + '</p>' + (F.copyright ? '<p class="copyright">' + esc(F.copyright).replace(/\{year\}/g, new Date().getFullYear()) + '</p>' : '') + '</div></footer>';
    return wrap(html, c.theme);
  };
  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Bowlby+One&family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600;700&display=swap');
  CMS.registerPreviewStyle('/admin/preview.css');
  CMS.registerPreviewTemplate('scholars', Scholar);
  CMS.registerPreviewTemplate('board', Board);
  CMS.registerPreviewTemplate('settings', Settings);
})();
