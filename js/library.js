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
    initializeComponentCollapse,
    initializeInspectorPanel
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

// ============================================================================
// INSPECTOR PANEL v2
// Figma-like property inspector with designer-friendly UX
// Features: search, friendly names, color grid, box model, corner widget,
//           rich hover tooltip, undo/redo, per-property reset
// ============================================================================

function initializeInspectorPanel() {
  // --- State ---
  var inspectorState = {
    isOpen: false,
    selectedElement: null,
    hoveredElement: null,
    pendingOverrides: {},
    modifiedElements: new Map()
  };

  // --- Undo/Redo Stacks ---
  var undoStack = [];
  var redoStack = [];

  // --- Feature 2: Designer-Friendly Property Labels ---
  var FRIENDLY_NAMES = {
    'color': 'Text Color',
    'background-color': 'Fill',
    'opacity': 'Opacity',
    'font-family': 'Font',
    'font-size': 'Size',
    'font-weight': 'Weight',
    'line-height': 'Line Height',
    'letter-spacing': 'Tracking',
    'text-align': 'Alignment',
    'text-transform': 'Transform',
    'text-decoration-line': 'Decoration',
    'white-space': 'Whitespace',
    'word-break': 'Word Break',
    'display': 'Display',
    'position': 'Position',
    'flex-direction': 'Direction',
    'flex-wrap': 'Wrap',
    'align-items': 'Align',
    'justify-content': 'Justify',
    'overflow': 'Overflow',
    'overflow-x': 'Overflow X',
    'overflow-y': 'Overflow Y',
    'cursor': 'Cursor',
    'pointer-events': 'Pointer Events',
    'box-shadow': 'Shadow',
    'backdrop-filter': 'Backdrop',
    'transform': 'Transform',
    'transition': 'Transition',
    'z-index': 'Z-Index',
    'border-style': 'Border Style',
    'border-color': 'Border Color',
    'border-top-color': 'Top Color',
    'border-right-color': 'Right Color',
    'border-bottom-color': 'Bottom Color',
    'border-left-color': 'Left Color',
    'border-top-width': 'Top Width',
    'border-right-width': 'Right Width',
    'border-bottom-width': 'Bottom Width',
    'border-left-width': 'Left Width',
    'border-top-left-radius': 'Top Left',
    'border-top-right-radius': 'Top Right',
    'border-bottom-left-radius': 'Bottom Left',
    'border-bottom-right-radius': 'Bottom Right',
    'gap': 'Gap',
    'row-gap': 'Row Gap',
    'column-gap': 'Column Gap',
    'width': 'Width',
    'height': 'Height',
    'min-width': 'Min Width',
    'min-height': 'Min Height',
    'max-width': 'Max Width',
    'max-height': 'Max Height',
    'padding-top': 'Pad Top',
    'padding-right': 'Pad Right',
    'padding-bottom': 'Pad Bottom',
    'padding-left': 'Pad Left',
    'margin-top': 'Margin Top',
    'margin-right': 'Margin Right',
    'margin-bottom': 'Margin Bottom',
    'margin-left': 'Margin Left'
  };

  var FRIENDLY_GROUP_NAMES = {
    'Layout': 'Layout',
    'Spacing': 'Spacing & Size',
    'Typography': 'Text',
    'Colors': 'Fill & Color',
    'Borders': 'Borders & Corners',
    'Effects': 'Effects'
  };

  // --- Feature 6: BEM-to-Readable Name ---
  function bemToReadable(className) {
    if (!className) return '';
    // Common BEM abbreviation expansions
    var abbrevs = {
      'btn': 'Button', 'nav': 'Navigation', 'img': 'Image', 'col': 'Column',
      'pg': 'Page', 'hdr': 'Header', 'ftr': 'Footer', 'cta': 'Call to Action',
      'sm': 'Small', 'md': 'Medium', 'lg': 'Large', 'xl': 'Extra Large'
    };

    // Split on -- (modifier) and __ (element)
    var parts = className.replace(/--/g, ' ').replace(/__/g, ' ').split(' ');
    return parts.map(function(part) {
      // Split on hyphens
      var words = part.split('-');
      return words.map(function(word) {
        if (abbrevs[word]) return abbrevs[word];
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    }).join(' \u2013 ');
  }

  // --- Token Registry (hardcoded from tokens.css for reliability) ---
  var TOKEN_CATEGORIES = {
    colors: {
      '--color-primary-50': '#D3E4FD',
      '--color-primary-100': '#E4EFFE',
      '--color-primary-500': '#4586F7',
      '--color-primary-600': '#214DA5',
      '--color-primary-800': '#1F356F',
      '--color-neutral-0': '#FFFFFF',
      '--color-neutral-50': '#F8F9FB',
      '--color-neutral-100': '#F4F5F8',
      '--color-neutral-200': '#E6E9EE',
      '--color-neutral-300': '#D1D5E1',
      '--color-neutral-400': '#99A2B5',
      '--color-neutral-500': '#656E85',
      '--color-neutral-600': '#454D62',
      '--color-neutral-700': '#2C3554',
      '--color-neutral-800': '#141930',
      '--color-neutral-900': '#050B19',
      '--color-secondary-blue-100': '#E4E2FC',
      '--color-secondary-blue-500': '#7A6FF6',
      '--color-secondary-purple-100': '#F3DDFA',
      '--color-secondary-purple-500': '#C153E8',
      '--color-secondary-pink-100': '#F8DBEC',
      '--color-secondary-pink-500': '#DC4CA2',
      '--color-secondary-teal-100': '#E0F1EE',
      '--color-secondary-teal-500': '#62BAAC',
      '--color-secondary-coral-100': '#FFE6E2',
      '--color-secondary-coral-500': '#FF8070',
      '--color-secondary-violet-100': '#D5BBF3',
      '--color-secondary-violet-500': '#731DD8',
      '--color-success-50': '#EDFAF4',
      '--color-success-100': '#D9F3E9',
      '--color-success-500': '#00B16C',
      '--color-success-600': '#009A5E',
      '--color-success-700': '#008450',
      '--color-warning-50': '#FDF6E9',
      '--color-warning-100': '#F9E4BB',
      '--color-warning-500': '#E5A34F',
      '--color-warning-600': '#D4922E',
      '--color-warning-700': '#B87D1F',
      '--color-error-50': '#FEF5F4',
      '--color-error-100': '#FAE2E0',
      '--color-error-500': '#DF3C32',
      '--color-error-600': '#C8352C',
      '--color-error-700': '#B02E26',
      '--color-info-50': '#F3F2FE',
      '--color-info-100': '#E4E2FC',
      '--color-info-500': '#7A6FF6',
      '--color-info-600': '#6358E0',
      '--color-info-700': '#5248C9'
    },
    spacing: {
      '--space-0': '0',
      '--space-1': '0.25rem',
      '--space-2': '0.5rem',
      '--space-3': '0.75rem',
      '--space-4': '1rem',
      '--space-5': '1.25rem',
      '--space-6': '1.5rem',
      '--space-8': '2rem',
      '--space-10': '2.5rem',
      '--space-12': '3rem',
      '--space-16': '4rem',
      '--space-20': '5rem',
      '--space-24': '6rem'
    },
    typography: {
      '--text-xs': '0.75rem',
      '--text-sm': '0.8125rem',
      '--text-base': '0.875rem',
      '--text-md': '1rem',
      '--text-lg': '1.125rem',
      '--text-xl': '1.25rem',
      '--text-2xl': '1.5rem',
      '--text-3xl': '1.875rem',
      '--text-4xl': '2.25rem',
      '--font-normal': '400',
      '--font-medium': '500',
      '--font-semibold': '600',
      '--font-bold': '700',
      '--leading-tight': '1.25',
      '--leading-snug': '1.375',
      '--leading-normal': '1.5',
      '--leading-relaxed': '1.625',
      '--tracking-tight': '-0.025em',
      '--tracking-normal': '0',
      '--tracking-wide': '0.025em'
    },
    radius: {
      '--radius-none': '0',
      '--radius-sm': '0.75rem',
      '--radius-md': '1.5rem',
      '--radius-lg': '1.5rem',
      '--radius-xl': '1.5rem',
      '--radius-2xl': '1.5rem',
      '--radius-full': '9999px'
    },
    shadows: {
      '--shadow-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '--shadow-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      '--shadow-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '--shadow-primary': '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
      '--shadow-success': '0 4px 14px 0 rgba(16, 185, 129, 0.25)',
      '--shadow-error': '0 4px 14px 0 rgba(239, 68, 68, 0.25)',
      '--shadow-none': 'none'
    },
    borders: {
      '--border-width-thin': '1px',
      '--border-width-medium': '2px',
      '--border-width-thick': '3px'
    },
    glass: {
      '--glass-bg': 'rgba(255, 255, 255, 0.7)',
      '--glass-bg-strong': 'rgba(255, 255, 255, 0.85)',
      '--glass-border': 'rgba(255, 255, 255, 0.5)'
    }
  };

  // --- Feature 3: Color sections for the swatch grid ---
  var COLOR_SECTIONS = [
    { label: 'Primary', tokens: ['--color-primary-50', '--color-primary-100', '--color-primary-500', '--color-primary-600', '--color-primary-800'] },
    { label: 'Neutral', tokens: ['--color-neutral-0', '--color-neutral-50', '--color-neutral-100', '--color-neutral-200', '--color-neutral-300', '--color-neutral-400', '--color-neutral-500', '--color-neutral-600', '--color-neutral-700', '--color-neutral-800', '--color-neutral-900'] },
    { label: 'Success', tokens: ['--color-success-50', '--color-success-100', '--color-success-500', '--color-success-600', '--color-success-700'] },
    { label: 'Warning', tokens: ['--color-warning-50', '--color-warning-100', '--color-warning-500', '--color-warning-600', '--color-warning-700'] },
    { label: 'Error', tokens: ['--color-error-50', '--color-error-100', '--color-error-500', '--color-error-600', '--color-error-700'] },
    { label: 'Info', tokens: ['--color-info-50', '--color-info-100', '--color-info-500', '--color-info-600', '--color-info-700'] },
    { label: 'Secondary', tokens: ['--color-secondary-blue-100', '--color-secondary-blue-500', '--color-secondary-purple-100', '--color-secondary-purple-500', '--color-secondary-pink-100', '--color-secondary-pink-500', '--color-secondary-teal-100', '--color-secondary-teal-500', '--color-secondary-coral-100', '--color-secondary-coral-500', '--color-secondary-violet-100', '--color-secondary-violet-500'] }
  ];

  var REVERSE_TOKEN_MAP = {};

  function resolveColorToRgb(value) {
    var temp = document.createElement('div');
    temp.style.color = value;
    temp.style.display = 'none';
    document.body.appendChild(temp);
    var computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    return computed;
  }

  function remToPx(remVal) {
    var num = parseFloat(remVal);
    if (isNaN(num)) return null;
    return Math.round(num * 16) + 'px';
  }

  function buildTokenRegistry() {
    var categories = Object.keys(TOKEN_CATEGORIES);
    categories.forEach(function(cat) {
      var tokens = TOKEN_CATEGORIES[cat];
      Object.keys(tokens).forEach(function(prop) {
        var raw = tokens[prop];
        REVERSE_TOKEN_MAP[raw] = prop;

        if (prop.startsWith('--color-')) {
          var rgb = resolveColorToRgb(raw);
          if (rgb && rgb !== raw) {
            REVERSE_TOKEN_MAP[rgb] = prop;
          }
        }

        if (raw.endsWith('rem')) {
          var px = remToPx(raw);
          if (px) {
            REVERSE_TOKEN_MAP[px] = prop;
          }
        }

        if (prop.startsWith('--radius-') && raw.endsWith('px')) {
          REVERSE_TOKEN_MAP[raw] = prop;
        }
      });
    });
  }

  // --- Property-to-Token Mapping ---
  var PROPERTY_TOKEN_MAP = {
    'color': 'colors',
    'background-color': 'colors',
    'border-color': 'colors',
    'border-top-color': 'colors',
    'border-right-color': 'colors',
    'border-bottom-color': 'colors',
    'border-left-color': 'colors',
    'outline-color': 'colors',
    'padding-top': 'spacing',
    'padding-right': 'spacing',
    'padding-bottom': 'spacing',
    'padding-left': 'spacing',
    'margin-top': 'spacing',
    'margin-right': 'spacing',
    'margin-bottom': 'spacing',
    'margin-left': 'spacing',
    'gap': 'spacing',
    'row-gap': 'spacing',
    'column-gap': 'spacing',
    'width': 'spacing',
    'height': 'spacing',
    'font-size': 'typography',
    'font-weight': 'typography',
    'line-height': 'typography',
    'letter-spacing': 'typography',
    'border-top-left-radius': 'radius',
    'border-top-right-radius': 'radius',
    'border-bottom-left-radius': 'radius',
    'border-bottom-right-radius': 'radius',
    'box-shadow': 'shadows',
    'border-top-width': 'borders',
    'border-right-width': 'borders',
    'border-bottom-width': 'borders',
    'border-left-width': 'borders'
  };

  var CSS_VALUE_OPTIONS = {
    'display': ['none', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'table', 'table-cell', 'table-row', 'contents'],
    'position': ['static', 'relative', 'absolute', 'fixed', 'sticky'],
    'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
    'flex-wrap': ['nowrap', 'wrap', 'wrap-reverse'],
    'align-items': ['stretch', 'flex-start', 'flex-end', 'center', 'baseline', 'normal'],
    'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly', 'normal'],
    'overflow': ['visible', 'hidden', 'scroll', 'auto', 'clip'],
    'overflow-x': ['visible', 'hidden', 'scroll', 'auto', 'clip'],
    'overflow-y': ['visible', 'hidden', 'scroll', 'auto', 'clip'],
    'text-align': ['left', 'center', 'right', 'justify', 'start', 'end'],
    'text-transform': ['none', 'uppercase', 'lowercase', 'capitalize'],
    'text-decoration-line': ['none', 'underline', 'overline', 'line-through'],
    'white-space': ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces'],
    'word-break': ['normal', 'break-all', 'keep-all', 'break-word'],
    'cursor': ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'not-allowed', 'grab', 'crosshair', 'help'],
    'pointer-events': ['auto', 'none'],
    'border-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
    'opacity': ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1']
  };

  // --- Property Groups ---
  var PROPERTY_GROUPS = [
    {
      name: 'Layout',
      icon: 'layout',
      properties: ['display', 'position', 'flex-direction', 'align-items', 'justify-content', 'flex-wrap', 'overflow', 'overflow-x', 'overflow-y']
    },
    {
      name: 'Spacing',
      icon: 'move',
      properties: ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'gap', 'row-gap', 'column-gap']
    },
    {
      name: 'Typography',
      icon: 'type',
      properties: ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-align', 'text-transform', 'text-decoration-line', 'white-space', 'word-break']
    },
    {
      name: 'Colors',
      icon: 'palette',
      properties: ['color', 'background-color', 'opacity']
    },
    {
      name: 'Borders',
      icon: 'square',
      properties: ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-style', 'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius']
    },
    {
      name: 'Effects',
      icon: 'sparkles',
      properties: ['box-shadow', 'backdrop-filter', 'transform', 'transition', 'cursor', 'pointer-events', 'z-index']
    }
  ];

  var DEFAULT_VALUES = {
    'display': ['inline'],
    'position': ['static'],
    'flex-direction': ['row'],
    'flex-wrap': ['nowrap'],
    'align-items': ['normal'],
    'justify-content': ['normal'],
    'overflow': ['visible'],
    'overflow-x': ['visible'],
    'overflow-y': ['visible'],
    'opacity': ['1'],
    'z-index': ['auto'],
    'transform': ['none'],
    'box-shadow': ['none'],
    'backdrop-filter': ['none'],
    'text-decoration-line': ['none'],
    'text-transform': ['none'],
    'cursor': ['auto'],
    'pointer-events': ['auto'],
    'white-space': ['normal'],
    'word-break': ['normal'],
    'letter-spacing': ['normal'],
    'border-style': ['none'],
    'text-align': ['start'],
    'transition': ['all 0s ease 0s', 'none']
  };

  function isPropertyMeaningful(property, value) {
    if (!value || value === 'initial' || value === 'inherit' || value === '') return false;
    var defs = DEFAULT_VALUES[property];
    if (defs && defs.indexOf(value) !== -1) return false;
    if (value === '0px' && (property.startsWith('margin') || property.startsWith('padding') || property === 'gap' || property === 'row-gap' || property === 'column-gap')) return false;
    if (value === 'auto' && property.startsWith('margin')) return false;
    if (value === 'auto' && (property === 'width' || property === 'height' || property === 'min-width' || property === 'min-height' || property === 'max-width' || property === 'max-height' || property === 'z-index')) return false;
    if (value === 'none' && (property === 'max-width' || property === 'max-height' || property === 'min-width' || property === 'min-height' || property === 'transform' || property === 'backdrop-filter')) return false;
    if (value === '0px' && property.includes('border') && property.includes('width')) return false;
    if (property === 'line-height' && value === 'normal') return false;
    if ((property === 'background-color' || property === 'border-color' || property.includes('border') && property.includes('color')) &&
        (value === 'rgba(0, 0, 0, 0)' || value === 'transparent')) return false;
    return true;
  }

  // --- Selector Resolution ---
  function resolveSelector(element) {
    var classes = Array.from(element.classList);
    var bemClasses = classes.filter(function(c) {
      return !c.startsWith('inspector') &&
             !c.startsWith('component-card') &&
             !c.startsWith('preview-') &&
             !c.startsWith('bg-picker');
    });
    if (bemClasses.length === 0) return element.tagName.toLowerCase();
    var modifierClass = bemClasses.find(function(c) { return c.indexOf('--') !== -1; });
    if (modifierClass) return '.' + modifierClass;
    var elementClass = bemClasses.find(function(c) { return c.indexOf('__') !== -1; });
    if (elementClass) return '.' + elementClass;
    return '.' + bemClasses[0];
  }

  // --- Override CSS Generation ---
  function generateOverridesCSS() {
    var lines = [];
    lines.push('/* ==========================================================================');
    lines.push('   COMPONENT INSPECTOR OVERRIDES');
    lines.push('   Auto-generated by the Inspector Panel');
    lines.push('   Last modified: ' + new Date().toISOString());
    lines.push('   ========================================================================== */');
    lines.push('');
    var selectors = Object.keys(inspectorState.pendingOverrides);
    selectors.forEach(function(selector) {
      var props = inspectorState.pendingOverrides[selector];
      var propNames = Object.keys(props);
      if (propNames.length === 0) return;
      lines.push(selector + ' {');
      propNames.forEach(function(prop) {
        lines.push('  ' + prop + ': ' + props[prop] + ';');
      });
      lines.push('}');
      lines.push('');
    });
    return lines.join('\n');
  }

  function truncateValue(val, maxLen) {
    maxLen = maxLen || 30;
    if (val && val.length > maxLen) return val.substring(0, maxLen) + '...';
    return val;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Get token display name from a token variable name
  function tokenDisplayName(tokenName) {
    if (!tokenName) return '';
    return tokenName.replace(/^--/, '');
  }

  // --- DOM References ---
  var panel = document.getElementById('inspector-panel');
  var toggleBtn = document.getElementById('inspector-toggle');
  var closeBtn = document.getElementById('inspector-close');
  var resetBtn = document.getElementById('inspector-reset');
  var exportBtn = document.getElementById('inspector-export');
  var selectionArea = document.getElementById('inspector-selection');
  var propertiesArea = document.getElementById('inspector-properties');
  var changesBadge = document.getElementById('inspector-changes-badge');
  var searchInput = document.getElementById('inspector-search-input');
  var undoBtn = document.getElementById('inspector-undo');
  var redoBtn = document.getElementById('inspector-redo');

  if (!panel || !toggleBtn || !closeBtn || !resetBtn || !exportBtn || !selectionArea || !propertiesArea || !changesBadge) return;

  // --- Build Token Registry ---
  buildTokenRegistry();

  // --- Create Overlay Element (with tooltip) ---
  var overlay = document.createElement('div');
  overlay.className = 'inspector__overlay';
  overlay.innerHTML = '<span class="inspector__overlay-tag"></span>' +
    '<div class="inspector__overlay-tooltip" style="display:none;">' +
      '<div class="inspector__overlay-tooltip-name"></div>' +
      '<div class="inspector__overlay-tooltip-stats"></div>' +
    '</div>';
  document.body.appendChild(overlay);
  var overlayTag = overlay.querySelector('.inspector__overlay-tag');
  var overlayTooltip = overlay.querySelector('.inspector__overlay-tooltip');
  var overlayTooltipName = overlay.querySelector('.inspector__overlay-tooltip-name');
  var overlayTooltipStats = overlay.querySelector('.inspector__overlay-tooltip-stats');

  // --- Tooltip cache (avoid recomputing for same element) ---
  var tooltipCache = new WeakMap();

  // --- Feature 6: Show/Hide Overlay with Rich Tooltip ---
  function showOverlay(el) {
    var rect = el.getBoundingClientRect();
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    overlayTag.textContent = el.tagName.toLowerCase() + (el.classList.length ? '.' + el.classList[0] : '');
    overlay.classList.add('inspector__overlay--visible');
    inspectorState.hoveredElement = el;

    // Rich tooltip
    var cached = tooltipCache.get(el);
    if (!cached) {
      var comp = getComputedStyle(el);
      var classes = Array.from(el.classList).filter(function(c) {
        return !c.startsWith('inspector') && !c.startsWith('component-card') && !c.startsWith('preview-');
      });
      var readableName = '';
      if (classes.length > 0) {
        readableName = bemToReadable(classes[0]);
      } else {
        readableName = el.tagName.toLowerCase();
      }

      var w = Math.round(rect.width);
      var h = Math.round(rect.height);
      var bgColor = comp.backgroundColor;
      var fontSize = comp.fontSize;

      var statsHtml = w + '\u00D7' + h;
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        statsHtml += ' <span class="inspector__overlay-tooltip-dot" style="background:' + bgColor + ';"></span>';
      }
      if (fontSize && el.children.length === 0) {
        statsHtml += ' \u00B7 ' + fontSize;
      }

      cached = { name: readableName, stats: statsHtml };
      tooltipCache.set(el, cached);
    }

    overlayTooltipName.textContent = cached.name;
    overlayTooltipStats.innerHTML = cached.stats;
    overlayTooltip.style.display = '';
  }

  function hideOverlay() {
    overlay.classList.remove('inspector__overlay--visible');
    overlayTooltip.style.display = 'none';
    inspectorState.hoveredElement = null;
  }

  // --- Update Changes Badge ---
  function updateChangesBadge() {
    var count = 0;
    Object.keys(inspectorState.pendingOverrides).forEach(function(sel) {
      count += Object.keys(inspectorState.pendingOverrides[sel]).length;
    });
    changesBadge.textContent = count;
  }

  // --- Feature 7: Update Undo/Redo Buttons ---
  function updateUndoRedoButtons() {
    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
  }

  // --- Feature 7: Push to Undo Stack ---
  function pushUndo(element, property, oldValue, newValue, selector) {
    undoStack.push({
      element: element,
      property: property,
      oldValue: oldValue,
      newValue: newValue,
      selector: selector
    });
    redoStack = [];
    updateUndoRedoButtons();
  }

  // --- Feature 7: Undo ---
  function undo() {
    if (undoStack.length === 0) return;
    var entry = undoStack.pop();

    // Revert the element style
    if (entry.oldValue) {
      entry.element.style.setProperty(entry.property, entry.oldValue);
    } else {
      entry.element.style.removeProperty(entry.property);
    }

    // Update pendingOverrides
    if (inspectorState.pendingOverrides[entry.selector]) {
      if (entry.oldValue && entry.oldValue.indexOf('var(') === 0) {
        inspectorState.pendingOverrides[entry.selector][entry.property] = entry.oldValue;
      } else {
        delete inspectorState.pendingOverrides[entry.selector][entry.property];
        if (Object.keys(inspectorState.pendingOverrides[entry.selector]).length === 0) {
          delete inspectorState.pendingOverrides[entry.selector];
        }
      }
    }

    // Update originals tracking
    var originals = inspectorState.modifiedElements.get(entry.element);
    if (originals) {
      // If old value is the original, remove from tracking
      var originalVal = originals[entry.property];
      var currentInline = entry.element.style.getPropertyValue(entry.property) || '';
      if (currentInline === originalVal || (!currentInline && !originalVal)) {
        delete originals[entry.property];
        if (Object.keys(originals).length === 0) {
          inspectorState.modifiedElements.delete(entry.element);
        }
      }
    }

    redoStack.push(entry);
    updateChangesBadge();
    updateUndoRedoButtons();

    // Re-render if currently selected element matches
    if (inspectorState.selectedElement === entry.element) {
      renderProperties(inspectorState.selectedElement);
    }
  }

  // --- Feature 7: Redo ---
  function redo() {
    if (redoStack.length === 0) return;
    var entry = redoStack.pop();

    // Re-apply the change
    entry.element.style.setProperty(entry.property, entry.newValue);

    // Track in pendingOverrides
    if (!inspectorState.pendingOverrides[entry.selector]) {
      inspectorState.pendingOverrides[entry.selector] = {};
    }
    inspectorState.pendingOverrides[entry.selector][entry.property] = entry.newValue;

    // Track originals
    if (!inspectorState.modifiedElements.has(entry.element)) {
      inspectorState.modifiedElements.set(entry.element, {});
    }
    var originals = inspectorState.modifiedElements.get(entry.element);
    if (!(entry.property in originals)) {
      originals[entry.property] = entry.oldValue;
    }

    undoStack.push(entry);
    updateChangesBadge();
    updateUndoRedoButtons();

    if (inspectorState.selectedElement === entry.element) {
      renderProperties(inspectorState.selectedElement);
    }
  }

  // --- Render Selection Info ---
  function renderSelectionInfo(el) {
    var classes = Array.from(el.classList).filter(function(c) {
      return !c.startsWith('inspector');
    });

    var html = '<div class="inspector__selection-info">';
    html += '<span class="inspector__selection-tag">&lt;' + el.tagName.toLowerCase() + '&gt;</span>';
    if (classes.length) {
      html += '<div class="inspector__selection-classes">';
      classes.forEach(function(c) {
        html += '<span class="inspector__selection-class">.' + c + '</span>';
      });
      html += '</div>';
    }
    html += '</div>';
    selectionArea.innerHTML = html;
  }

  function renderEmptyState() {
    selectionArea.innerHTML =
      '<div class="inspector__empty-state">' +
        '<i data-lucide="mouse-pointer-click"></i>' +
        '<p>Click an element inside a preview area to inspect it</p>' +
      '</div>';
    refreshLucideIcons();
  }

  // --- Feature 3: Render Color Grid Widget ---
  function renderColorGrid(property, computedValue, element) {
    var container = document.createElement('div');
    container.className = 'inspector__color-picker';
    container.setAttribute('data-property', property);

    var currentTokenName = REVERSE_TOKEN_MAP[computedValue] || null;
    var selector = resolveSelector(element);
    var isModified = inspectorState.pendingOverrides[selector] && inspectorState.pendingOverrides[selector][property];
    if (isModified) {
      container.classList.add('inspector__property--modified');
    }

    // Friendly label
    var friendlyName = FRIENDLY_NAMES[property] || property;

    // Current value display
    var currentDisplay = document.createElement('div');
    currentDisplay.className = 'inspector__color-current';

    var currentSwatch = document.createElement('div');
    currentSwatch.className = 'inspector__color-current-swatch';
    currentSwatch.style.backgroundColor = computedValue;

    var currentInfo = document.createElement('div');
    currentInfo.className = 'inspector__color-current-info';

    var nameLabel = document.createElement('div');
    nameLabel.className = 'inspector__color-current-name';
    nameLabel.textContent = friendlyName;

    var tokenLabel = document.createElement('div');
    tokenLabel.className = 'inspector__color-current-token';
    tokenLabel.textContent = currentTokenName ? tokenDisplayName(currentTokenName) : truncateValue(computedValue, 24);

    currentInfo.appendChild(nameLabel);
    currentInfo.appendChild(tokenLabel);

    var chevron = document.createElement('i');
    chevron.setAttribute('data-lucide', 'chevron-down');
    chevron.className = 'inspector__color-chevron';

    currentDisplay.appendChild(currentSwatch);
    currentDisplay.appendChild(currentInfo);
    currentDisplay.appendChild(chevron);

    // Grid panel
    var gridPanel = document.createElement('div');
    gridPanel.className = 'inspector__color-grid';

    COLOR_SECTIONS.forEach(function(section) {
      var sectionEl = document.createElement('div');
      sectionEl.className = 'inspector__color-grid-section';

      var sectionLabel = document.createElement('div');
      sectionLabel.className = 'inspector__color-grid-label';
      sectionLabel.textContent = section.label;

      var swatchesContainer = document.createElement('div');
      swatchesContainer.className = 'inspector__color-grid-swatches';

      section.tokens.forEach(function(tokenKey) {
        var hexVal = TOKEN_CATEGORIES.colors[tokenKey];
        if (!hexVal) return;

        var swatch = document.createElement('button');
        swatch.className = 'inspector__color-grid-swatch';
        swatch.style.backgroundColor = hexVal;
        swatch.title = tokenDisplayName(tokenKey);

        if (tokenKey === currentTokenName) {
          swatch.classList.add('inspector__color-grid-swatch--active');
        }

        swatch.addEventListener('click', function(e) {
          e.stopPropagation();
          var tokenVar = 'var(' + tokenKey + ')';
          applyPropertyChange(element, property, tokenVar);

          // Update current swatch
          var rgb = resolveColorToRgb(hexVal);
          currentSwatch.style.backgroundColor = rgb || hexVal;
          tokenLabel.textContent = tokenDisplayName(tokenKey);

          // Update active states
          var allSwatches = gridPanel.querySelectorAll('.inspector__color-grid-swatch');
          allSwatches.forEach(function(s) { s.classList.remove('inspector__color-grid-swatch--active'); });
          swatch.classList.add('inspector__color-grid-swatch--active');
        });

        swatchesContainer.appendChild(swatch);
      });

      sectionEl.appendChild(sectionLabel);
      sectionEl.appendChild(swatchesContainer);
      gridPanel.appendChild(sectionEl);
    });

    // Toggle grid on click
    currentDisplay.addEventListener('click', function() {
      container.classList.toggle('inspector__color-picker--open');
    });

    container.appendChild(currentDisplay);
    container.appendChild(gridPanel);

    return container;
  }

  // --- Feature 4: Render Box Model Widget ---
  function renderBoxModel(paddingProps, marginProps, element) {
    var container = document.createElement('div');
    container.className = 'inspector__boxmodel';

    var computed = getComputedStyle(element);
    var selector = resolveSelector(element);

    // Build the nested box model structure
    var marginBox = document.createElement('div');
    marginBox.className = 'inspector__boxmodel-margin';

    var marginLabel = document.createElement('span');
    marginLabel.className = 'inspector__boxmodel-label';
    marginLabel.textContent = 'margin';
    marginBox.appendChild(marginLabel);

    var paddingBox = document.createElement('div');
    paddingBox.className = 'inspector__boxmodel-padding';

    var paddingLabel = document.createElement('span');
    paddingLabel.className = 'inspector__boxmodel-label';
    paddingLabel.textContent = 'padding';
    paddingBox.appendChild(paddingLabel);

    var elementCenter = document.createElement('div');
    elementCenter.className = 'inspector__boxmodel-element';
    elementCenter.textContent = 'element';
    paddingBox.appendChild(elementCenter);

    // Helper to get display value for a spacing property
    function getSpacingDisplay(prop) {
      var val = computed.getPropertyValue(prop).trim();
      var token = REVERSE_TOKEN_MAP[val];
      return token ? tokenDisplayName(token) : val;
    }

    // Helper to check if a property is modified
    function isModified(prop) {
      return inspectorState.pendingOverrides[selector] && inspectorState.pendingOverrides[selector][prop];
    }

    // Helper to create a clickable value
    function createValue(prop, side, parentBox) {
      var val = computed.getPropertyValue(prop).trim();
      if (val === '0px') val = '0';
      var display = getSpacingDisplay(prop);
      var valueEl = document.createElement('button');
      valueEl.className = 'inspector__boxmodel-value inspector__boxmodel-value--' + side;
      if (isModified(prop)) {
        valueEl.classList.add('inspector__boxmodel-value--modified');
      }
      valueEl.textContent = display;
      valueEl.title = prop + ': ' + val;

      valueEl.addEventListener('click', function(e) {
        e.stopPropagation();
        // Close any existing dropdowns
        closeBoxModelDropdowns();
        showBoxModelDropdown(valueEl, prop, element, parentBox);
      });

      parentBox.appendChild(valueEl);
      return valueEl;
    }

    // Create margin values
    var marginSides = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'];
    var marginSideNames = ['top', 'right', 'bottom', 'left'];
    marginSides.forEach(function(prop, i) {
      var val = computed.getPropertyValue(prop).trim();
      if (val !== '0px' && val !== 'auto') {
        createValue(prop, marginSideNames[i], marginBox);
      } else {
        // Show zero / auto placeholder
        var placeholder = document.createElement('span');
        placeholder.className = 'inspector__boxmodel-value inspector__boxmodel-value--' + marginSideNames[i];
        placeholder.textContent = val === 'auto' ? 'auto' : '0';
        placeholder.style.opacity = '0.4';
        placeholder.style.cursor = 'pointer';
        placeholder.addEventListener('click', function(e) {
          e.stopPropagation();
          closeBoxModelDropdowns();
          showBoxModelDropdown(placeholder, prop, element, marginBox);
        });
        marginBox.appendChild(placeholder);
      }
    });

    // Create padding values
    var paddingSides = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
    var paddingSideNames = ['top', 'right', 'bottom', 'left'];
    paddingSides.forEach(function(prop, i) {
      var val = computed.getPropertyValue(prop).trim();
      if (val !== '0px') {
        createValue(prop, paddingSideNames[i], paddingBox);
      } else {
        var placeholder = document.createElement('span');
        placeholder.className = 'inspector__boxmodel-value inspector__boxmodel-value--' + paddingSideNames[i];
        placeholder.textContent = '0';
        placeholder.style.opacity = '0.4';
        placeholder.style.cursor = 'pointer';
        placeholder.addEventListener('click', function(e) {
          e.stopPropagation();
          closeBoxModelDropdowns();
          showBoxModelDropdown(placeholder, prop, element, paddingBox);
        });
        paddingBox.appendChild(placeholder);
      }
    });

    marginBox.appendChild(paddingBox);
    container.appendChild(marginBox);

    return container;
  }

  function closeBoxModelDropdowns() {
    var existing = document.querySelectorAll('.inspector__boxmodel-dropdown');
    existing.forEach(function(dd) { dd.remove(); });
  }

  function showBoxModelDropdown(anchorEl, property, element, parentBox) {
    var dropdown = document.createElement('div');
    dropdown.className = 'inspector__boxmodel-dropdown';

    var tokens = TOKEN_CATEGORIES.spacing;
    var sortedTokens = Object.keys(tokens);

    sortedTokens.forEach(function(tn) {
      var btn = document.createElement('button');
      btn.className = 'inspector__boxmodel-dropdown-option';

      var currentVal = getComputedStyle(element).getPropertyValue(property).trim();
      var currentToken = REVERSE_TOKEN_MAP[currentVal];
      if (currentToken === tn) {
        btn.classList.add('inspector__boxmodel-dropdown-option--active');
      }

      var pxVal = remToPx(tokens[tn]) || tokens[tn];
      btn.textContent = tokenDisplayName(tn) + ' (' + pxVal + ')';

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        applyPropertyChange(element, property, 'var(' + tn + ')');
        // Update the value display
        anchorEl.textContent = tokenDisplayName(tn);
        anchorEl.style.opacity = '';
        anchorEl.classList.add('inspector__boxmodel-value--modified');
        closeBoxModelDropdowns();
      });

      dropdown.appendChild(btn);
    });

    // Position the dropdown
    var rect = anchorEl.getBoundingClientRect();
    var parentRect = parentBox.getBoundingClientRect();
    dropdown.style.position = 'absolute';
    dropdown.style.top = (rect.bottom - parentRect.top + 2) + 'px';
    dropdown.style.left = (rect.left - parentRect.left) + 'px';
    dropdown.style.zIndex = '9999';

    parentBox.style.position = 'relative';
    parentBox.appendChild(dropdown);

    // Close on outside click
    function handleOutsideClick(e) {
      if (!dropdown.contains(e.target) && e.target !== anchorEl) {
        dropdown.remove();
        document.removeEventListener('click', handleOutsideClick, true);
      }
    }
    setTimeout(function() {
      document.addEventListener('click', handleOutsideClick, true);
    }, 0);
  }

  // --- Feature 5: Render Corner Radius Widget ---
  function renderCornerWidget(radiusProps, element) {
    var container = document.createElement('div');
    container.className = 'inspector__corners';

    var computed = getComputedStyle(element);
    var selector = resolveSelector(element);

    var corners = {
      tl: { prop: 'border-top-left-radius', label: 'TL' },
      tr: { prop: 'border-top-right-radius', label: 'TR' },
      bl: { prop: 'border-bottom-left-radius', label: 'BL' },
      br: { prop: 'border-bottom-right-radius', label: 'BR' }
    };

    // Check if all corners are equal
    var tlVal = computed.getPropertyValue('border-top-left-radius').trim();
    var trVal = computed.getPropertyValue('border-top-right-radius').trim();
    var blVal = computed.getPropertyValue('border-bottom-left-radius').trim();
    var brVal = computed.getPropertyValue('border-bottom-right-radius').trim();
    var allEqual = (tlVal === trVal && trVal === blVal && blVal === brVal);
    var isLinked = allEqual;

    var grid = document.createElement('div');
    grid.className = 'inspector__corners-container';

    // Preview rect
    var preview = document.createElement('div');
    preview.className = 'inspector__corners-preview';
    preview.style.borderTopLeftRadius = tlVal;
    preview.style.borderTopRightRadius = trVal;
    preview.style.borderBottomLeftRadius = blVal;
    preview.style.borderBottomRightRadius = brVal;

    // Helper: get display name for radius value
    function getRadiusDisplay(val) {
      var token = REVERSE_TOKEN_MAP[val];
      return token ? tokenDisplayName(token) : val;
    }

    // Corner value buttons
    var cornerButtons = {};
    var cornerPositions = ['tl', 'tr', 'bl', 'br'];
    var cornerVals = { tl: tlVal, tr: trVal, bl: blVal, br: brVal };

    cornerPositions.forEach(function(pos) {
      var corner = corners[pos];
      var val = cornerVals[pos];
      var btn = document.createElement('button');
      btn.className = 'inspector__corners-value inspector__corners-value--' + pos;
      btn.textContent = getRadiusDisplay(val);
      btn.title = corner.prop + ': ' + val;

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeCornerDropdowns();
        showCornerDropdown(btn, corner.prop, pos, element, grid);
      });

      cornerButtons[pos] = btn;
      grid.appendChild(btn);
    });

    grid.appendChild(preview);

    // Link/unlink toggle
    var linkBtn = document.createElement('button');
    linkBtn.className = 'inspector__corners-link' + (isLinked ? ' inspector__corners-link--active' : '');
    linkBtn.innerHTML = '<i data-lucide="' + (isLinked ? 'link' : 'unlink') + '"></i>';
    linkBtn.title = isLinked ? 'Corners linked (click to unlink)' : 'Corners unlinked (click to link)';

    linkBtn.addEventListener('click', function() {
      isLinked = !isLinked;
      linkBtn.className = 'inspector__corners-link' + (isLinked ? ' inspector__corners-link--active' : '');
      linkBtn.innerHTML = '<i data-lucide="' + (isLinked ? 'link' : 'unlink') + '"></i>';
      linkBtn.title = isLinked ? 'Corners linked (click to unlink)' : 'Corners unlinked (click to link)';
      refreshLucideIcons();
    });

    grid.appendChild(linkBtn);
    container.appendChild(grid);

    // Store isLinked state and references on container for dropdown access
    container._isLinked = function() { return isLinked; };
    container._cornerButtons = cornerButtons;
    container._preview = preview;

    return container;
  }

  function closeCornerDropdowns() {
    var existing = document.querySelectorAll('.inspector__boxmodel-dropdown');
    existing.forEach(function(dd) { dd.remove(); });
  }

  function showCornerDropdown(anchorEl, property, position, element, gridContainer) {
    var dropdown = document.createElement('div');
    dropdown.className = 'inspector__boxmodel-dropdown';

    var tokens = TOKEN_CATEGORIES.radius;
    var sortedTokens = Object.keys(tokens);

    sortedTokens.forEach(function(tn) {
      var btn = document.createElement('button');
      btn.className = 'inspector__boxmodel-dropdown-option';

      var currentVal = getComputedStyle(element).getPropertyValue(property).trim();
      var currentToken = REVERSE_TOKEN_MAP[currentVal];
      if (currentToken === tn) {
        btn.classList.add('inspector__boxmodel-dropdown-option--active');
      }

      var displayVal = tokens[tn];
      if (displayVal.endsWith('rem')) {
        displayVal = remToPx(displayVal) || displayVal;
      }
      btn.textContent = tokenDisplayName(tn) + ' (' + displayVal + ')';

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var tokenVar = 'var(' + tn + ')';
        var cornersContainer = gridContainer.closest('.inspector__corners');

        // Check if linked
        var linked = cornersContainer && cornersContainer._isLinked && cornersContainer._isLinked();

        if (linked) {
          // Apply to all corners
          var allProps = ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius'];
          allProps.forEach(function(p) {
            applyPropertyChange(element, p, tokenVar);
          });
          // Update all corner buttons
          var cornerBtns = cornersContainer._cornerButtons;
          if (cornerBtns) {
            Object.keys(cornerBtns).forEach(function(pos) {
              cornerBtns[pos].textContent = tokenDisplayName(tn);
            });
          }
          // Update preview
          if (cornersContainer._preview) {
            var pxVal = tokens[tn];
            if (pxVal.endsWith('rem')) pxVal = remToPx(pxVal) || pxVal;
            cornersContainer._preview.style.borderRadius = pxVal;
          }
        } else {
          // Apply to this corner only
          applyPropertyChange(element, property, tokenVar);
          anchorEl.textContent = tokenDisplayName(tn);
          // Update preview for this corner
          if (cornersContainer._preview) {
            var pxVal2 = tokens[tn];
            if (pxVal2.endsWith('rem')) pxVal2 = remToPx(pxVal2) || pxVal2;
            var cssPropMap = {
              'border-top-left-radius': 'borderTopLeftRadius',
              'border-top-right-radius': 'borderTopRightRadius',
              'border-bottom-left-radius': 'borderBottomLeftRadius',
              'border-bottom-right-radius': 'borderBottomRightRadius'
            };
            cornersContainer._preview.style[cssPropMap[property]] = pxVal2;
          }
        }

        closeCornerDropdowns();
      });

      dropdown.appendChild(btn);
    });

    // Position
    var rect = anchorEl.getBoundingClientRect();
    var parentRect = gridContainer.getBoundingClientRect();
    dropdown.style.position = 'absolute';
    dropdown.style.top = (rect.bottom - parentRect.top + 2) + 'px';
    dropdown.style.left = (rect.left - parentRect.left) + 'px';
    dropdown.style.zIndex = '9999';

    gridContainer.style.position = 'relative';
    gridContainer.appendChild(dropdown);

    function handleOutsideClick(e) {
      if (!dropdown.contains(e.target) && e.target !== anchorEl) {
        dropdown.remove();
        document.removeEventListener('click', handleOutsideClick, true);
      }
    }
    setTimeout(function() {
      document.addEventListener('click', handleOutsideClick, true);
    }, 0);
  }

  // --- Render Property Row (v2 with friendly names + per-property reset) ---
  function renderPropertyRow(property, computedValue, element) {
    var row = document.createElement('div');
    row.className = 'inspector__property';
    row.setAttribute('data-property', property);

    var selector = resolveSelector(element);
    if (inspectorState.pendingOverrides[selector] && inspectorState.pendingOverrides[selector][property]) {
      row.classList.add('inspector__property--modified');
    }

    // Friendly name column
    var nameEl = document.createElement('span');
    nameEl.className = 'inspector__property-name';

    var friendlyLabel = document.createElement('span');
    friendlyLabel.className = 'inspector__property-name-label';
    friendlyLabel.textContent = FRIENDLY_NAMES[property] || property;

    var cssLabel = document.createElement('span');
    cssLabel.className = 'inspector__property-name-css';
    cssLabel.textContent = property;

    nameEl.appendChild(friendlyLabel);
    nameEl.appendChild(cssLabel);
    nameEl.title = property;

    var valueEl = document.createElement('div');
    valueEl.className = 'inspector__property-value';

    var tokenName = REVERSE_TOKEN_MAP[computedValue] || null;
    var tokenCategory = PROPERTY_TOKEN_MAP[property] || null;

    if (tokenCategory && TOKEN_CATEGORIES[tokenCategory]) {
      // Color swatch for color properties
      if (tokenCategory === 'colors') {
        var swatch = document.createElement('span');
        swatch.className = 'inspector__color-swatch';
        swatch.style.backgroundColor = computedValue;
        valueEl.appendChild(swatch);
      }

      var select = document.createElement('select');
      select.className = 'inspector__property-select';

      var currentOpt = document.createElement('option');
      currentOpt.value = '';
      currentOpt.textContent = tokenName
        ? tokenDisplayName(tokenName)
        : truncateValue(computedValue, 20);
      select.appendChild(currentOpt);

      var sep = document.createElement('option');
      sep.disabled = true;
      sep.textContent = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';
      select.appendChild(sep);

      var tokens = TOKEN_CATEGORIES[tokenCategory];
      var sortedTokens = Object.keys(tokens).sort();
      sortedTokens.forEach(function(tn) {
        var opt = document.createElement('option');
        opt.value = 'var(' + tn + ')';
        var displayVal = tokens[tn];
        if (displayVal.length > 16) displayVal = displayVal.substring(0, 16) + '...';
        opt.textContent = tokenDisplayName(tn) + '  \u2192 ' + displayVal;
        if (tn === tokenName) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener('change', function() {
        if (!select.value) return;
        applyPropertyChange(element, property, select.value);
        if (tokenCategory === 'colors' && swatch) {
          var tempDiv = document.createElement('div');
          tempDiv.style.display = 'none';
          tempDiv.style.color = select.value;
          document.body.appendChild(tempDiv);
          swatch.style.backgroundColor = getComputedStyle(tempDiv).color;
          document.body.removeChild(tempDiv);
        }
      });

      valueEl.appendChild(select);
    } else if (CSS_VALUE_OPTIONS[property]) {
      var kwSelect = document.createElement('select');
      kwSelect.className = 'inspector__property-select';

      var kwOptions = CSS_VALUE_OPTIONS[property];
      kwOptions.forEach(function(val) {
        var opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        if (val === computedValue) opt.selected = true;
        kwSelect.appendChild(opt);
      });

      if (kwOptions.indexOf(computedValue) === -1) {
        var curOpt = document.createElement('option');
        curOpt.value = computedValue;
        curOpt.textContent = truncateValue(computedValue, 20) + ' (current)';
        curOpt.selected = true;
        kwSelect.insertBefore(curOpt, kwSelect.firstChild);
      }

      kwSelect.addEventListener('change', function() {
        applyPropertyChange(element, property, kwSelect.value);
      });

      valueEl.appendChild(kwSelect);
    } else {
      var span = document.createElement('span');
      span.className = 'inspector__property-readonly';
      span.textContent = truncateValue(computedValue, 40);
      span.title = computedValue;
      valueEl.appendChild(span);
    }

    // Feature 7: Per-property reset button
    var resetBtnEl = document.createElement('button');
    resetBtnEl.className = 'inspector__property-reset';
    resetBtnEl.innerHTML = '<i data-lucide="x"></i>';
    resetBtnEl.title = 'Reset this property';
    resetBtnEl.addEventListener('click', function(e) {
      e.stopPropagation();
      resetSingleProperty(element, property);
    });

    row.appendChild(nameEl);
    row.appendChild(valueEl);
    row.appendChild(resetBtnEl);

    return row;
  }

  // --- Feature 7: Reset a single property ---
  function resetSingleProperty(element, property) {
    var originals = inspectorState.modifiedElements.get(element);
    if (!originals || !(property in originals)) return;

    var selector = resolveSelector(element);
    var currentValue = inspectorState.pendingOverrides[selector] ? inspectorState.pendingOverrides[selector][property] : '';
    var originalValue = originals[property];

    // Revert
    if (originalValue) {
      element.style.setProperty(property, originalValue);
    } else {
      element.style.removeProperty(property);
    }

    // Push undo entry for the reset itself (so the reset is undoable)
    pushUndo(element, property, currentValue, originalValue, selector);

    // Clean up tracking
    delete originals[property];
    if (Object.keys(originals).length === 0) {
      inspectorState.modifiedElements.delete(element);
    }

    // Clean up pendingOverrides
    if (inspectorState.pendingOverrides[selector]) {
      delete inspectorState.pendingOverrides[selector][property];
      if (Object.keys(inspectorState.pendingOverrides[selector]).length === 0) {
        delete inspectorState.pendingOverrides[selector];
      }
    }

    updateChangesBadge();

    // Re-render
    if (inspectorState.selectedElement === element) {
      renderProperties(element);
    }
  }

  // --- Render Properties for Element (v2 with widgets) ---
  function renderProperties(el) {
    propertiesArea.innerHTML = '';
    var computed = getComputedStyle(el);

    PROPERTY_GROUPS.forEach(function(group) {
      var meaningfulProps = [];

      group.properties.forEach(function(prop) {
        var val = computed.getPropertyValue(prop);
        if (val) val = val.trim();
        if (isPropertyMeaningful(prop, val)) {
          meaningfulProps.push({ name: prop, value: val });
        }
      });

      if (meaningfulProps.length === 0) return;

      var groupEl = document.createElement('div');
      groupEl.className = 'inspector__group';
      groupEl.setAttribute('data-group', group.name);

      var friendlyGroupName = FRIENDLY_GROUP_NAMES[group.name] || group.name;

      var header = document.createElement('div');
      header.className = 'inspector__group-header';
      header.innerHTML =
        '<i data-lucide="chevron-down"></i>' +
        '<span class="inspector__group-title">' + friendlyGroupName + '</span>' +
        '<span class="inspector__group-count">' + meaningfulProps.length + '</span>';

      header.addEventListener('click', function() {
        groupEl.classList.toggle('inspector__group--collapsed');
        refreshLucideIcons();
      });

      var body = document.createElement('div');
      body.className = 'inspector__group-body';

      // --- Feature 3: Color Grid for Colors group ---
      if (group.name === 'Colors') {
        meaningfulProps.forEach(function(p) {
          if (PROPERTY_TOKEN_MAP[p.name] === 'colors') {
            var colorGrid = renderColorGrid(p.name, p.value, el);
            body.appendChild(colorGrid);
          } else {
            var row = renderPropertyRow(p.name, p.value, el);
            body.appendChild(row);
          }
        });
      }
      // --- Feature 4: Box Model for Spacing group ---
      else if (group.name === 'Spacing') {
        var paddingProps = [];
        var marginProps = [];
        var otherProps = [];

        meaningfulProps.forEach(function(p) {
          if (p.name.startsWith('padding-')) paddingProps.push(p);
          else if (p.name.startsWith('margin-')) marginProps.push(p);
          else otherProps.push(p);
        });

        // Only show box model if we have padding OR margin properties
        if (paddingProps.length > 0 || marginProps.length > 0) {
          var boxModel = renderBoxModel(paddingProps, marginProps, el);
          body.appendChild(boxModel);
        }

        // Render remaining spacing properties (width, height, gap, etc.) as rows
        otherProps.forEach(function(p) {
          var row = renderPropertyRow(p.name, p.value, el);
          body.appendChild(row);
        });
      }
      // --- Feature 5: Corner Widget for Borders group ---
      else if (group.name === 'Borders') {
        var radiusProps = [];
        var otherBorderProps = [];

        meaningfulProps.forEach(function(p) {
          if (p.name.includes('radius')) radiusProps.push(p);
          else otherBorderProps.push(p);
        });

        // Show corner widget if any radius properties exist
        if (radiusProps.length > 0) {
          var cornerWidget = renderCornerWidget(radiusProps, el);
          body.appendChild(cornerWidget);
        }

        // Render other border props as regular rows
        otherBorderProps.forEach(function(p) {
          var row = renderPropertyRow(p.name, p.value, el);
          body.appendChild(row);
        });
      }
      // --- Default: render rows with friendly names ---
      else {
        meaningfulProps.forEach(function(p) {
          var row = renderPropertyRow(p.name, p.value, el);
          body.appendChild(row);
        });
      }

      groupEl.appendChild(header);
      groupEl.appendChild(body);
      propertiesArea.appendChild(groupEl);
    });

    refreshLucideIcons();

    // Re-apply search filter if active
    if (searchInput && searchInput.value.trim()) {
      applySearchFilter(searchInput.value.trim());
    }
  }

  // --- Apply Property Change (v2 with undo stack) ---
  function applyPropertyChange(element, property, tokenValue) {
    var selector = resolveSelector(element);

    // Track original value for reset
    if (!inspectorState.modifiedElements.has(element)) {
      inspectorState.modifiedElements.set(element, {});
    }
    var originals = inspectorState.modifiedElements.get(element);
    if (!(property in originals)) {
      originals[property] = element.style.getPropertyValue(property) || '';
    }

    // Get old value for undo
    var oldValue = element.style.getPropertyValue(property) || '';

    // Apply inline style
    element.style.setProperty(property, tokenValue);

    // Track in pending overrides
    if (!inspectorState.pendingOverrides[selector]) {
      inspectorState.pendingOverrides[selector] = {};
    }
    inspectorState.pendingOverrides[selector][property] = tokenValue;

    // Push to undo stack
    pushUndo(element, property, oldValue, tokenValue, selector);

    // Update UI
    updateChangesBadge();

    // Mark property row as modified
    var row = propertiesArea.querySelector('[data-property="' + property + '"]');
    if (row) row.classList.add('inspector__property--modified');
  }

  // --- Select Element ---
  function selectElement(el) {
    if (inspectorState.selectedElement) {
      inspectorState.selectedElement.classList.remove('inspector__selected-outline');
    }

    inspectorState.selectedElement = el;
    el.classList.add('inspector__selected-outline');

    // Clear search on new selection
    if (searchInput) searchInput.value = '';

    renderSelectionInfo(el);
    renderProperties(el);
    refreshLucideIcons();
  }

  // --- Reset All Changes ---
  function resetAllChanges() {
    inspectorState.modifiedElements.forEach(function(originals, element) {
      Object.keys(originals).forEach(function(prop) {
        if (originals[prop]) {
          element.style.setProperty(prop, originals[prop]);
        } else {
          element.style.removeProperty(prop);
        }
      });
    });

    inspectorState.modifiedElements.clear();
    inspectorState.pendingOverrides = {};
    undoStack = [];
    redoStack = [];
    updateChangesBadge();
    updateUndoRedoButtons();

    if (inspectorState.selectedElement) {
      renderProperties(inspectorState.selectedElement);
    }
  }

  // --- Feature 1: Search Filter ---
  var searchDebounceTimer = null;

  function applySearchFilter(query) {
    var q = query.toLowerCase();
    var groups = propertiesArea.querySelectorAll('.inspector__group');

    groups.forEach(function(groupEl) {
      var groupName = groupEl.getAttribute('data-group') || '';
      var friendlyGroupName = FRIENDLY_GROUP_NAMES[groupName] || groupName;
      var groupMatches = friendlyGroupName.toLowerCase().indexOf(q) !== -1 ||
                         groupName.toLowerCase().indexOf(q) !== -1;

      var rows = groupEl.querySelectorAll('.inspector__property, .inspector__color-picker, .inspector__boxmodel, .inspector__corners');
      var visibleCount = 0;

      rows.forEach(function(row) {
        var prop = row.getAttribute('data-property') || '';
        var friendlyName = FRIENDLY_NAMES[prop] || prop;
        var matches = groupMatches ||
                      friendlyName.toLowerCase().indexOf(q) !== -1 ||
                      prop.toLowerCase().indexOf(q) !== -1;

        // For widgets (boxmodel, corners), check all related property names
        if (row.classList.contains('inspector__boxmodel')) {
          matches = groupMatches || 'padding'.indexOf(q) !== -1 || 'margin'.indexOf(q) !== -1 || 'box model'.indexOf(q) !== -1;
        }
        if (row.classList.contains('inspector__corners')) {
          matches = groupMatches || 'radius'.indexOf(q) !== -1 || 'corner'.indexOf(q) !== -1 || 'rounded'.indexOf(q) !== -1;
        }

        if (matches) {
          row.classList.remove('inspector__property--hidden');
          visibleCount++;
        } else {
          row.classList.add('inspector__property--hidden');
        }
      });

      if (visibleCount === 0 && !groupMatches) {
        groupEl.classList.add('inspector__group--hidden');
      } else {
        groupEl.classList.remove('inspector__group--hidden');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      clearTimeout(searchDebounceTimer);
      var q = searchInput.value.trim();
      searchDebounceTimer = setTimeout(function() {
        if (!q) {
          // Show all
          var groups = propertiesArea.querySelectorAll('.inspector__group');
          groups.forEach(function(g) { g.classList.remove('inspector__group--hidden'); });
          var rows = propertiesArea.querySelectorAll('.inspector__property, .inspector__color-picker, .inspector__boxmodel, .inspector__corners');
          rows.forEach(function(r) { r.classList.remove('inspector__property--hidden'); });
          return;
        }
        applySearchFilter(q);
      }, 100);
    });
  }

  // --- Feature 7: Keyboard Shortcuts ---
  document.addEventListener('keydown', function(e) {
    if (!inspectorState.isOpen) return;

    // Don't intercept if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    var isMeta = e.metaKey || e.ctrlKey;

    if (isMeta && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (isMeta && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      redo();
    }
  });

  // --- Export Modal ---
  function showExportModal(cssContent) {
    var existingBackdrop = document.querySelector('[data-modal-backdrop="inspector-export"]');
    if (existingBackdrop) existingBackdrop.remove();
    var existingModal = document.querySelector('[data-modal="inspector-export"]');
    if (existingModal) existingModal.remove();

    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop--visible';
    backdrop.setAttribute('data-modal-backdrop', 'inspector-export');

    var modal = document.createElement('div');
    modal.className = 'modal modal--lg modal--visible';
    modal.setAttribute('data-modal', 'inspector-export');

    modal.innerHTML =
      '<div class="modal__header">' +
        '<h3 class="modal__title">Export Overrides CSS</h3>' +
        '<button class="btn btn--ghost btn--icon" data-modal-close="inspector-export">' +
          '<i data-lucide="x"></i>' +
        '</button>' +
      '</div>' +
      '<div class="modal__body">' +
        '<p style="color: var(--color-neutral-600); margin-bottom: var(--space-3); font-size: var(--text-sm);">' +
          'Save this CSS to <code style="font-family: var(--font-family-mono); background: var(--color-neutral-100); padding: 2px 6px; border-radius: 6px;">css/overrides.css</code> to persist your changes.' +
        '</p>' +
        '<pre class="inspector__export-code"><code>' + escapeHtml(cssContent) + '</code></pre>' +
      '</div>' +
      '<div class="modal__footer">' +
        '<button class="btn btn--ghost" data-modal-close="inspector-export">Close</button>' +
        '<button class="btn btn--secondary" id="inspector-download-btn">' +
          '<i data-lucide="download"></i> Download File' +
        '</button>' +
        '<button class="btn btn--primary" id="inspector-copy-btn">' +
          '<i data-lucide="copy"></i> Copy to Clipboard' +
        '</button>' +
      '</div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    refreshLucideIcons();

    document.getElementById('inspector-copy-btn').addEventListener('click', function() {
      navigator.clipboard.writeText(cssContent).then(function() {
        var btn = document.getElementById('inspector-copy-btn');
        btn.innerHTML = '<i data-lucide="check"></i> Copied!';
        refreshLucideIcons();
        setTimeout(function() {
          btn.innerHTML = '<i data-lucide="copy"></i> Copy to Clipboard';
          refreshLucideIcons();
        }, 2000);
      });
    });

    document.getElementById('inspector-download-btn').addEventListener('click', function() {
      var blob = new Blob([cssContent], { type: 'text/css' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'overrides.css';
      a.click();
      URL.revokeObjectURL(url);
    });

    backdrop.addEventListener('click', function() {
      closeExportModal();
    });
  }

  function closeExportModal() {
    var backdrop = document.querySelector('[data-modal-backdrop="inspector-export"]');
    var modal = document.querySelector('[data-modal="inspector-export"]');
    if (backdrop) backdrop.remove();
    if (modal) modal.remove();
    document.body.style.overflow = '';
  }

  // --- Toggle Panel ---
  toggleBtn.addEventListener('click', function() {
    inspectorState.isOpen = !inspectorState.isOpen;
    panel.classList.toggle('inspector--visible', inspectorState.isOpen);
    document.querySelector('.library').classList.toggle('library--inspector-open', inspectorState.isOpen);

    if (!inspectorState.isOpen) {
      hideOverlay();
      if (inspectorState.selectedElement) {
        inspectorState.selectedElement.classList.remove('inspector__selected-outline');
      }
    }
  });

  closeBtn.addEventListener('click', function() {
    inspectorState.isOpen = false;
    panel.classList.remove('inspector--visible');
    document.querySelector('.library').classList.remove('library--inspector-open');
    hideOverlay();
    if (inspectorState.selectedElement) {
      inspectorState.selectedElement.classList.remove('inspector__selected-outline');
    }
  });

  // --- Hover Handler ---
  document.addEventListener('mousemove', function(e) {
    if (!inspectorState.isOpen) return;
    if (e.target.closest('.inspector') || e.target.closest('#inspector-toggle')) return;

    var previewArea = e.target.closest('.component-card__preview');
    if (!previewArea) {
      hideOverlay();
      return;
    }

    var target = e.target;
    if (target === previewArea) {
      hideOverlay();
      return;
    }

    if (target.closest('.inspector__overlay')) return;

    showOverlay(target);
  });

  // --- Click Handler (Capture Phase) ---
  document.addEventListener('click', function(e) {
    if (!inspectorState.isOpen) return;
    if (e.target.closest('.inspector') || e.target.closest('#inspector-toggle')) return;

    if (e.target.closest('[data-modal-close="inspector-export"]')) {
      closeExportModal();
      return;
    }

    var previewArea = e.target.closest('.component-card__preview');
    if (!previewArea) return;

    var target = e.target;
    if (target === previewArea) return;
    if (target.closest('.inspector__overlay')) return;

    e.preventDefault();
    e.stopPropagation();

    selectElement(target);
  }, true);

  // --- Reset Handler ---
  resetBtn.addEventListener('click', resetAllChanges);

  // --- Undo/Redo Handlers ---
  if (undoBtn) {
    undoBtn.addEventListener('click', function() { undo(); });
  }
  if (redoBtn) {
    redoBtn.addEventListener('click', function() { redo(); });
  }

  // --- Export Handler ---
  exportBtn.addEventListener('click', function() {
    var count = 0;
    Object.keys(inspectorState.pendingOverrides).forEach(function(sel) {
      count += Object.keys(inspectorState.pendingOverrides[sel]).length;
    });
    if (count === 0) return;
    var css = generateOverridesCSS();
    showExportModal(css);
  });
}
