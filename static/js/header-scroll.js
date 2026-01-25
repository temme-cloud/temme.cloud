// Header color change on scroll using Intersection Observer
(function() {
  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero');

  if (!header || !hero) return;

  // Create observer for hero section
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Hero is visible - white header
          header.classList.remove('header--green');
        } else {
          // Hero is not visible (scrolled past) - green header
          header.classList.add('header--green');
        }
      });
    },
    {
      // Trigger when hero bottom edge crosses viewport top
      rootMargin: '-80px 0px 0px 0px',
      threshold: 0
    }
  );

  observer.observe(hero);
})();
