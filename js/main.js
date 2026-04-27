/* ============================================
   MyCRO - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Header scroll effect ----------
  const header = document.querySelector('.header');
  const backToTop = document.querySelector('.back-to-top');

  function onScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (backToTop) {
      if (scrollY > 400) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Back to top ----------
  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- Mobile menu ----------
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.nav-mobile');

  if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener('click', () => {
      mobileBtn.classList.toggle('active');
      mobileNav.classList.toggle('open');

      if (mobileNav.classList.contains('open')) {
        // Lock body scroll but allow nav-mobile to scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
        mobileNav.dataset.scrollY = window.scrollY;
      } else {
        // Restore body scroll
        const scrollY = mobileNav.dataset.scrollY || '0';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY));
      }
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileBtn.classList.remove('active');
        mobileNav.classList.remove('open');
        const scrollY = mobileNav.dataset.scrollY || '0';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY));
      });
    });
  }

  // ---------- Smooth scroll for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
        // Update URL hash — use try/catch so it works inside cross-origin iframes too
        try {
          history.replaceState(null, '', targetId);
        } catch (e) {
          // Fallback for cross-origin iframe contexts where history API is blocked
          window.location.hash = targetId;
        }
      }
    });
  });

  // ---------- Product Tabs ----------
  const productTabs = document.querySelectorAll('.product-tab');
  const productContents = document.querySelectorAll('.product-content');

  productTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      productTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      productContents.forEach(content => {
        content.classList.remove('active');
        if (content.dataset.tab === target) {
          content.classList.add('active');
        }
      });
    });
  });

  // ---------- Pricing Toggle ----------
  const pricingSwitch = document.querySelector('.pricing-switch');
  const monthlyLabel = document.querySelector('.pricing-toggle-label[data-period="monthly"]');
  const annualLabel = document.querySelector('.pricing-toggle-label[data-period="annual"]');
  const monthlyPrices = document.querySelectorAll('.price-monthly');
  const annualPrices = document.querySelectorAll('.price-annual');

  if (pricingSwitch) {
    pricingSwitch.addEventListener('click', () => {
      pricingSwitch.classList.toggle('active');
      const isAnnual = pricingSwitch.classList.contains('active');

      if (monthlyLabel) monthlyLabel.classList.toggle('active', !isAnnual);
      if (annualLabel) annualLabel.classList.toggle('active', isAnnual);

      monthlyPrices.forEach(el => el.style.display = isAnnual ? 'none' : '');
      annualPrices.forEach(el => el.style.display = isAnnual ? '' : 'none');
    });
  }

  // ---------- Scroll Animations (Intersection Observer) ----------
  const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  // Detect headless browsers, bots, or prerenderers where IntersectionObserver may not fire
  const isHeadless = (
    navigator.webdriver ||
    /HeadlessChrome|Puppeteer|Playwright|PhantomJS|Prerender|Googlebot|bingbot|Slurp/i.test(navigator.userAgent) ||
    !window.requestAnimationFrame
  );

  if (isHeadless) {
    // Skip animations entirely — show everything immediately
    animatedElements.forEach(el => el.classList.add('visible'));
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    // Fallback - show everything
    animatedElements.forEach(el => el.classList.add('visible'));
  }

  // ---------- Cookie Banner ----------
  const cookieBanner = document.querySelector('.cookie-banner');
  const cookieAccept = document.getElementById('cookie-accept');
  const cookieDecline = document.getElementById('cookie-decline');

  if (cookieBanner && !localStorage.getItem('mycro-cookies')) {
    setTimeout(() => {
      cookieBanner.classList.add('show');
    }, 2000);
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', () => {
      localStorage.setItem('mycro-cookies', 'accepted');
      cookieBanner.classList.remove('show');
      showToast('success', 'Preferences saved', 'Cookie preferences updated.');
    });
  }

  if (cookieDecline) {
    cookieDecline.addEventListener('click', () => {
      localStorage.setItem('mycro-cookies', 'declined');
      cookieBanner.classList.remove('show');
    });
  }

  // ---------- Toast Notification ----------
  function showToast(type, title, message) {
    const toast = document.querySelector('.toast');
    if (!toast) return;

    const icon = toast.querySelector('.toast-icon');
    const titleEl = toast.querySelector('.toast-content strong');
    const msgEl = toast.querySelector('.toast-content span');

    icon.className = 'toast-icon ' + type;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    icon.textContent = icons[type] || 'ℹ';
    titleEl.textContent = title;
    msgEl.textContent = message;

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }

  // Make toast globally accessible
  window.showToast = showToast;

  // ---------- Contact Form ----------
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      // Basic validation
      let valid = true;
      const requiredFields = contactForm.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      // Email validation
      const emailField = contactForm.querySelector('[type="email"]');
      if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
          emailField.style.borderColor = '#ef4444';
          valid = false;
        }
      }

      if (!valid) {
        showToast('error', 'Validation Error', 'Please fill in all required fields correctly.');
        return;
      }

      // Simulate submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        contactForm.reset();
        showToast('success', 'Message Sent!', 'We\'ll get back to you within 24 hours.');
        console.log('[MyCRO] Contact form submitted:', data);
      }, 1500);
    });
  }

  // ---------- Newsletter / CTA Form ----------
  const ctaForm = document.getElementById('cta-form');
  if (ctaForm) {
    ctaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = ctaForm.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('error', 'Invalid Email', 'Please enter a valid email address.');
        return;
      }

      const btn = ctaForm.querySelector('button');
      const originalText = btn.textContent;
      btn.textContent = 'Subscribing...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        emailInput.value = '';
        showToast('success', 'Subscribed!', 'Welcome aboard! Check your inbox.');
        console.log('[MyCRO] Newsletter signup:', email);
      }, 1200);
    });
  }

  // ---------- Animate dashboard chart on hero ----------
  function animateChart() {
    const bars = document.querySelectorAll('.chart-bar');
    bars.forEach((bar, i) => {
      const heights = [45, 65, 35, 80, 55, 90, 40, 70, 60, 85, 50, 75];
      const h = heights[i % heights.length];
      setTimeout(() => {
        bar.style.height = h + '%';
      }, i * 80);
    });
  }

  // Run chart animation
  setTimeout(animateChart, 500);

  // ---------- Active nav link highlight ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-desktop > a, .nav-desktop .nav-dropdown > a');

  function highlightNav() {
    const scrollPos = window.scrollY + 120;
    let currentSection = '';

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        currentSection = id;
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });

    // Update URL hash to match the current section on scroll
    if (currentSection) {
      const newHash = '#' + currentSection;
      if (window.location.hash !== newHash) {
        try {
          history.replaceState(null, '', newHash);
        } catch (e) {
          // Silently fail in cross-origin iframes
        }
      }
    }
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ---------- Counter animation for stats ----------
  function animateCounters() {
    const counters = document.querySelectorAll('[data-counter]');

    counters.forEach(counter => {
      if (counter.dataset.animated) return;

      const target = parseInt(counter.dataset.counter, 10);
      const duration = 2000;
      const start = performance.now();
      const suffix = counter.dataset.suffix || '';
      const prefix = counter.dataset.prefix || '';

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        counter.textContent = prefix + current.toLocaleString() + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      counter.dataset.animated = 'true';
      requestAnimationFrame(update);
    });
  }

  // Observe counters
  const counterEls = document.querySelectorAll('[data-counter]');
  if (counterEls.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(el => counterObserver.observe(el));
  }

  // ---------- Console branding ----------
  console.log(
    '%c MyCRO %c Conversion Rate Optimization Platform ',
    'background: #4f46e5; color: white; padding: 4px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
    'background: #1e293b; color: #94a3b8; padding: 4px 8px; border-radius: 0 4px 4px 0;'
  );
});
