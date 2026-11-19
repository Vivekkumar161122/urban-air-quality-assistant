/**
 * Accessibility (a11y) Helpers for Urban Air Quality Assistant.
 * Provides screen reader live region announcements, keyboard trap for modals,
 * and high-contrast focus management.
 */

let politeAnnouncer = null;
let assertiveAnnouncer = null;

/**
 * Initializes screen reader live regions in the DOM.
 */
export function initLiveAnnouncers() {
  if (politeAnnouncer && assertiveAnnouncer) return;

  politeAnnouncer = document.createElement('div');
  politeAnnouncer.id = 'a11y-live-polite';
  politeAnnouncer.className = 'sr-only';
  politeAnnouncer.setAttribute('role', 'status');
  politeAnnouncer.setAttribute('aria-live', 'polite');
  politeAnnouncer.setAttribute('aria-atomic', 'true');
  document.body.appendChild(politeAnnouncer);

  assertiveAnnouncer = document.createElement('div');
  assertiveAnnouncer.id = 'a11y-live-assertive';
  assertiveAnnouncer.className = 'sr-only';
  assertiveAnnouncer.setAttribute('role', 'alert');
  assertiveAnnouncer.setAttribute('aria-live', 'assertive');
  assertiveAnnouncer.setAttribute('aria-atomic', 'true');
  document.body.appendChild(assertiveAnnouncer);
}

/**
 * Announces a message to screen readers.
 * @param {string} message 
 * @param {'polite' | 'assertive'} priority 
 */
export function announce(message, priority = 'polite') {
  initLiveAnnouncers();
  const target = priority === 'assertive' ? assertiveAnnouncer : politeAnnouncer;
  if (!target) return;

  // Clear and update to trigger announcement in virtual screen readers
  target.textContent = '';
  setTimeout(() => {
    target.textContent = message;
  }, 50);
}

/**
 * Traps keyboard focus inside a modal dialog.
 * @param {HTMLElement} modalElement 
 * @returns {() => void} cleanup function
 */
export function trapFocus(modalElement) {
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableElements = Array.from(modalElement.querySelectorAll(focusableSelectors));
  
  if (focusableElements.length === 0) return () => {};

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  firstElement.focus();

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  modalElement.addEventListener('keydown', handleKeyDown);

  return () => {
    modalElement.removeEventListener('keydown', handleKeyDown);
  };
}
