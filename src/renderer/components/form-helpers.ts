import { el } from '../lib/dom-helpers';

const inputClasses = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
const labelClasses = 'mb-1 block text-sm font-medium text-gray-700';

export function createFormGroup(label: string, input: HTMLElement, id?: string): HTMLElement {
  const labelEl = el('label', { className: labelClasses }, [label]);
  if (id) labelEl.setAttribute('for', id);
  return el('div', { className: 'mb-4' }, [labelEl, input]);
}

export function createTextInput(id: string, opts?: { value?: string; required?: boolean; placeholder?: string }): HTMLInputElement {
  const input = el('input', {
    id,
    type: 'text',
    className: inputClasses,
  }) as HTMLInputElement;

  if (opts?.value) input.value = opts.value;
  if (opts?.required) input.required = true;
  if (opts?.placeholder) input.placeholder = opts.placeholder;

  return input;
}

export function createTextarea(id: string, opts?: { value?: string; rows?: string; placeholder?: string }): HTMLTextAreaElement {
  const textarea = el('textarea', {
    id,
    className: inputClasses,
    rows: opts?.rows || '3',
  }) as HTMLTextAreaElement;

  if (opts?.value) textarea.value = opts.value;
  if (opts?.placeholder) textarea.placeholder = opts.placeholder;

  return textarea;
}

export interface SelectOption {
  value: string;
  label: string;
}

export function createSelect(id: string, options: SelectOption[], opts?: { value?: string; required?: boolean; placeholder?: string }): HTMLSelectElement {
  const select = el('select', {
    id,
    className: inputClasses,
  }) as HTMLSelectElement;

  if (opts?.placeholder) {
    const placeholderOpt = el('option', { value: '' }, [opts.placeholder]) as HTMLOptionElement;
    placeholderOpt.disabled = true;
    placeholderOpt.selected = true;
    select.appendChild(placeholderOpt);
  }

  for (const opt of options) {
    const optionEl = el('option', { value: opt.value }, [opt.label]) as HTMLOptionElement;
    if (opts?.value && opt.value === opts.value) {
      optionEl.selected = true;
    }
    select.appendChild(optionEl);
  }

  if (opts?.required) select.required = true;

  return select;
}

// ── Searchable combobox ──

export interface SearchableSelect {
  element: HTMLElement;
  get value(): string;
  set value(val: string);
  onChange(cb: () => void): void;
}

export function createSearchableSelect(
  id: string,
  options: SelectOption[],
  opts?: { value?: string; required?: boolean; placeholder?: string }
): SearchableSelect {
  const wrapper = el('div', { className: 'relative' });
  const input = el('input', {
    id,
    type: 'text',
    className: inputClasses + ' pr-8',
    autocomplete: 'off',
  }) as HTMLInputElement;
  if (opts?.placeholder) input.placeholder = opts.placeholder;
  if (opts?.required) input.setAttribute('data-required', 'true');

  const chevron = el('span', {
    className: 'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs',
  }, ['\u25BC']);

  const dropdown = el('ul', {
    className: 'absolute z-[60] hidden w-full mt-1 max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg',
  });

  wrapper.appendChild(input);
  wrapper.appendChild(chevron);
  wrapper.appendChild(dropdown);

  let selectedValue = '';
  let highlightIndex = -1;
  let filteredOptions: SelectOption[] = [];
  let isOpen = false;
  let changeCallback: (() => void) | null = null;
  // Track whether this is the initial focus (for edit modals with pre-selected value)
  let hadInitialValue = false;
  let firstFocusDone = false;

  function setSelected(val: string, triggerChange = true): void {
    selectedValue = val;
    const found = options.find((o) => o.value === val);
    input.value = found ? found.label : '';
    if (triggerChange && changeCallback) changeCallback();
  }

  // Set initial value if provided
  if (opts?.value) {
    setSelected(opts.value, false);
    hadInitialValue = true;
  }

  function renderDropdown(filter: string): void {
    dropdown.innerHTML = '';
    const lowerFilter = filter.toLowerCase();
    filteredOptions = filter
      ? options.filter((o) => o.label.toLowerCase().includes(lowerFilter))
      : options;
    highlightIndex = -1;

    if (filteredOptions.length === 0) {
      const noResult = el('li', {
        className: 'px-3 py-2 text-sm italic text-gray-400',
      }, ['Nincs találat']);
      dropdown.appendChild(noResult);
      return;
    }

    filteredOptions.forEach((opt, i) => {
      const li = el('li', {
        className: 'cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 transition-colors'
          + (opt.value === selectedValue ? ' bg-blue-50 font-medium text-blue-700' : ' text-gray-700'),
      }, [opt.label]);

      li.addEventListener('mousedown', (e) => {
        e.preventDefault(); // prevent blur before click registers
      });
      li.addEventListener('click', () => {
        setSelected(opt.value);
        close();
      });
      li.dataset.index = String(i);
      dropdown.appendChild(li);
    });
  }

  function updateHighlight(): void {
    const items = dropdown.querySelectorAll('li[data-index]');
    items.forEach((item, i) => {
      if (i === highlightIndex) {
        item.classList.add('bg-blue-100');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('bg-blue-100');
      }
    });
  }

  function open(): void {
    if (isOpen) return;
    isOpen = true;
    renderDropdown(input.value === getSelectedLabel() ? '' : input.value);
    dropdown.classList.remove('hidden');
    document.addEventListener('mousedown', onDocumentMousedown);
  }

  function close(): void {
    if (!isOpen) return;
    isOpen = false;
    dropdown.classList.add('hidden');
    highlightIndex = -1;
    document.removeEventListener('mousedown', onDocumentMousedown);
    // Restore display text to selected option
    const found = options.find((o) => o.value === selectedValue);
    input.value = found ? found.label : '';
  }

  function getSelectedLabel(): string {
    const found = options.find((o) => o.value === selectedValue);
    return found ? found.label : '';
  }

  function onDocumentMousedown(e: MouseEvent): void {
    if (!wrapper.contains(e.target as Node)) {
      close();
    }
  }

  input.addEventListener('focus', () => {
    // For edit modal: skip auto-open on first focus when there's a pre-selected value
    if (hadInitialValue && !firstFocusDone) {
      firstFocusDone = true;
      return;
    }
    open();
    input.select();
  });

  input.addEventListener('click', () => {
    if (!isOpen) {
      open();
      input.select();
    }
  });

  input.addEventListener('input', () => {
    if (!isOpen) open();
    renderDropdown(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) open();
      if (highlightIndex < filteredOptions.length - 1) {
        highlightIndex++;
        updateHighlight();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (highlightIndex > 0) {
        highlightIndex--;
        updateHighlight();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
        setSelected(filteredOptions[highlightIndex].value);
        close();
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.stopPropagation(); // don't close the modal
        close();
      }
    } else if (e.key === 'Tab') {
      close();
    }
  });

  return {
    element: wrapper,
    get value(): string {
      return selectedValue;
    },
    set value(val: string) {
      setSelected(val, false);
      // Reset initial-focus guard so it works fresh
      hadInitialValue = !!val;
      firstFocusDone = false;
    },
    onChange(cb: () => void): void {
      changeCallback = cb;
    },
  };
}

export function createDateInput(id: string, opts?: { value?: string; required?: boolean }): HTMLInputElement {
  const input = el('input', {
    id,
    type: 'date',
    className: inputClasses,
  }) as HTMLInputElement;

  if (opts?.value) input.value = opts.value;
  if (opts?.required) input.required = true;

  return input;
}

export function createNumberInput(id: string, opts?: { value?: number; required?: boolean; min?: number; step?: number }): HTMLInputElement {
  const input = el('input', {
    id,
    type: 'number',
    className: inputClasses,
  }) as HTMLInputElement;

  if (opts?.value !== undefined) input.value = String(opts.value);
  if (opts?.required) input.required = true;
  if (opts?.min !== undefined) input.min = String(opts.min);
  if (opts?.step !== undefined) input.step = String(opts.step);

  return input;
}

// ── Contact list (in-memory, for create forms) ──

export interface ContactEntry {
  value: string;
  is_primary: boolean;
}

export function createContactEditor(type: 'email' | 'phone'): {
  element: HTMLElement;
  getItems(): ContactEntry[];
} {
  const placeholder = type === 'email' ? 'pelda@email.hu' : '+36 30 123 4567';
  const label = type === 'email' ? 'Email címek' : 'Telefonszámok';
  const addLabel = type === 'email' ? '+ Email hozzáadása' : '+ Telefon hozzáadása';

  const listContainer = el('div', { className: 'space-y-2' });
  const rows: { input: HTMLInputElement; primaryCb: HTMLInputElement; row: HTMLElement }[] = [];

  function addRow(value = '', isPrimary = false): void {
    const input = el('input', {
      type: type === 'email' ? 'email' : 'tel',
      className: inputClasses,
      placeholder,
    }) as HTMLInputElement;
    if (value) input.value = value;

    const primaryCb = el('input', { type: 'checkbox', className: 'h-4 w-4 rounded border-gray-300' }) as HTMLInputElement;
    primaryCb.checked = isPrimary;
    primaryCb.title = 'Elsődleges';

    const removeBtn = el('button', {
      type: 'button',
      className: 'rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600',
    }, ['\u00d7']);

    const row = el('div', { className: 'flex items-center gap-2' }, [
      el('div', { className: 'flex-1' }, [input]),
      el('label', { className: 'flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap', title: 'Elsődleges' }, [primaryCb, 'Elsődl.']),
      removeBtn,
    ]);

    const entry = { input, primaryCb, row };
    rows.push(entry);
    listContainer.appendChild(row);

    removeBtn.addEventListener('click', () => {
      row.remove();
      const idx = rows.indexOf(entry);
      if (idx !== -1) rows.splice(idx, 1);
    });
  }

  const addBtn = el('button', {
    type: 'button',
    className: 'text-sm text-blue-600 transition-colors hover:text-blue-700',
  }, [addLabel]);
  addBtn.addEventListener('click', () => addRow());

  const labelEl = el('label', { className: labelClasses }, [label]);
  const wrapper = el('div', { className: 'mb-4' }, [labelEl, listContainer, el('div', { className: 'mt-2' }, [addBtn])]);

  return {
    element: wrapper,
    getItems(): ContactEntry[] {
      return rows
        .filter((r) => r.input.value.trim() !== '')
        .map((r) => ({ value: r.input.value.trim(), is_primary: r.primaryCb.checked }));
    },
  };
}

// ── Live contact list (for edit forms, IPC calls on each action) ──

export interface LiveContactListOptions {
  type: 'email' | 'phone';
  supporterId: number;
  items: Array<{ id: number; value: string; is_primary: 0 | 1 }>;
  onAdd: (value: string, isPrimary: boolean) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}

export function createLiveContactList(opts: LiveContactListOptions): HTMLElement {
  const placeholder = opts.type === 'email' ? 'pelda@email.hu' : '+36 30 123 4567';
  const label = opts.type === 'email' ? 'Email címek' : 'Telefonszámok';

  const listContainer = el('div', { className: 'space-y-2' });

  function renderItems(): void {
    listContainer.innerHTML = '';
    for (const item of opts.items) {
      const removeBtn = el('button', {
        type: 'button',
        className: 'rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600',
      }, ['\u00d7']);

      removeBtn.addEventListener('click', async () => {
        await opts.onRemove(item.id);
      });

      const row = el('div', { className: 'flex items-center gap-2' }, [
        el('span', { className: `flex-1 text-sm ${item.is_primary ? 'font-medium text-gray-900' : 'text-gray-600'}` }, [
          item.value,
          ...(item.is_primary ? [el('span', { className: 'ml-1 text-xs text-blue-600' }, ['(elsődleges)'])] : []),
        ]),
        removeBtn,
      ]);
      listContainer.appendChild(row);
    }
  }

  renderItems();

  // Add new row
  const newInput = el('input', {
    type: opts.type === 'email' ? 'email' : 'tel',
    className: inputClasses + ' flex-1',
    placeholder,
  }) as HTMLInputElement;

  const primaryCb = el('input', { type: 'checkbox', className: 'h-4 w-4 rounded border-gray-300' }) as HTMLInputElement;
  primaryCb.title = 'Elsődleges';

  const addBtn = el('button', {
    type: 'button',
    className: 'rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200',
  }, ['+']);

  addBtn.addEventListener('click', async () => {
    const value = newInput.value.trim();
    if (!value) return;
    await opts.onAdd(value, primaryCb.checked);
    newInput.value = '';
    primaryCb.checked = false;
  });

  const addRow = el('div', { className: 'mt-2 flex items-center gap-2' }, [
    newInput,
    el('label', { className: 'flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap', title: 'Elsődleges' }, [primaryCb, 'Elsődl.']),
    addBtn,
  ]);

  const labelEl = el('label', { className: labelClasses }, [label]);
  return el('div', { className: 'mb-4' }, [labelEl, listContainer, addRow]);
}

// ── Form buttons ──

export function createFormButtons(submitLabel: string, onCancel: () => void): HTMLElement {
  const submitBtn = el('button', {
    type: 'submit',
    className: 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700',
  }, [submitLabel]);

  const cancelBtn = el('button', {
    type: 'button',
    className: 'rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300',
  }, ['Mégse']);

  cancelBtn.addEventListener('click', onCancel);

  return el('div', { className: 'flex justify-end gap-3 pt-2' }, [cancelBtn, submitBtn]);
}
