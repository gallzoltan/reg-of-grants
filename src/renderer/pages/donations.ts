import type { DonationWithSupporter } from '@shared/types/donation';
import type { Supporter } from '@shared/types/supporter';
import { el, clearElement, showError } from '../lib/dom-helpers';
import { formatDate, formatCurrency } from '../lib/formatters';
import { showModal, hideModal } from '../components/modal';
import {
  createTextInput,
  createTextarea,
  createFormGroup,
  createFormButtons,
  createSelect,
  createSearchableSelect,
  createDateInput,
  createNumberInput,
  SelectOption,
  SearchableSelect,
} from '../components/form-helpers';

let pageContainer: HTMLElement;
let tableBody: HTMLTableSectionElement;
let summaryContainer: HTMLElement;
let exportStatusContainer: HTMLElement;
let filterSupporterCombobox: SearchableSelect;
let filterFromInput: HTMLInputElement;
let filterToInput: HTMLInputElement;
let supportersCache: Supporter[] = [];

const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'HUF', label: 'HUF' },
  { value: 'EUR', label: 'EUR' },
  { value: 'USD', label: 'USD' },
];

const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { value: 'Átutalás', label: 'Átutalás' },
  { value: 'Készpénz', label: 'Készpénz' },
  { value: 'Egyéb', label: 'Egyéb' },
];

export async function renderDonationsPage(container: HTMLElement): Promise<void> {
  pageContainer = container;
  clearElement(container);

  // Load supporters for filter and forms
  try {
    supportersCache = await window.electronAPI.invoke('supporters:list');
  } catch (error) {
    showError(container, `Hiba a támogatók betöltésekor: ${(error as Error).message}`);
    return;
  }

  // Filter bar
  const supporterOptions: SelectOption[] = supportersCache.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  filterSupporterCombobox = createSearchableSelect('filter-supporter', [{ value: '', label: 'Összes támogató' }, ...supporterOptions], { placeholder: 'Összes támogató' });
  filterFromInput = createDateInput('filter-from');
  filterToInput = createDateInput('filter-to');

  const filterBtn = el('button', {
    type: 'button',
    className: 'rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700',
  }, ['Szűrés']);
  filterBtn.addEventListener('click', () => applyFilter());

  const clearFilterBtn = el('button', {
    type: 'button',
    className: 'rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300',
  }, ['Törlés']);
  clearFilterBtn.addEventListener('click', () => clearFilter());

  const filterBar = el('div', { className: 'mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4' }, [
    el('div', { className: 'flex flex-col gap-1' }, [
      el('label', { className: 'text-xs font-medium text-gray-600' }, ['Támogató']),
      filterSupporterCombobox.element,
    ]),
    el('div', { className: 'flex flex-col gap-1' }, [
      el('label', { className: 'text-xs font-medium text-gray-600' }, ['Dátum-tól']),
      filterFromInput,
    ]),
    el('div', { className: 'flex flex-col gap-1' }, [
      el('label', { className: 'text-xs font-medium text-gray-600' }, ['Dátum-ig']),
      filterToInput,
    ]),
    el('div', { className: 'flex gap-2' }, [filterBtn, clearFilterBtn]),
    el('div', { className: 'ml-auto border-l border-gray-300 pl-3 flex gap-2' }, [
      createExportButton('CSV export', 'csv'),
      createExportButton('XLSX export', 'xlsx'),
    ]),
  ]);

  // Header bar with add button
  const addBtn = el('button', {
    className: 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700',
  }, ['+ Új adomány']);
  addBtn.addEventListener('click', () => openCreateModal());

  const headerBar = el('div', { className: 'mb-4 flex items-center justify-between' }, [
    el('p', { className: 'text-sm text-gray-500' }, ['Adományok listája']),
    addBtn,
  ]);

  // Table
  const table = el('table', { className: 'w-full border-collapse text-sm' }, [
    el('thead', {}, [
      el('tr', { className: 'border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500' }, [
        el('th', { className: 'px-4 py-3' }, ['Támogató']),
        el('th', { className: 'px-4 py-3 text-right' }, ['Összeg']),
        el('th', { className: 'px-4 py-3' }, ['Dátum']),
        el('th', { className: 'px-4 py-3' }, ['Fizetési mód']),
        el('th', { className: 'px-4 py-3' }, ['Hivatkozás']),
        el('th', { className: 'px-4 py-3 w-32 text-right' }, ['Műveletek']),
      ]),
    ]),
    el('tbody', { id: 'donations-table-body', className: 'divide-y divide-gray-100' }),
  ]);

  const tableWrapper = el('div', { className: 'overflow-x-auto rounded-lg border border-gray-200 bg-white' }, [table]);

  // Summary
  summaryContainer = el('div', { className: 'mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700' });

  // Export status
  exportStatusContainer = el('div', { className: 'mt-2' });

  container.appendChild(filterBar);
  container.appendChild(headerBar);
  container.appendChild(tableWrapper);
  container.appendChild(summaryContainer);
  container.appendChild(exportStatusContainer);

  tableBody = document.getElementById('donations-table-body') as HTMLTableSectionElement;

  await loadDonations();
}

// ── Data loading ──

async function loadDonations(): Promise<void> {
  try {
    const donations = await window.electronAPI.invoke('donations:list');
    renderTable(donations);
    renderSummary(donations);
  } catch (error) {
    clearElement(tableBody);
    showError(pageContainer, `Hiba az adományok betöltésekor: ${(error as Error).message}`);
  }
}

async function applyFilter(): Promise<void> {
  const supporterId = filterSupporterCombobox.value;
  const fromDate = filterFromInput.value;
  const toDate = filterToInput.value;

  try {
    let donations: DonationWithSupporter[];

    if (fromDate && toDate) {
      // Date range filter
      donations = await window.electronAPI.invoke('donations:byDateRange', { from: fromDate, to: toDate });
      // Also filter by supporter if selected
      if (supporterId) {
        donations = donations.filter((d) => d.supporter_id === Number(supporterId));
      }
    } else if (supporterId) {
      // Supporter filter only - need to map to DonationWithSupporter
      const basicDonations = await window.electronAPI.invoke('donations:bySupporter', Number(supporterId));
      const supporter = supportersCache.find((s) => s.id === Number(supporterId));
      donations = basicDonations.map((d) => ({
        ...d,
        supporter_name: supporter?.name || 'Ismeretlen',
      }));
    } else {
      // No filter
      donations = await window.electronAPI.invoke('donations:list');
    }

    renderTable(donations);
    renderSummary(donations);
  } catch (error) {
    showError(pageContainer, `Hiba a szűréskor: ${(error as Error).message}`);
  }
}

function clearFilter(): void {
  filterSupporterCombobox.value = '';
  filterFromInput.value = '';
  filterToInput.value = '';
  loadDonations();
}

// ── Table rendering ──

function renderTable(donations: DonationWithSupporter[]): void {
  clearElement(tableBody);

  if (donations.length === 0) {
    const emptyRow = el('tr', {}, [
      el('td', { className: 'px-4 py-8 text-center text-gray-400', colspan: '6' }, [
        'Még nincs adomány rögzítve.',
      ]),
    ]);
    tableBody.appendChild(emptyRow);
    return;
  }

  for (const donation of donations) {
    tableBody.appendChild(createDonationRow(donation));
  }
}

function createDonationRow(donation: DonationWithSupporter): HTMLTableRowElement {
  const editBtn = el('button', {
    className: 'rounded px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700',
  }, ['Szerkesztés']);
  editBtn.addEventListener('click', () => openEditModal(donation.id));

  const deleteBtn = el('button', {
    className: 'rounded px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 hover:text-red-700',
  }, ['Törlés']);
  deleteBtn.addEventListener('click', () => handleDelete(donation));

  return el('tr', { className: 'hover:bg-gray-50 transition-colors' }, [
    el('td', { className: 'px-4 py-3 font-medium text-gray-900' }, [donation.supporter_name]),
    el('td', { className: 'px-4 py-3 text-right text-gray-900 font-medium' }, [formatCurrency(donation.amount, donation.currency)]),
    el('td', { className: 'px-4 py-3 text-gray-600' }, [formatDate(donation.donation_date)]),
    el('td', { className: 'px-4 py-3 text-gray-600' }, [donation.payment_method || '—']),
    el('td', { className: 'px-4 py-3 text-gray-600' }, [donation.reference || '—']),
    el('td', { className: 'px-4 py-3 text-right space-x-1' }, [editBtn, deleteBtn]),
  ]) as HTMLTableRowElement;
}

function renderSummary(donations: DonationWithSupporter[]): void {
  if (donations.length === 0) {
    summaryContainer.textContent = 'Nincs adomány a kiválasztott szűrőkkel.';
    return;
  }

  // Group by currency
  const byCurrency: Record<string, number> = {};
  for (const d of donations) {
    byCurrency[d.currency] = (byCurrency[d.currency] || 0) + d.amount;
  }

  const totals = Object.entries(byCurrency)
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(' + ');

  summaryContainer.textContent = `Összesen: ${totals} (${donations.length} adomány)`;
}

// ── Create modal ──

function openCreateModal(): void {
  const supporterOptions: SelectOption[] = supportersCache.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  const supporterCombobox = createSearchableSelect('donation-supporter', supporterOptions, { required: true, placeholder: 'Válassz támogatót...' });
  const amountInput = createNumberInput('donation-amount', { required: true, min: 0, step: 1 });
  const currencySelect = createSelect('donation-currency', CURRENCY_OPTIONS, { value: 'HUF' });
  const dateInput = createDateInput('donation-date', { required: true, value: new Date().toISOString().split('T')[0] });
  const paymentMethodSelect = createSelect('donation-payment-method', PAYMENT_METHOD_OPTIONS, { placeholder: 'Válassz fizetési módot...' });
  const referenceInput = createTextInput('donation-reference', { placeholder: 'Tranzakció azonosító (opcionális)' });
  const notesInput = createTextarea('donation-notes', { placeholder: 'Megjegyzés (opcionális)', rows: '2' });

  const errorDiv = el('div', { className: 'mb-3 hidden rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' });

  const form = el('form', {}, [
    errorDiv,
    createFormGroup('Támogató *', supporterCombobox.element, 'donation-supporter'),
    el('div', { className: 'flex gap-4' }, [
      el('div', { className: 'flex-1' }, [createFormGroup('Összeg *', amountInput, 'donation-amount')]),
      el('div', { className: 'w-24' }, [createFormGroup('Pénznem', currencySelect, 'donation-currency')]),
    ]),
    createFormGroup('Dátum *', dateInput, 'donation-date'),
    createFormGroup('Fizetési mód', paymentMethodSelect, 'donation-payment-method'),
    createFormGroup('Hivatkozás', referenceInput, 'donation-reference'),
    createFormGroup('Megjegyzés', notesInput, 'donation-notes'),
    createFormButtons('Mentés', () => hideModal()),
  ]);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const supporterId = supporterCombobox.value;
    const amount = amountInput.value;
    const date = dateInput.value;

    if (!supporterId || !amount || !date) {
      showFormError(errorDiv, 'A támogató, összeg és dátum megadása kötelező.');
      return;
    }

    try {
      await window.electronAPI.invoke('donations:create', {
        supporter_id: Number(supporterId),
        amount: Number(amount),
        currency: currencySelect.value || 'HUF',
        donation_date: date,
        payment_method: paymentMethodSelect.value || undefined,
        reference: referenceInput.value.trim() || undefined,
        notes: notesInput.value.trim() || undefined,
      });
      hideModal();
      await loadDonations();
    } catch (error) {
      showFormError(errorDiv, `Hiba: ${(error as Error).message}`);
    }
  });

  showModal({ title: 'Új adomány', content: form });
}

// ── Edit modal ──

async function openEditModal(id: number): Promise<void> {
  const donation = await window.electronAPI.invoke('donations:get', id);
  if (!donation) {
    alert('Az adomány nem található.');
    return;
  }

  const supporterOptions: SelectOption[] = supportersCache.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  const supporterCombobox = createSearchableSelect('donation-supporter', supporterOptions, { required: true, value: String(donation.supporter_id) });
  const amountInput = createNumberInput('donation-amount', { required: true, min: 0, step: 1, value: donation.amount });
  const currencySelect = createSelect('donation-currency', CURRENCY_OPTIONS, { value: donation.currency });
  const dateInput = createDateInput('donation-date', { required: true, value: donation.donation_date.split('T')[0] });
  const paymentMethodSelect = createSelect('donation-payment-method', PAYMENT_METHOD_OPTIONS, { value: donation.payment_method || '' });
  const referenceInput = createTextInput('donation-reference', { value: donation.reference || '' });
  const notesInput = createTextarea('donation-notes', { value: donation.notes || '', rows: '2' });

  const errorDiv = el('div', { className: 'mb-3 hidden rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' });

  const form = el('form', {}, [
    errorDiv,
    createFormGroup('Támogató *', supporterCombobox.element, 'donation-supporter'),
    el('div', { className: 'flex gap-4' }, [
      el('div', { className: 'flex-1' }, [createFormGroup('Összeg *', amountInput, 'donation-amount')]),
      el('div', { className: 'w-24' }, [createFormGroup('Pénznem', currencySelect, 'donation-currency')]),
    ]),
    createFormGroup('Dátum *', dateInput, 'donation-date'),
    createFormGroup('Fizetési mód', paymentMethodSelect, 'donation-payment-method'),
    createFormGroup('Hivatkozás', referenceInput, 'donation-reference'),
    createFormGroup('Megjegyzés', notesInput, 'donation-notes'),
    createFormButtons('Mentés', () => hideModal()),
  ]);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const supporterId = supporterCombobox.value;
    const amount = amountInput.value;
    const date = dateInput.value;

    if (!supporterId || !amount || !date) {
      showFormError(errorDiv, 'A támogató, összeg és dátum megadása kötelező.');
      return;
    }

    try {
      await window.electronAPI.invoke('donations:update', {
        id: donation.id,
        supporter_id: Number(supporterId),
        amount: Number(amount),
        currency: currencySelect.value || 'HUF',
        donation_date: date,
        payment_method: paymentMethodSelect.value || undefined,
        reference: referenceInput.value.trim() || undefined,
        notes: notesInput.value.trim() || undefined,
      });
      hideModal();
      await loadDonations();
    } catch (error) {
      showFormError(errorDiv, `Hiba: ${(error as Error).message}`);
    }
  });

  showModal({ title: 'Adomány szerkesztése', content: form });
}

// ── Delete ──

async function handleDelete(donation: DonationWithSupporter): Promise<void> {
  const confirmed = confirm(`Biztosan törölni szeretnéd ezt az adományt?\n${donation.supporter_name} - ${formatCurrency(donation.amount, donation.currency)}`);
  if (!confirmed) return;

  try {
    await window.electronAPI.invoke('donations:delete', donation.id);
    await loadDonations();
  } catch (error) {
    alert(`Hiba a törléskor: ${(error as Error).message}`);
  }
}

// ── Export ──

function createExportButton(label: string, format: 'csv' | 'xlsx'): HTMLButtonElement {
  const btn = el('button', {
    type: 'button',
    className: format === 'csv'
      ? 'rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
      : 'rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700',
  }, [label]) as HTMLButtonElement;
  btn.addEventListener('click', () => doExport(format));
  return btn;
}

async function doExport(format: 'csv' | 'xlsx'): Promise<void> {
  clearElement(exportStatusContainer);

  const from = filterFromInput.value || undefined;
  const to = filterToInput.value || undefined;

  try {
    const channel = format === 'csv' ? 'export:csv' : 'export:xlsx';
    const result = await window.electronAPI.invoke(channel, { from, to });

    if (!result) return; // cancelled

    exportStatusContainer.appendChild(
      el('div', { className: 'rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700' }, [
        `Sikeres exportálás: ${result.count} tétel mentve ide: ${result.filePath}`,
      ]),
    );
  } catch (error) {
    exportStatusContainer.appendChild(
      el('div', { className: 'rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700' }, [
        `Hiba az exportálás során: ${(error as Error).message}`,
      ]),
    );
  }
}

// ── Helpers ──

function showFormError(errorDiv: HTMLElement, message: string): void {
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}
