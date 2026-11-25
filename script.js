/**
 * FINOWINGS — Interactive Client Script
 * Handles: Sticky Header, Mobile Drawer, Hero Carousel, Counter Animations,
 * Form Validation, and Smooth Navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------
  // 1. Header Scroll & Back-to-Top Toggle
  // ----------------------------------------------------
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('backToTop');

  function handleWindowScroll() {
    const scrollY = window.scrollY;

    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleWindowScroll, { passive: true });
  handleWindowScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ----------------------------------------------------
  // 2. Mobile Drawer Navigation
  // ----------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('active');
      const spans = hamburgerBtn.querySelectorAll('span');

      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    // Toggle mobile dropdown accordions
    mobileNav.querySelectorAll('.mobile-accordion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const accordion = btn.closest('.mobile-accordion');
        const isOpen = accordion.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });

    // Close mobile drawer upon clicking any link
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        const spans = hamburgerBtn.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      });
    });
  }

  // ----------------------------------------------------
  // 3. Shared Carousel Engine (Hero & Social Media Sliders)
  // ----------------------------------------------------
  /**
   * Initializes an interactive slider with controls, indicator buttons, autoplay, and swipe support.
   */
  function initCarousel({ track, prevBtn, nextBtn, indicators, intervalMs = 5500 }) {
    const totalSlides = indicators ? indicators.length : (track ? track.children.length : 0);
    if (!track || totalSlides === 0) return;

    let currentSlide = 0;
    let autoplayTimer = null;

    function setSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;

      currentSlide = index;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      if (indicators) {
        indicators.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentSlide);
        });
      }
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        setSlide(currentSlide + 1);
      }, intervalMs);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        setSlide(currentSlide - 1);
        startAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        setSlide(currentSlide + 1);
        startAutoplay();
      });
    }

    if (indicators) {
      indicators.forEach(dot => {
        dot.addEventListener('click', () => {
          const targetIdx = parseInt(dot.getAttribute('data-index'), 10);
          setSlide(targetIdx);
          startAutoplay();
        });
      });
    }

    track.parentElement.addEventListener('mouseenter', stopAutoplay);
    track.parentElement.addEventListener('mouseleave', startAutoplay);

    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const swipeDistance = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(swipeDistance) > 40) {
        setSlide(swipeDistance > 0 ? currentSlide + 1 : currentSlide - 1);
        startAutoplay();
      }
    }, { passive: true });

    startAutoplay();
  }

  initCarousel({
    track: document.getElementById('heroTrack'),
    prevBtn: document.getElementById('heroPrev'),
    nextBtn: document.getElementById('heroNext'),
    indicators: document.querySelectorAll('.hero-indicator-dot'),
    intervalMs: 5500
  });

  initCarousel({
    track: document.getElementById('socialTrack'),
    prevBtn: document.getElementById('socialPrev'),
    nextBtn: document.getElementById('socialNext'),
    indicators: document.querySelectorAll('.social-tab-pill'),
    intervalMs: 5000
  });

  // ----------------------------------------------------
  // 4. Smooth Animated Counters (Stats Ribbon)
  // ----------------------------------------------------
  const statElements = document.querySelectorAll('.stat-digit');
  let hasCountersAnimated = false;

  function runCountersAnimation() {
    statElements.forEach(el => {
      const countTarget = el.getAttribute('data-count');
      const suffix = el.getAttribute('data-suffix') || '';
      if (!countTarget) return;

      const numericTarget = parseFloat(countTarget);
      const isDecimal = countTarget.includes('.');
      const steps = 45;
      const duration = 1800;
      const stepDuration = duration / steps;
      let currentStep = 0;

      const counterInterval = setInterval(() => {
        currentStep++;
        // Ease out cubic progress
        const progress = 1 - Math.pow(1 - (currentStep / steps), 3);
        const intermediateVal = numericTarget * progress;

        el.innerHTML = (isDecimal ? intermediateVal.toFixed(1) : Math.round(intermediateVal)) + `<span>${suffix}</span>`;

        if (currentStep >= steps) {
          clearInterval(counterInterval);
          el.innerHTML = countTarget + `<span>${suffix}</span>`;
        }
      }, stepDuration);
    });
  }

  const statsRibbon = document.querySelector('.stats-ribbon-wrapper');
  if (statsRibbon && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasCountersAnimated) {
          hasCountersAnimated = true;
          runCountersAnimation();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    statsObserver.observe(statsRibbon);
  } else {
    runCountersAnimation();
  }

  // ----------------------------------------------------
  // 5. Contact Form Submission Feedback
  // ----------------------------------------------------
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<span>Sending Message...</span>';
      submitBtn.disabled = true;

      setTimeout(() => {
        alert('Thank you for contacting Finowings! Our Lucknow counseling team will call you back within 2 business hours.');
        inquiryForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 900);
    });
  }

  // ----------------------------------------------------
  // 6. Smooth Internal Link Scrolling with Navbar Offset
  // ----------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetHash = this.getAttribute('href');
      if (!targetHash || targetHash === '#') return;

      const targetEl = document.querySelector(targetHash);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ----------------------------------------------------
  // 7. Interactive Eligibility Audience Pills
  // ----------------------------------------------------
  const eligibilityPills = document.querySelectorAll('.eligibility-pill');
  if (eligibilityPills.length > 0) {
    eligibilityPills.forEach(pill => {
      pill.addEventListener('click', () => {
        eligibilityPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });
  }
});

// Disable right click
document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
});

// Disable common keyboard shortcuts
document.addEventListener("keydown", function(e) {

    if (
        e.key === "F12" ||
        (e.ctrlKey && e.key.toLowerCase() === "u") ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
    ) {
        e.preventDefault();
    }

});