// Mobile menu

const menuTrigger = document.querySelector(".menu-trigger");
const menu = document.querySelector(".menu");
const mobileQuery = getComputedStyle(document.body).getPropertyValue(
  "--phoneWidth"
);
const isMobile = () => window.matchMedia(mobileQuery).matches;
const isMobileMenu = () => {
  menuTrigger && menuTrigger.classList.toggle("hidden", !isMobile());
  menu && menu.classList.toggle("hidden", isMobile());
};

isMobileMenu();

menuTrigger &&
  menuTrigger.addEventListener(
    "click",
    () => menu && menu.classList.toggle("hidden")
  );

window.addEventListener("resize", isMobileMenu);

const language = document.getElementsByTagName('html')[0].lang;
const logo = document.querySelector(".logo__pathname");
if(logo){
  window.onload = () => {
    let path = window.location.pathname.substring(1);
    path = path.replace(language+'/','')
    logo.textContent += path.substring(0,path.indexOf('/'));
  };
}

// Header color switching based on background
const header = document.querySelector(".header");
let ticking = false;

function updateHeaderColor() {
  if (!header) return;

  const headerHeight = header.offsetHeight;
  const greenSections = document.querySelectorAll(".hero, .section-green");

  let isOverGreen = false;

  // At scroll position 0 or negative (overscroll), check if hero exists at top
  if (window.scrollY <= 0 && document.querySelector(".hero")) {
    isOverGreen = true;
  } else {
    for (const section of greenSections) {
      const rect = section.getBoundingClientRect();
      const threshold = headerHeight * 0.6;
      if (rect.top < headerHeight + 5 && rect.bottom > threshold) {
        isOverGreen = true;
        break;
      }
    }
  }

  if (isOverGreen) {
    header.classList.remove("header--green");
  } else {
    header.classList.add("header--green");
  }
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateHeaderColor();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("load", updateHeaderColor);
window.addEventListener("resize", updateHeaderColor);
updateHeaderColor();
