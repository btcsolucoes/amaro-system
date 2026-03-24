(function () {
  const settings = window.AMARO_SETTINGS || {};

  const trimTrailingSlash = (value) => (value || '').replace(/\/+$/, '');
  const joinPath = (base, segment) => `${trimTrailingSlash(base)}${segment.startsWith('/') ? segment : `/${segment}`}`;

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const githubProjectBase = /\.github\.io$/i.test(window.location.hostname) && pathParts.length > 0
    ? `/${pathParts[0]}`
    : '';

  const appBase = trimTrailingSlash(settings.appBase != null ? settings.appBase : githubProjectBase);
  const backendBase = trimTrailingSlash(settings.backendBase || window.location.origin);
  const frontendBaseUrl = trimTrailingSlash(settings.frontendBaseUrl || `${window.location.origin}${appBase}`);

  window.AMARO_CONFIG = {
    appBase,
    backendBase,
    frontendBaseUrl,
    apiBase: joinPath(backendBase, '/api'),
    uploadsBase: joinPath(backendBase, '/uploads'),
    adminUrl: () => joinPath(frontendBaseUrl, '/admin/'),
    clienteUrl: (mesa = 1) => `${joinPath(frontendBaseUrl, '/cliente/')}?mesa=${mesa}`
  };
})();
