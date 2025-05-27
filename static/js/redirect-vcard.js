document.addEventListener("DOMContentLoaded", function () {
  const shouldRedirect =
    window.location.pathname === "/qr-visitenkarte-v1/" ||
    document.body.dataset.redirect === "vcard";

  if (shouldRedirect) {
    setTimeout(function () {
      window.location.href = "/robin.vcf";
    }, 5000);
  }
});
