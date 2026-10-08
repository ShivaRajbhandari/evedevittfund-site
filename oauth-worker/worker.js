// Tiny GitHub login helper for Decap CMS, for Cloudflare Workers (free plan).
// Secrets to set in Cloudflare: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET. Variable: SITE_ORIGIN (e.g. https://www.evedevittfund.org)
const enc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/auth') {
      const state = crypto.randomUUID();
      const gh = new URL('https://github.com/login/oauth/authorize');
      gh.search = new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, scope: 'public_repo', state }).toString();
      return new Response(null, { status: 302, headers: { Location: gh.toString(), 'Set-Cookie': `st=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600` } });
    }
    if (url.pathname === '/callback') {
      const state = url.searchParams.get('state'), code = url.searchParams.get('code');
      const cookie = (req.headers.get('Cookie') || '').match(/(?:^|; )st=([^;]+)/);
      if (!code || !state || !cookie || cookie[1] !== state) return new Response('Login failed. Please close this window and try again.', { status: 400 });
      const r = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
      });
      const data = await r.json();
      const ok = !!data.access_token;
      const msg = ok ? 'authorization:github:success:' + JSON.stringify({ token: data.access_token, provider: 'github' })
                     : 'authorization:github:error:' + JSON.stringify({ message: data.error || 'unknown' });
      const origin = env.SITE_ORIGIN;
      const html = `<!doctype html><meta charset=utf-8><body><script>
(function(){var msg=${JSON.stringify(msg)},origin=${JSON.stringify(origin)};
window.addEventListener('message',function(e){if(e.origin!==origin)return;window.opener.postMessage(msg,origin);window.close()});
window.opener.postMessage('authorizing:github',origin);})();
</script>${enc(ok ? 'Logged in. You can close this window.' : 'Login failed.')}`;
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Set-Cookie': 'st=; Max-Age=0; Path=/' } });
    }
    return new Response('Eve Devitt Fund editor login helper', { status: 200 });
  },
};
