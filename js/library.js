/* ==========================================================================
   COMPONENT LIBRARY JAVASCRIPT
   Handles: copy functionality, code toggles, search, navigation,
            interactive demos, background pickers
   ========================================================================== */

/* ---------------------------------------------------------------------------
   LUCIDE ICON HELPER
   --------------------------------------------------------------------------- */

function createLucideIcon(name, size) {
  size = size || 14;
  return '<i data-lucide="' + name + '" style="width:' + size + 'px;height:' + size + 'px;"></i>';
}

/* ---------------------------------------------------------------------------
   SVG ICONS (using Lucide icon names)
   --------------------------------------------------------------------------- */

const ICONS = {
  code: createLucideIcon('code', 14),
  check: createLucideIcon('check', 14),
  toastSuccess: createLucideIcon('check-circle', 20),
  toastError: createLucideIcon('x-circle', 20),
  toastWarning: createLucideIcon('alert-triangle', 20),
  toastDefault: createLucideIcon('info', 20),
  toastClose: createLucideIcon('x', 16),
  copy: createLucideIcon('copy', 14)
};

const TOAST_ICONS = {
  success: ICONS.toastSuccess,
  error: ICONS.toastError,
  warning: ICONS.toastWarning,
  default: ICONS.toastDefault
};

/* ---------------------------------------------------------------------------
   INITIALIZATION
   --------------------------------------------------------------------------- */

let interactiveComponentsInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons first
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  const initFunctions = [
    initializeCopyButtons,
    initializeCodeToggles,
    initializeSearch,
    initializeNavigation,
    initializeInteractiveComponents,
    initializeBackgroundPickers,
    initializeColorSwatchCopy,
    initializeSidebarToggle,
    initializeNavScrollIndicators,
    initializeComponentCollapse
  ];

  initFunctions.forEach(function(fn) {
    try {
      fn();
    } catch (e) {
      console.error('Error in ' + fn.name + ':', e);
    }
  });
});

// Helper to refresh Lucide icons after dynamic content changes
function refreshLucideIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ---------------------------------------------------------------------------
   COPY TO CLIPBOARD
   --------------------------------------------------------------------------- */

function initializeCopyButtons() {
  const buttons = document.querySelectorAll('.copy-btn');

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      // Find code within the same panel, or fall back to closest code section
      const panel = btn.closest('.code-editor__panel');
      const codeBlock = panel
        ? panel.querySelector('code')
        : btn.closest('.component-card__code').querySelector('code');
      const text = codeBlock.textContent;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          showCopyFeedback(btn);
        }).catch(function(err) {
          console.error('Clipboard API failed:', err);
          fallbackCopy(text, btn);
        });
      } else {
        fallbackCopy(text, btn);
      }
    });
  });
}

function fallbackCopy(text, btn) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showCopyFeedback(btn);
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  document.body.removeChild(textarea);
}

function showCopyFeedback(btn) {
  const originalHTML = btn.innerHTML;
  btn.innerHTML = ICONS.check + ' Copied!';
  btn.classList.add('copy-btn--copied');
  refreshLucideIcons();

  setTimeout(function() {
    btn.innerHTML = originalHTML;
    btn.classList.remove('copy-btn--copied');
    refreshLucideIcons();
  }, 2000);
}

/* ---------------------------------------------------------------------------
   CODE TOGGLE (Show/Hide Code)
   --------------------------------------------------------------------------- */

function initializeCodeToggles() {
  const buttons = document.querySelectorAll('.code-toggle-btn');

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const card = btn.closest('.component-card');
      const codeSection = card.querySelector('.component-card__code');
      const isVisible = codeSection.classList.contains('component-card__code--visible');

      if (isVisible) {
        codeSection.classList.remove('component-card__code--visible');
        btn.classList.remove('code-toggle-btn--active');
        btn.innerHTML = ICONS.code + ' Show Code';
      } else {
        codeSection.classList.add('component-card__code--visible');
        btn.classList.add('code-toggle-btn--active');
        btn.innerHTML = ICONS.code + ' Hide Code';

        // Lazy-highlight: only run Prism on first open
        if (typeof Prism !== 'undefined' && !codeSection.dataset.highlighted) {
          codeSection.dataset.highlighted = 'true';
          var codeBlocks = codeSection.querySelectorAll('code[class*="language-"]');
          codeBlocks.forEach(function(block) {
            Prism.highlightElement(block);
          });
        }
      }
      refreshLucideIcons();
    });
  });
}

/* ---------------------------------------------------------------------------
   SEARCH FUNCTIONALITY
   --------------------------------------------------------------------------- */

function initializeSearch() {
  const searchInput = document.querySelector('.library-search .input');
  if (!searchInput) return;

  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase().trim();
    const navItems = document.querySelectorAll('.library-nav__item');
    const sections = document.querySelectorAll('.component-section');

    if (!query) {
      navItems.forEach(function(item) { item.style.display = ''; });
      sections.forEach(function(section) {
        section.style.display = '';
        section.querySelectorAll('.component-card').forEach(function(card) {
          card.style.display = '';
        });
      });
      return;
    }

    navItems.forEach(function(item) {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });

    sections.forEach(function(section) {
      const titleEl = section.querySelector('.component-section__title');
      const title = titleEl ? titleEl.textContent.toLowerCase() : '';
      const cards = section.querySelectorAll('.component-card');
      let hasVisibleCards = false;

      cards.forEach(function(card) {
        const cardTitleEl = card.querySelector('.component-card__title');
        const cardTitle = cardTitleEl ? cardTitleEl.textContent.toLowerCase() : '';
        const isMatch = title.includes(query) || cardTitle.includes(query);
        card.style.display = isMatch ? '' : 'none';
        if (isMatch) hasVisibleCards = true;
      });

      section.style.display = hasVisibleCards ? '' : 'none';
    });
  });
}

/* ---------------------------------------------------------------------------
   NAVIGATION
   --------------------------------------------------------------------------- */

function initializeNavigation() {
  const navItems = document.querySelectorAll('.library-nav__item');
  const sections = document.querySelectorAll('.component-section');

  navItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();

      const targetId = item.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        navItems.forEach(function(i) { i.classList.remove('library-nav__item--active'); });
        item.classList.add('library-nav__item--active');
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Update active nav item on scroll
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navItems.forEach(function(item) {
            const isActive = item.getAttribute('href') === '#' + id;
            item.classList.toggle('library-nav__item--active', isActive);
          });
        }
      });
    }, {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(function(section) {
      observer.observe(section);
    });
  }
}

/* ---------------------------------------------------------------------------
   INTERACTIVE COMPONENT DEMOS (Event Delegation)
   --------------------------------------------------------------------------- */

function initializeInteractiveComponents() {
  // Initialize checkboxes that need indeterminate state
  document.querySelectorAll('.checkbox[data-indeterminate="true"]').forEach(function(checkbox) {
    checkbox.indeterminate = true;
  });

  // Guard against duplicate delegation listeners
  if (interactiveComponentsInitialized) return;
  interactiveComponentsInitialized = true;

  // Single delegated listener for modals, toasts, and toast close
  document.body.addEventListener('click', function(e) {
    // Modal triggers
    const modalTrigger = e.target.closest('[data-modal-trigger]');
    if (modalTrigger) {
      const modalId = modalTrigger.dataset.modalTrigger;
      const backdrop = document.querySelector('[data-modal-backdrop="' + modalId + '"]');
      const modal = document.querySelector('[data-modal="' + modalId + '"]');
      if (backdrop && modal) {
        backdrop.classList.add('modal-backdrop--visible');
        modal.classList.add('modal--visible');
        document.body.style.overflow = 'hidden';
      }
      return;
    }

    // Modal close buttons
    const modalClose = e.target.closest('[data-modal-close]');
    if (modalClose) {
      closeModal(modalClose.dataset.modalClose);
      return;
    }

    // Modal backdrop click (close on click outside modal)
    if (e.target.classList.contains('modal-backdrop')) {
      const modalId = e.target.dataset.modalBackdrop;
      if (modalId) {
        closeModal(modalId);
      }
      return;
    }

    // Toast triggers
    const toastTrigger = e.target.closest('[data-toast-trigger]');
    if (toastTrigger) {
      const type = toastTrigger.dataset.toastType || 'default';
      const message = toastTrigger.dataset.toastMessage || 'This is a toast notification';
      showToast(message, type);
      return;
    }

    // Toast close buttons
    const toastClose = e.target.closest('.toast__close');
    if (toastClose) {
      const toast = toastClose.closest('.toast');
      if (toast) toast.remove();
    }
  });
}

function closeModal(modalId) {
  const backdrop = document.querySelector('[data-modal-backdrop="' + modalId + '"]');
  const modal = document.querySelector('[data-modal="' + modalId + '"]');

  if (backdrop && modal) {
    backdrop.classList.remove('modal-backdrop--visible');
    modal.classList.remove('modal--visible');
    document.body.style.overflow = '';
  }
}

function showToast(message, type) {
  type = type || 'default';
  const container = document.querySelector('.toast-container') || createToastContainer();

  const toast = document.createElement('div');
  toast.className = 'toast' + (type !== 'default' ? ' toast--' + type : '');

  const icon = TOAST_ICONS[type] || TOAST_ICONS.default;
  toast.innerHTML = '<span class="toast__icon">' + icon + '</span>' +
    '<span class="toast__content">' + message + '</span>' +
    '<button class="toast__close">' + ICONS.toastClose + '</button>';

  container.appendChild(toast);
  refreshLucideIcons();

  setTimeout(function() {
    toast.style.animation = 'toast-out 0.3s ease-in forwards';
    setTimeout(function() { toast.remove(); }, 300);
  }, 4000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

/* ---------------------------------------------------------------------------
   BACKGROUND PICKER
   --------------------------------------------------------------------------- */

const BG_OPTIONS = [
  { id: 'checker',   label: 'Checkerboard' },
  { id: 'white',     label: 'White' },
  { id: 'light',     label: 'Light Gray' },
  { id: 'dots',      label: 'Dots' },
  { id: 'gradient',  label: 'Gradient' },
  { id: 'dark',      label: 'Dark' },
  { id: 'midnight',  label: 'Midnight' }
];

const BG_CLASSES = BG_OPTIONS.map(function(opt) {
  return 'component-card__preview--bg-' + opt.id;
});

function initializeBackgroundPickers() {
  const cards = document.querySelectorAll('.component-card');

  // --- Per-card pickers ---
  cards.forEach(function(card) {
    const actionsEl = card.querySelector('.component-card__actions');
    const previewEl = card.querySelector('.component-card__preview');
    if (!actionsEl || !previewEl) return;

    // Determine the default active background
    let defaultBg = 'checker';
    if (previewEl.classList.contains('component-card__preview--dark')) {
      defaultBg = 'dark';
    }

    // Build picker
    const picker = document.createElement('div');
    picker.className = 'bg-picker';

    const label = document.createElement('span');
    label.className = 'bg-picker__label';
    label.textContent = 'BG';
    picker.appendChild(label);

    BG_OPTIONS.forEach(function(opt) {
      const swatch = document.createElement('button');
      swatch.className = 'bg-picker__swatch bg-picker__swatch--' + opt.id;
      swatch.title = opt.label;
      swatch.setAttribute('aria-label', 'Set background to ' + opt.label);
      swatch.type = 'button';

      if (opt.id === defaultBg) {
        swatch.classList.add('bg-picker__swatch--active');
      }

      swatch.addEventListener('click', function() {
        // Clear global active state since user is overriding per-card
        clearGlobalActiveState();

        // Update active swatch
        picker.querySelectorAll('.bg-picker__swatch').forEach(function(s) {
          s.classList.remove('bg-picker__swatch--active');
        });
        swatch.classList.add('bg-picker__swatch--active');

        // Apply background to this card only
        applyBgToPreview(previewEl, opt.id);
      });

      picker.appendChild(swatch);
    });

    // Insert picker before existing action buttons
    actionsEl.insertBefore(picker, actionsEl.firstChild);
  });

  // --- Global picker ---
  initializeGlobalBackgroundPicker();
}

function applyBgToPreview(previewEl, bgId) {
  BG_CLASSES.forEach(function(cls) {
    previewEl.classList.remove(cls);
  });
  previewEl.classList.remove('component-card__preview--dark');
  previewEl.classList.add('component-card__preview--bg-' + bgId);
}

function clearGlobalActiveState() {
  const globalSwatches = document.querySelectorAll('#global-bg-swatches .global-bg-picker__swatch');
  globalSwatches.forEach(function(s) {
    s.classList.remove('global-bg-picker__swatch--active');
  });
}

function initializeGlobalBackgroundPicker() {
  const container = document.getElementById('global-bg-swatches');
  const resetBtn = document.getElementById('global-bg-reset');
  if (!container) return;

  BG_OPTIONS.forEach(function(opt) {
    const swatch = document.createElement('button');
    swatch.className = 'global-bg-picker__swatch global-bg-picker__swatch--' + opt.id;
    swatch.title = opt.label;
    swatch.setAttribute('aria-label', 'Set all backgrounds to ' + opt.label);
    swatch.type = 'button';

    swatch.addEventListener('click', function() {
      // Update global active swatch
      container.querySelectorAll('.global-bg-picker__swatch').forEach(function(s) {
        s.classList.remove('global-bg-picker__swatch--active');
      });
      swatch.classList.add('global-bg-picker__swatch--active');

      // Apply to all preview areas and sync per-card pickers
      document.querySelectorAll('.component-card').forEach(function(card) {
        const previewEl = card.querySelector('.component-card__preview');
        if (!previewEl) return;

        applyBgToPreview(previewEl, opt.id);

        // Sync per-card picker active state
        const cardSwatches = card.querySelectorAll('.bg-picker__swatch');
        cardSwatches.forEach(function(s) {
          s.classList.remove('bg-picker__swatch--active');
          if (s.classList.contains('bg-picker__swatch--' + opt.id)) {
            s.classList.add('bg-picker__swatch--active');
          }
        });
      });
    });

    container.appendChild(swatch);
  });

  // Reset button - restore each card to its original default
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      clearGlobalActiveState();

      document.querySelectorAll('.component-card').forEach(function(card) {
        const previewEl = card.querySelector('.component-card__preview');
        if (!previewEl) return;

        // Remove all bg classes
        BG_CLASSES.forEach(function(cls) {
          previewEl.classList.remove(cls);
        });

        // Determine original default from card's data or fallback to checker
        const defaultBg = 'checker';

        // Reset per-card picker active state
        const cardSwatches = card.querySelectorAll('.bg-picker__swatch');
        cardSwatches.forEach(function(s) {
          s.classList.remove('bg-picker__swatch--active');
          if (s.classList.contains('bg-picker__swatch--' + defaultBg)) {
            s.classList.add('bg-picker__swatch--active');
          }
        });
      });
    });
  }
}

/* ---------------------------------------------------------------------------
   COLOR SWATCH COPY
   --------------------------------------------------------------------------- */

function spawnConfetti(x, y, color) {
  var count = 30;
  var defaults = {
    colors: [color, '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1'],
    shapes: ['circle', 'square'],
    gravity: 0.8,
    spread: 360,
    drift: 0
  };

  for (var i = 0; i < count; i++) {
    var particle = document.createElement('div');
    var size = Math.random() * 8 + 4;
    var shape = defaults.shapes[Math.floor(Math.random() * defaults.shapes.length)];
    var particleColor = defaults.colors[Math.floor(Math.random() * defaults.colors.length)];
    var angle = (Math.random() * Math.PI * 2);
    var velocity = Math.random() * 120 + 60;
    var vx = Math.cos(angle) * velocity;
    var vy = Math.sin(angle) * velocity;
    var rotation = Math.random() * 360;
    var rotationSpeed = (Math.random() - 0.5) * 720;

    particle.style.cssText =
      'position:fixed;pointer-events:none;z-index:99999;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'background:' + particleColor + ';' +
      'border-radius:' + (shape === 'circle' ? '50%' : '2px') + ';' +
      'left:' + x + 'px;top:' + y + 'px;' +
      'opacity:1;';

    document.body.appendChild(particle);
    animateConfettiParticle(particle, x, y, vx, vy, rotation, rotationSpeed, defaults.gravity);
  }
}

function animateConfettiParticle(el, startX, startY, vx, vy, rot, rotSpeed, gravity) {
  var start = null;
  var duration = 1000;
  var px = 0;
  var py = 0;

  function step(timestamp) {
    if (!start) start = timestamp;
    var elapsed = timestamp - start;
    var t = elapsed / duration;

    if (t >= 1) {
      if (el.parentNode) el.parentNode.removeChild(el);
      return;
    }

    px = vx * t;
    py = vy * t + 0.5 * gravity * 800 * t * t;
    var opacity = 1 - t;
    var currentRot = rot + rotSpeed * t;

    el.style.transform = 'translate(' + px + 'px, ' + py + 'px) rotate(' + currentRot + 'deg)';
    el.style.opacity = opacity;

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initializeColorSwatchCopy() {
  const swatches = document.querySelectorAll('.color-swatch');

  swatches.forEach(function(swatch) {
    swatch.style.cursor = 'pointer';

    swatch.addEventListener('click', function(e) {
      const hex = swatch.querySelector('.color-swatch__hex');
      if (!hex) return;

      const text = hex.textContent;
      var colorEl = swatch.querySelector('.color-swatch__color');
      var swatchColor = colorEl ? getComputedStyle(colorEl).backgroundColor : text;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          spawnConfetti(e.clientX, e.clientY, swatchColor);
          showHexCopyFeedback(hex, text);
        }).catch(function(err) {
          console.error('Clipboard API failed:', err);
          fallbackHexCopy(text, hex, e, swatchColor);
        });
      } else {
        fallbackHexCopy(text, hex, e, swatchColor);
      }
    });
  });
}

function fallbackHexCopy(text, hex, e, swatchColor) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    if (e && swatchColor) spawnConfetti(e.clientX, e.clientY, swatchColor);
    showHexCopyFeedback(hex, text);
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  document.body.removeChild(textarea);
}

function showHexCopyFeedback(hex, originalText) {
  hex.textContent = 'Copied!';
  hex.style.color = 'var(--color-success-500)';

  setTimeout(function() {
    hex.textContent = originalText;
    hex.style.color = '';
  }, 1500);
}

/* ---------------------------------------------------------------------------
   SIDEBAR TOGGLE
   --------------------------------------------------------------------------- */

function initializeSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.library-sidebar');
  const library = document.querySelector('.library');

  if (!toggleBtn || !sidebar || !library) return;

  // Check for saved state
  const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('library-sidebar--collapsed');
    library.classList.add('library--sidebar-collapsed');
  }

  toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('library-sidebar--collapsed');
    library.classList.toggle('library--sidebar-collapsed');

    // Save state
    const collapsed = sidebar.classList.contains('library-sidebar--collapsed');
    localStorage.setItem('sidebar-collapsed', collapsed);
    refreshLucideIcons();
  });

  // Tooltip positioning for collapsed sidebar
  initializeSidebarTooltips();
}

/* ---------------------------------------------------------------------------
   SECTION COLLAPSE
   --------------------------------------------------------------------------- */

function initializeComponentCollapse() {
  const sections = document.querySelectorAll('.component-section');
  const collapseAllBtn = document.getElementById('collapse-all-btn');
  let allCollapsed = false;

  sections.forEach(function(section) {
    const header = section.querySelector('.component-section__header');

    if (!header) return;

    // Wrap all cards in a body container for smooth collapse animation
    var cards = section.querySelectorAll(':scope > .component-card');
    if (cards.length > 0) {
      var body = document.createElement('div');
      body.className = 'component-section__body';
      var inner = document.createElement('div');
      inner.className = 'component-section__body-inner';
      // Insert body wrapper after header
      header.after(body);
      body.appendChild(inner);
      cards.forEach(function(card) {
        inner.appendChild(card);
      });
    }

    // Create collapse button using btn component
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'btn btn--ghost btn--icon btn--sm component-section__collapse';
    collapseBtn.title = 'Toggle section';
    collapseBtn.innerHTML = '<i data-lucide="chevron-down"></i>';

    // Add to end of header
    header.appendChild(collapseBtn);

    // Toggle on click
    collapseBtn.addEventListener('click', function() {
      section.classList.toggle('component-section--collapsed');
      refreshLucideIcons();
      updateCollapseAllButton();
    });
  });

  // Collapse all button
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', function() {
      allCollapsed = !allCollapsed;

      sections.forEach(function(section) {
        if (allCollapsed) {
          section.classList.add('component-section--collapsed');
        } else {
          section.classList.remove('component-section--collapsed');
        }
      });

      updateCollapseAllButton();
      refreshLucideIcons();
    });
  }

  function updateCollapseAllButton() {
    if (!collapseAllBtn) return;

    const collapsedCount = document.querySelectorAll('.component-section--collapsed').length;
    allCollapsed = collapsedCount === sections.length;

    const icon = allCollapsed ? 'chevrons-up-down' : 'chevrons-down-up';
    const text = allCollapsed ? 'Expand All' : 'Collapse All';

    collapseAllBtn.innerHTML = '<i data-lucide="' + icon + '"></i><span>' + text + '</span>';
    refreshLucideIcons();
  }

  // Refresh icons after adding buttons
  refreshLucideIcons();
}

/* ---------------------------------------------------------------------------
   NAV SCROLL INDICATORS
   --------------------------------------------------------------------------- */

function initializeNavScrollIndicators() {
  const wrapper = document.querySelector('.library-nav-wrapper');
  const nav = document.querySelector('.library-nav');

  if (!wrapper || !nav) return;

  function updateScrollIndicators() {
    const scrollTop = nav.scrollTop;
    const scrollHeight = nav.scrollHeight;
    const clientHeight = nav.clientHeight;

    // Show top gradient if scrolled down
    if (scrollTop > 10) {
      wrapper.classList.add('library-nav-wrapper--scroll-top');
    } else {
      wrapper.classList.remove('library-nav-wrapper--scroll-top');
    }

    // Show bottom gradient if more content below
    if (scrollTop + clientHeight < scrollHeight - 10) {
      wrapper.classList.add('library-nav-wrapper--scroll-bottom');
    } else {
      wrapper.classList.remove('library-nav-wrapper--scroll-bottom');
    }
  }

  // Initial check
  updateScrollIndicators();

  // Update on scroll
  nav.addEventListener('scroll', updateScrollIndicators);

  // Update on resize
  window.addEventListener('resize', updateScrollIndicators);
}

function initializeSidebarTooltips() {
  const navItems = document.querySelectorAll('.library-nav__item[data-tooltip]');

  // Create tooltip element with glassmorphic design
  const tooltip = document.createElement('div');
  tooltip.className = 'sidebar-tooltip';
  tooltip.style.cssText = 'position: fixed; padding: 10px 16px; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); color: #1F356F; font-size: 14px; font-weight: 500; white-space: nowrap; border-radius: 24px; box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.02), 0 10px 20px 0 rgba(255, 255, 255, 0.40) inset, 0 0 0 0.5px rgba(255, 255, 255, 0.40) inset, 0.5px 0.5px 4px 0 rgba(255, 255, 255, 0.60) inset, -0.5px -0.5px 0 0 rgba(255, 255, 255, 0.60) inset; opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.15s, visibility 0.15s; z-index: 1000;';
  document.body.appendChild(tooltip);

  navItems.forEach(function(item) {
    item.addEventListener('mouseenter', function() {
      const sidebar = document.querySelector('.library-sidebar');
      if (!sidebar.classList.contains('library-sidebar--collapsed')) return;

      const rect = item.getBoundingClientRect();
      const text = item.getAttribute('data-tooltip');

      tooltip.textContent = text;
      tooltip.style.left = '80px';
      tooltip.style.top = (rect.top + rect.height / 2 - 18) + 'px';
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    });

    item.addEventListener('mouseleave', function() {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    });
  });
}
