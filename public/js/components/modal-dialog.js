/**
 * Accessible Modal Dialog Component using native HTML5 <dialog>.
 * Follows WCAG 2.1 AA recommendations: native focus trap, Escape key dismiss,
 * and proper ARIA labeling.
 */

import { trapFocus } from '../utils/a11y.js';

export class ModalDialog {
  constructor(dialogId) {
    this.dialog = document.getElementById(dialogId);
    if (!this.dialog) {
      console.warn(`Dialog with ID "${dialogId}" not found.`);
      return;
    }

    this.cleanupTrap = null;
    this.initEvents();
  }

  initEvents() {
    // Backdrop click dismiss
    this.dialog.addEventListener('click', (e) => {
      const rect = this.dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        this.close();
      }
    });

    // Close buttons inside dialog
    const closeBtns = this.dialog.querySelectorAll('[data-dialog-close]');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    this.dialog.addEventListener('close', () => {
      if (this.cleanupTrap) {
        this.cleanupTrap();
        this.cleanupTrap = null;
      }
    });
  }

  open() {
    if (!this.dialog) return;
    this.dialog.showModal();
    this.cleanupTrap = trapFocus(this.dialog);
  }

  close() {
    if (!this.dialog) return;
    this.dialog.close();
    if (this.cleanupTrap) {
      this.cleanupTrap();
      this.cleanupTrap = null;
    }
  }
}
