import type { ParsedTransaction } from '@shared/types/import';
import type { Supporter } from '@shared/types/supporter';
import { el, clearElement, showError } from '../lib/dom-helpers';
import { formatDate, formatCurrency, toTitleCase } from '../lib/formatters';
import { showModal, hideModal } from '../components/modal';
import { createTextInput, createFormGroup, createFormButtons, createSearchableSelect, SelectOption } from '../components/form-helpers';

let pageContainer: HTMLElement;
let tableBody: HTMLTableSectionElement;
let summaryContainer: HTMLElement;
let importBtn: HTMLButtonElement;
let transactions: ParsedTransaction[] = [];
let supporters: Supporter[] = [];
let selectedIds: Set<string> = new Set();
let supporterAssignments: Map<string, number> = new Map();

export async function renderImportPage(container: HTMLElement): Promise<void> {
  pageContainer = container;
  clearElement(container);

  // Load supporters
  try {
    supporters = await window.electronAPI.invoke('supporters:list');
  } catch (error) {
    showError(container, `Hiba a támogatók betöltésekor: ${(error as Error).message}`);
    return;
  }

  // File selection area
  const filePathDisplay = el('input', {
    type: 'text',
    className: 'flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50',
    placeholder: 'Nincs fájl kiválasztva',
    readonly: 'true',
  }) as HTMLInputElement;

  const browseBtn = el('button', {
    type: 'button',
    className: 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700',
  }, ['Tallózás...']);

  browseBtn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.invoke('import:selectFile');
    if (filePath) {
      filePathDisplay.value = filePath;
      await loadCSV(filePath);
    }
  });

  const fileSection = el('div', { className: 'mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4' }, [
    el('label', { className: 'text-sm font-medium text-gray-700' }, ['CSV Fájl:']),
    filePathDisplay,
    browseBtn,
  ]);

  // Table
  const table = el('table', { className: 'w-full border-collapse text-sm' }, [
    el('thead', {}, [
      el('tr', { className: 'border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500' }, [
        el('th', { className: 'px-3 py-3 w-10' }, []),
        el('th', { className: 'px-3 py-3' }, ['Dátum']),
        el('th', { className: 'px-3 py-3 text-right' }, ['Összeg']),
        el('th', { className: 'px-3 py-3' }, ['Név (hint)']),
        el('th', { className: 'px-3 py-3' }, ['Megjegyzés']),
        el('th', { className: 'px-3 py-3 w-56' }, ['Támogató']),
      ]),
    ]),
    el('tbody', { id: 'import-table-body', className: 'divide-y divide-gray-100' }),
  ]);

  const tableWrapper = el('div', { className: 'overflow-x-auto rounded-lg border border-gray-200 bg-white' }, [table]);

  // Selection controls
  const selectAllBtn = el('button', {
    type: 'button',
    className: 'rounded px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50',
  }, ['Összes kijelölése']);
  selectAllBtn.addEventListener('click', () => selectAll());

  const deselectAllBtn = el('button', {
    type: 'button',
    className: 'rounded px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100',
  }, ['Kijelölés törlése']);
  deselectAllBtn.addEventListener('click', () => deselectAll());

  const selectionControls = el('div', { className: 'mt-3 flex gap-2' }, [selectAllBtn, deselectAllBtn]);

  // Summary and import button
  summaryContainer = el('div', { className: 'flex-1 text-sm text-gray-700' });

  importBtn = el('button', {
    type: 'button',
    className: 'rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed',
    disabled: 'true',
  }, ['Importálás indítása']) as HTMLButtonElement;
  importBtn.addEventListener('click', () => startImport());

  const summaryBar = el('div', { className: 'mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3' }, [
    summaryContainer,
    importBtn,
  ]);

  // Empty state
  const emptyState = el('div', { id: 'import-empty-state', className: 'py-8 text-center text-gray-400' }, [
    'Válassz ki egy CSV fájlt a tranzakciók betöltéséhez.',
  ]);

  container.appendChild(fileSection);
  container.appendChild(summaryBar);
  container.appendChild(tableWrapper);
  container.appendChild(selectionControls);

  tableBody = document.getElementById('import-table-body') as HTMLTableSectionElement;
  tableBody.appendChild(el('tr', {}, [
    el('td', { className: 'px-3 py-8 text-center text-gray-400', colspan: '6' }, [
      'Válassz ki egy CSV fájlt a tranzakciók betöltéséhez.',
    ]),
  ]));

  updateSummary();
}

let skippedCount = 0;

async function loadCSV(filePath: string): Promise<void> {
  try {
    const allTransactions = await window.electronAPI.invoke('import:parseCSV', filePath);
    selectedIds.clear();
    supporterAssignments.clear();

    // Check which transactions are already imported (by reference)
    const references = allTransactions.map((t) => t.reference).filter((r) => r);
    const existingRefs = await window.electronAPI.invoke('donations:existingReferences', references);
    const existingSet = new Set(existingRefs);

    // Filter out already imported transactions
    transactions = allTransactions.filter((t) => !existingSet.has(t.reference));
    skippedCount = allTransactions.length - transactions.length;

    renderTable();
    updateSummary();
  } catch (error) {
    showError(pageContainer, `Hiba a CSV betöltésekor: ${(error as Error).message}`);
  }
}

function renderTable(): void {
  clearElement(tableBody);

  if (transactions.length === 0) {
    const message = skippedCount > 0
      ? `Minden tranzakció már importálva van (${skippedCount} kihagyva).`
      : 'A fájl nem tartalmaz importálható tranzakciókat.';
    tableBody.appendChild(el('tr', {}, [
      el('td', { className: 'px-3 py-8 text-center text-gray-400', colspan: '6' }, [message]),
    ]));
    return;
  }

  for (const t of transactions) {
    tableBody.appendChild(createTransactionRow(t));
  }
}

function createTransactionRow(t: ParsedTransaction): HTMLTableRowElement {
  const checkbox = el('input', {
    type: 'checkbox',
    className: 'h-4 w-4 rounded border-gray-300',
  }) as HTMLInputElement;
  checkbox.checked = selectedIds.has(t.id);
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      selectedIds.add(t.id);
    } else {
      selectedIds.delete(t.id);
    }
    updateSummary();
  });

  // Supporter searchable select
  const supporterOptions: SelectOption[] = [
    { value: '__new__', label: '+ Új támogató...' },
    ...supporters.map((s) => ({ value: String(s.id), label: s.name })),
  ];

  const prevAssignment = supporterAssignments.get(t.id);
  const supporterCombobox = createSearchableSelect('import-supporter-' + t.id, supporterOptions, {
    placeholder: 'Válassz támogatót...',
    ...(prevAssignment ? { value: String(prevAssignment) } : {}),
  });

  supporterCombobox.onChange(async () => {
    if (supporterCombobox.value === '__new__') {
      const newSupporter = await openNewSupporterModal(t.supporterHint);
      if (newSupporter) {
        supporters.push(newSupporter);
        supporterAssignments.set(t.id, newSupporter.id);
        renderTable();
      } else {
        supporterCombobox.value = '';
      }
    } else if (supporterCombobox.value) {
      supporterAssignments.set(t.id, Number(supporterCombobox.value));
    } else {
      supporterAssignments.delete(t.id);
    }
    updateSummary();
  });

  const notesDisplay = t.notes.length > 30 ? t.notes.substring(0, 30) + '...' : (t.notes || '—');

  return el('tr', { className: 'hover:bg-gray-50 transition-colors' }, [
    el('td', { className: 'px-3 py-2' }, [checkbox]),
    el('td', { className: 'px-3 py-2 text-gray-600' }, [formatDate(t.date)]),
    el('td', { className: 'px-3 py-2 text-right font-medium text-gray-900' }, [formatCurrency(t.amount, 'HUF')]),
    el('td', { className: 'px-3 py-2 text-gray-900' }, [t.supporterHint || '—']),
    el('td', { className: 'px-3 py-2 text-gray-500 text-xs', title: t.notes }, [notesDisplay]),
    el('td', { className: 'px-3 py-2' }, [supporterCombobox.element]),
  ]) as HTMLTableRowElement;
}

function selectAll(): void {
  for (const t of transactions) {
    selectedIds.add(t.id);
  }
  renderTable();
  updateSummary();
}

function deselectAll(): void {
  selectedIds.clear();
  renderTable();
  updateSummary();
}

function updateSummary(): void {
  const selectedTransactions = transactions.filter((t) => selectedIds.has(t.id));
  const totalAmount = selectedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const assignedCount = selectedTransactions.filter((t) => supporterAssignments.has(t.id)).length;

  let text = `Kiválasztva: ${selectedTransactions.length} tranzakció, ${formatCurrency(totalAmount, 'HUF')} | Támogatóval: ${assignedCount}`;
  if (skippedCount > 0) {
    text += ` | Már importált: ${skippedCount}`;
  }
  summaryContainer.textContent = text;

  // Enable import button only if there are selected transactions with assigned supporters
  importBtn.disabled = assignedCount === 0;
}

async function openNewSupporterModal(hintName: string): Promise<Supporter | null> {
  return new Promise((resolve) => {
    const nameInput = createTextInput('new-supporter-name', {
      required: true,
      value: toTitleCase(hintName),
      placeholder: 'Támogató neve',
    });

    const errorDiv = el('div', { className: 'mb-3 hidden rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' });

    const form = el('form', {}, [
      errorDiv,
      createFormGroup('Név *', nameInput, 'new-supporter-name'),
      createFormButtons('Létrehozás', () => {
        hideModal();
        resolve(null);
      }),
    ]);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) {
        errorDiv.textContent = 'A név megadása kötelező.';
        errorDiv.classList.remove('hidden');
        return;
      }

      try {
        const newSupporter = await window.electronAPI.invoke('supporters:create', { name });
        hideModal();
        resolve(newSupporter);
      } catch (error) {
        errorDiv.textContent = `Hiba: ${(error as Error).message}`;
        errorDiv.classList.remove('hidden');
      }
    });

    showModal({ title: 'Új támogató létrehozása', content: form });
  });
}

async function startImport(): Promise<void> {
  const toImport = transactions.filter((t) => selectedIds.has(t.id) && supporterAssignments.has(t.id));

  if (toImport.length === 0) {
    alert('Nincs importálható tranzakció (válassz ki tranzakciókat és rendelj hozzájuk támogatókat).');
    return;
  }

  const confirmed = confirm(`${toImport.length} tranzakció importálása. Folytatod?`);
  if (!confirmed) return;

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const t of toImport) {
    const supporterId = supporterAssignments.get(t.id);
    if (!supporterId) continue;

    try {
      await window.electronAPI.invoke('donations:create', {
        supporter_id: supporterId,
        amount: t.amount,
        currency: 'HUF',
        donation_date: t.date,
        payment_method: 'Átutalás',
        reference: t.reference,
        source: t.source,
        notes: t.notes || undefined,
      });
      successCount++;

      // Remove from the list after successful import
      selectedIds.delete(t.id);
      supporterAssignments.delete(t.id);
    } catch (error) {
      errorCount++;
      errors.push(`${t.supporterHint}: ${(error as Error).message}`);
    }
  }

  // Remove successfully imported transactions from the list
  transactions = transactions.filter((t) => !toImport.some((imp) => imp.id === t.id && !errors.some((e) => e.startsWith(t.supporterHint))));

  renderTable();
  updateSummary();

  if (errorCount === 0) {
    alert(`Sikeres importálás: ${successCount} tranzakció.`);
  } else {
    alert(`Importálás befejezve.\nSikeres: ${successCount}\nHibás: ${errorCount}\n\nHibák:\n${errors.join('\n')}`);
  }
}
