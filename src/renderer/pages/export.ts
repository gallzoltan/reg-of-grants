import { el, clearElement } from '../lib/dom-helpers';
import { createDateInput, createFormGroup } from '../components/form-helpers';

let statusContainer: HTMLElement;

export function renderExportPage(container: HTMLElement): void {
  clearElement(container);

  const fromInput = createDateInput('export-from');
  const toInput = createDateInput('export-to');

  statusContainer = el('div', { className: 'mt-4' });

  const csvBtn = el('button', {
    type: 'button',
    className: 'rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700',
  }, ['CSV exportálás']);

  const xlsxBtn = el('button', {
    type: 'button',
    className: 'rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700',
  }, ['XLSX exportálás']);

  csvBtn.addEventListener('click', () => doExport('csv', fromInput, toInput));
  xlsxBtn.addEventListener('click', () => doExport('xlsx', fromInput, toInput));

  const card = el('div', { className: 'rounded-lg border border-gray-200 bg-white p-6' }, [
    el('h2', { className: 'mb-4 text-lg font-semibold text-gray-900' }, ['Támogatások exportálása']),
    el('p', { className: 'mb-6 text-sm text-gray-500' }, [
      'Válassz dátum tartományt (opcionális) és formátumot az exportáláshoz.',
    ]),
    el('div', { className: 'grid grid-cols-2 gap-4 max-w-md' }, [
      createFormGroup('Dátum (-tól)', fromInput, 'export-from'),
      createFormGroup('Dátum (-ig)', toInput, 'export-to'),
    ]),
    el('div', { className: 'flex gap-3 pt-2' }, [csvBtn, xlsxBtn]),
    statusContainer,
  ]);

  container.appendChild(card);
}

async function doExport(
  format: 'csv' | 'xlsx',
  fromInput: HTMLInputElement,
  toInput: HTMLInputElement,
): Promise<void> {
  clearElement(statusContainer);

  const from = fromInput.value || undefined;
  const to = toInput.value || undefined;

  try {
    const channel = format === 'csv' ? 'export:csv' : 'export:xlsx';
    const result = await window.electronAPI.invoke(channel, { from, to });

    if (!result) return; // cancelled

    statusContainer.appendChild(
      el('div', { className: 'rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700' }, [
        `Sikeres exportálás: ${result.count} tétel mentve ide: ${result.filePath}`,
      ]),
    );
  } catch (error) {
    statusContainer.appendChild(
      el('div', { className: 'rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700' }, [
        `Hiba az exportálás során: ${(error as Error).message}`,
      ]),
    );
  }
}
