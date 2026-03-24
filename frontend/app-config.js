(function () {
  const settings = window.AMARO_SETTINGS || {};
  const url = new URL(window.location.href);

  const trimTrailingSlash = (value) => (value || '').replace(/\/+$/, '');
  const joinPath = (base, segment) => `${trimTrailingSlash(base)}${segment.startsWith('/') ? segment : `/${segment}`}`;
  const appendApiOverride = (target, apiOverride) => {
    if (!apiOverride) return target;
    const nextUrl = new URL(target, window.location.origin);
    nextUrl.searchParams.set('api', apiOverride);
    return nextUrl.toString();
  };

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const githubProjectBase = /\.github\.io$/i.test(window.location.hostname) && pathParts.length > 0
    ? `/${pathParts[0]}`
    : '';

  const apiOverrideFromQuery = trimTrailingSlash(url.searchParams.get('api'));
  const apiOverrideFromStorage = trimTrailingSlash(window.localStorage.getItem('AMARO_BACKEND_BASE'));
  const apiOverride = apiOverrideFromQuery || apiOverrideFromStorage;
  if (apiOverrideFromQuery) {
    window.localStorage.setItem('AMARO_BACKEND_BASE', apiOverrideFromQuery);
  }

  const appBase = trimTrailingSlash(settings.appBase != null ? settings.appBase : githubProjectBase);
  const backendBase = trimTrailingSlash(apiOverride || settings.backendBase || window.location.origin);
  const frontendBaseUrl = trimTrailingSlash(settings.frontendBaseUrl || `${window.location.origin}${appBase}`);

  window.AMARO_CONFIG = {
    appBase,
    backendBase,
    frontendBaseUrl,
    apiBase: joinPath(backendBase, '/api'),
    uploadsBase: joinPath(backendBase, '/uploads'),
    adminUrl: () => appendApiOverride(joinPath(frontendBaseUrl, '/admin/'), apiOverride),
    clienteUrl: (mesa = 1) => {
      const clienteUrl = new URL(joinPath(frontendBaseUrl, '/cliente/'), window.location.origin);
      clienteUrl.searchParams.set('mesa', mesa);
      if (apiOverride) clienteUrl.searchParams.set('api', apiOverride);
      return clienteUrl.toString();
    }
  };
})();
