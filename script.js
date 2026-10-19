/**
 * AURELIA VANCE — INTERIOR ARCHITECTURE & DESIGN
 * Senior Front-End Interactive Controller
 * Features:
 * - 3-Second Crossfade Background Slider with synchronized progress bar & counters
 * - Sticky Blur Header & ScrollSpy
 * - Mobile Slide-out Drawer
 * - Filterable Project Gallery
 * - Project Lightbox Modal with Keyboard Navigation
 * - Fluid Custom Cursor Interaction
 * - Form submission state handling
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initializations
  initHeroSlider();
  initHeaderAndNavigation();
  initGalleryFiltering();
  initProjectLightbox();
  initCustomCursor();
  initFooterYear();
});

/* ==========================================================================
   1. HERO ROTATING BACKGROUND SLIDER (EXACTLY 3-SECOND CYCLE)
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slider .slide');
  const dots = document.querySelectorAll('.slide-dots .dot');
  const currentNumEl = document.getElementById('currentSlideNum');
  const progressBar = document.getElementById('slideProgressBar');
  const heroSection = document.getElementById('hero');

  if (!slides.length) return;

  const SLIDE_DURATION = 3000; // 3 seconds per background change
  let currentIndex = 0;
  let slideTimer = null;
  let progressAnimation = null;
  let isPaused = false;

  function renderSlide(index) {
    // Update slides classes
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Update counter text (e.g. 01, 02)
    if (currentNumEl) {
      currentNumEl.textContent = String(index + 1).padStart(2, '0');
    }

    currentIndex = index;
    restartProgressBar();
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % slides.length;
    renderSlide(nextIndex);
  }

  function startAutoplay() {
    stopAutoplay();
    slideTimer = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, SLIDE_DURATION);
  }

  function stopAutoplay() {
    if (slideTimer) {
      clearInterval(slideTimer);
      slideTimer = null;
    }
  }

  function restartProgressBar() {
    if (!progressBar) return;
    
    // Reset and trigger smooth fill animation over 3 seconds
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';

    // Force reflow
    void progressBar.offsetWidth;

    progressBar.style.transition = `width ${SLIDE_DURATION}ms linear`;
    progressBar.style.width = '100%';
  }

  // Manual dot clicking
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.target.dataset.slide, 10);
      if (!isNaN(targetIndex) && targetIndex !== currentIndex) {
        renderSlide(targetIndex);
        startAutoplay();
      }
    });
  });

  // Pause on hover for readability when client hovers over CTA or text
  if (heroSection) {
    heroSection.addEventListener('mouseenter', () => {
      isPaused = true;
      if (progressBar) progressBar.style.animationPlayState = 'paused';
    });

    heroSection.addEventListener('mouseleave', () => {
      isPaused = false;
      if (progressBar) progressBar.style.animationPlayState = 'running';
    });
  }

  // Launch on start
  renderSlide(0);
  startAutoplay();
}

/* ==========================================================================
   2. HEADER, SCROLLSPY & MOBILE NAVIGATION
   ========================================================================== */
function initHeaderAndNavigation() {
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Header scroll appearance
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // ScrollSpy: highlight active menu item
    let currentSectionId = '';
    const scrollPos = window.pageYOffset + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // Mobile menu drawer toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ==========================================================================
   3. GALLERY CATEGORY FILTERING
   ========================================================================== */
function initGalleryFiltering() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.gallery-card');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle button states
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.dataset.filter;

      cards.forEach(card => {
        const category = card.dataset.category;
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hide');
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease';
            card.style.opacity = '1';
          }, 30);
        } else {
          card.classList.add('hide');
        }
      });
    });
  });
}

/* ==========================================================================
   4. INTERACTIVE LIGHTBOX PREVIEW MODAL
   ========================================================================== */
function initProjectLightbox() {
  const cards = document.querySelectorAll('.gallery-card');
  const modal = document.getElementById('galleryModal');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const modalLocation = document.getElementById('modalLocation');
  const modalYear = document.getElementById('modalYear');
  const modalDesc = document.getElementById('modalDesc');
  const modalClose = document.getElementById('modalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalInquireBtn = document.getElementById('modalInquireBtn');

  if (!modal) return;

  function openModal(card) {
    const title = card.dataset.title;
    const category = card.dataset.category;
    const location = card.dataset.location;
    const year = card.dataset.year;
    const imgSrc = card.dataset.img || card.querySelector('img').src;
    const snippet = card.querySelector('.card-snippet') ? card.querySelector('.card-snippet').textContent : '';

    modalImg.src = imgSrc;
    modalImg.alt = title;
    modalTitle.textContent = title;
    modalCategory.textContent = category.toUpperCase();
    modalLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${location}`;
    modalYear.innerHTML = `<i class="fa-regular fa-calendar"></i> ${year}`;
    modalDesc.textContent = snippet + ' This spatial study integrates custom lighting, tactile wall finishes, acoustic absorption, and structural balance tailored specifically to the client’s lifestyle.';

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  if (modalInquireBtn) modalInquireBtn.addEventListener('click', closeModal);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   5. BESPOKE CURSOR TRACKING (Editorial Micro-Interaction)
   ========================================================================== */
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const outline = document.getElementById('cursorOutline');

  if (!dot || !outline) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Direct dot sync
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }, { passive: true });

  // Smooth lagging outline
  function renderCursor() {
    outlineX += (mouseX - outlineX) * 0.18;
    outlineY += (mouseY - outlineY) * 0.18;
    outline.style.left = `${outlineX}px`;
    outline.style.top = `${outlineY}px`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Scale cursor on interactive elements
  const interactives = document.querySelectorAll('a, button, input, select, textarea, .gallery-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => outline.classList.add('hovered'));
    el.addEventListener('mouseleave', () => outline.classList.remove('hovered'));
  });
}

/* ==========================================================================
   6. CONTACT FORM SUBMISSION HANDLER
   ========================================================================== */
function handleFormSubmit() {
  const form = document.getElementById('consultationForm');
  const feedback = document.getElementById('formFeedback');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (!form || !feedback) return;

  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
  if (submitBtn) {
    submitBtn.innerHTML = 'Transmitting Inquiry...';
    submitBtn.disabled = true;
  }

  // Simulate network dispatch with realistic luxury confirmation
  setTimeout(() => {
    feedback.className = 'form-feedback success';
    feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you. Your spatial inquiry has been recorded. Aurelia Vance Studio will review your architectural specs and reach out within 24 hours.';
    form.reset();

    if (submitBtn) {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }

    setTimeout(() => {
      feedback.style.display = 'none';
    }, 9000);
  }, 1200);
}

/* ==========================================================================
   7. FOOTER AUTO YEAR
   ========================================================================== */
function initFooterYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}