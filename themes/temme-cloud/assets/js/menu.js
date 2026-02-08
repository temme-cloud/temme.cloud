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
    () => {
      if (menu) {
        menu.classList.toggle("hidden");
        menuTrigger.setAttribute("aria-expanded", !menu.classList.contains("hidden"));
      }
    }
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
let greenSections = [];
let headerHeight = 0;
let lastIsOverGreen = null;

function cacheElements() {
  greenSections = [...document.querySelectorAll(".hero, .section-green")];
  headerHeight = header?.offsetHeight || 0;
}

function updateHeaderColor() {
  if (!header) return;

  let isOverGreen = false;

  // At scroll position 0 or negative (overscroll), check if hero exists at top
  if (window.scrollY <= 0 && greenSections.some(s => s.classList.contains("hero"))) {
    isOverGreen = true;
  } else {
    const threshold = headerHeight * 0.6;
    for (const section of greenSections) {
      const rect = section.getBoundingClientRect();
      if (rect.top < headerHeight + 5 && rect.bottom > threshold) {
        isOverGreen = true;
        break;
      }
    }
  }

  // Only toggle if state actually changed
  if (isOverGreen !== lastIsOverGreen) {
    if (isOverGreen) {
      header.classList.remove("header--green");
    } else {
      header.classList.add("header--green");
    }
    lastIsOverGreen = isOverGreen;
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

// Initialize
cacheElements();
updateHeaderColor();

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("load", () => {
  cacheElements();
  updateHeaderColor();
});
window.addEventListener("resize", () => {
  cacheElements();
  updateHeaderColor();
});
