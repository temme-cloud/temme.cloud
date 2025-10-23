(function () {
  if (typeof window === "undefined") {
    return;
  }

  var body = document.body;
  if (!body) {
    return;
  }

  var normalisePath = function (path) {
    if (!path) {
      return "/";
    }
    return path.endsWith("/") ? path : path + "/";
  };

  var currentPath = normalisePath(window.location.pathname);
  var routeRegistry = [
    { pattern: /^\/qr-visitenkarte-v1\/$/, file: "/robin.vcf", delay: 2000 },
    { pattern: /^\/en\/(?:qr-visitenkarte-v1|digital-business-card-robin)\/$/, file: "/robin.vcf", delay: 2000 },
    { pattern: /^\/qr-visitenkarte-v2\/$/, file: "/kris.vcf", delay: 2000 },
    { pattern: /^\/en\/(?:qr-visitenkarte-v2|digital-business-card-kris)\/$/, file: "/kris.vcf", delay: 2000 }
  ];

  var targetFile = body.dataset.downloadFile || "";
  var configuredDelay = Number(body.dataset.downloadDelay);
  var matchedConfig = null;

  if (!targetFile) {
    matchedConfig = routeRegistry.find(function (entry) {
      return entry.pattern.test(currentPath);
    });

    if (matchedConfig) {
      targetFile = matchedConfig.file;
      if (isNaN(configuredDelay)) {
        configuredDelay = matchedConfig.delay;
      }
    }
  }

  if (!targetFile) {
    var params = new URLSearchParams(window.location.search || "");
    var queryFile = params.get("download");
    if (queryFile) {
      targetFile = queryFile;
    }
  }

  if (!targetFile) {
    return;
  }

  var delay = !isNaN(configuredDelay) ? configuredDelay : 2000;

  window.setTimeout(function () {
    window.location.assign(targetFile);
  }, delay);
})();
