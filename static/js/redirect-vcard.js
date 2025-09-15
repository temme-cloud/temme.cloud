document.addEventListener("DOMContentLoaded", function () {
  const shouldRedirectRobin =
    window.location.pathname === "/qr-visitenkarte-v1/" ||
    document.body.dataset.redirect === "vcard";

  if (shouldRedirectRobin) {
    setTimeout(function () {
      window.location.href = "/robin.vcf";
    }, 8000);
  }

  const shouldRedirectKris = window.location.pathname === "/qr-visitenkarte-v2/";

  if (shouldRedirectKris) {
    setTimeout(function () {
      window.location.href = "/kris.vcf";
    }, 8000);
  }
});
