document.addEventListener("DOMContentLoaded", function () {
  const userLang = navigator.language || navigator.userLanguage;
  const langPrefix = userLang.split("-")[0]; // z. B. "en" aus "en-US"

  const vcardLangMap = {
    de: "/qr-visitenkarte-v1/",
    en: "/en/qr-businesscard-v1/",
    pl: "/pl/qr-wizytowka-v1/",
    it: "/it/qr-biglietto-v1/",
    uk: "/uk/qr-vizytivka-v1/",
  };

  const currentPath = window.location.pathname.endsWith("/") ? window.location.pathname : window.location.pathname + "/";

  const isNeutralPath = currentPath === "/qr-visitenkarte-v1/";

  if (isNeutralPath && vcardLangMap[langPrefix] && currentPath !== vcardLangMap[langPrefix]) {
    window.location.replace(vcardLangMap[langPrefix]);
  }
});
