import { el } from '../lib/dom-helpers';

export interface ModalOptions {
  title: string;
  content: HTMLElement;
  onClose?: () => void;
}

let activeModal: HTMLElement | null = null;
let escHandler: ((e: KeyboardEvent) => void) | null = null;

export function showModal(options: ModalOptions): HTMLElement {
  hideModal();

  const closeBtn = el('button', {
    className: 'text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none',
    'aria-label': 'Bezárás',
  }, ['\u00d7']);

  const header = el('div', { className: 'flex items-center justify-between border-b border-gray-200 px-6 py-4' }, [
    el('h2', { className: 'text-lg font-semibold text-gray-900' }, [options.title]),
    closeBtn,
  ]);

  const body = el('div', { className: 'px-6 py-4' }, [options.content]);

  const panel = el('div', {
    className: 'relative w-full max-w-lg rounded-xl bg-white shadow-2xl',
  }, [header, body]);

  const overlay = el('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40',
  }, [panel]);

  // Prevent clicks on the panel from closing the modal
  panel.addEventListener('click', (e) => e.stopPropagation());

  // Click overlay to close
  overlay.addEventListener('click', () => {
    if (options.onClose) options.onClose();
    hideModal();
  });

  // Close button
  closeBtn.addEventListener('click', () => {
    if (options.onClose) options.onClose();
    hideModal();
  });

  // ESC to close
  escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (options.onClose) options.onClose();
      hideModal();
    }
  };
  document.addEventListener('keydown', escHandler);

  document.body.appendChild(overlay);
  activeModal = overlay;

  // Focus first input in modal
  const firstInput = panel.querySelector<HTMLInputElement>('input, textarea, select');
  if (firstInput) firstInput.focus();

  return overlay;
}

export function hideModal(): void {
  if (activeModal) {
    activeModal.remove();
    activeModal = null;
  }
  if (escHandler) {
    document.removeEventListener('keydown', escHandler);
    escHandler = null;
  }
}
