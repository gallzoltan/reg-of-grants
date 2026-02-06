import type { SupporterWithContacts } from '@shared/types/supporter';
import { el, clearElement, showError } from '../lib/dom-helpers';
import { formatEmailList, formatPhoneList } from '../lib/formatters';
import { showModal, hideModal } from '../components/modal';
import {
  createTextInput,
  createTextarea,
  createFormGroup,
  createFormButtons,
  createContactEditor,
  createLiveContactList,
} from '../components/form-helpers';

let pageContainer: HTMLElement;
let tableBody: HTMLTableSectionElement;

export function renderSupportersPage(container: HTMLElement): void {
  pageContainer = container;
  clearElement(container);

  // Header bar with add button
  const addBtn = el('button', {
    className: 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700',
  }, ['+ Új támogató']);
  addBtn.addEventListener('click', () => openCreateModal());

  const headerBar = el('div', { className: 'mb-4 flex items-center justify-between' }, [
    el('p', { className: 'text-sm text-gray-500' }, ['Támogatók listája']),
    addBtn,
  ]);

  // Table
  const table = el('table', { className: 'w-full border-collapse text-sm' }, [
    el('thead', {}, [
      el('tr', { className: 'border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500' }, [
        el('th', { className: 'px-4 py-3' }, ['Név']),
        el('th', { className: 'px-4 py-3' }, ['Cím']),
        el('th', { className: 'px-4 py-3' }, ['Email']),
        el('th', { className: 'px-4 py-3' }, ['Telefon']),
        el('th', { className: 'px-4 py-3 w-32 text-right' }, ['Műveletek']),
      ]),
    ]),
    el('tbody', { id: 'supporters-table-body', className: 'divide-y divide-gray-100' }),
  ]);

  const tableWrapper = el('div', { className: 'overflow-x-auto rounded-lg border border-gray-200 bg-white' }, [table]);

  container.appendChild(headerBar);
  container.appendChild(tableWrapper);

  tableBody = document.getElementById('supporters-table-body') as HTMLTableSectionElement;

  loadSupporters();
}

// ── Data loading ──

async function loadSupporters(): Promise<void> {
  try {
    const supporters = await window.electronAPI.invoke('supporters:list');
    renderTable(supporters);
  } catch (error) {
    clearElement(tableBody);
    showError(pageContainer, `Hiba a támogatók betöltésekor: ${(error as Error).message}`);
  }
}

// ── Table rendering ──

function renderTable(supporters: SupporterWithContacts[]): void {
  clearElement(tableBody);

  if (supporters.length === 0) {
    const emptyRow = el('tr', {}, [
      el('td', { className: 'px-4 py-8 text-center text-gray-400', colspan: '5' }, [
        'Még nincs támogató rögzítve.',
      ]),
    ]);
    tableBody.appendChild(emptyRow);
    return;
  }

  for (const supporter of supporters) {
    tableBody.appendChild(createSupporterRow(supporter));
  }
}

function createSupporterRow(supporter: SupporterWithContacts): HTMLTableRowElement {
  const editBtn = el('button', {
    className: 'rounded px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700',
  }, ['Szerkesztés']);
  editBtn.addEventListener('click', () => openEditModal(supporter.id));

  const deleteBtn = el('button', {
    className: 'rounded px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 hover:text-red-700',
  }, ['Törlés']);
  deleteBtn.addEventListener('click', () => handleDelete(supporter));

  return el('tr', { className: 'hover:bg-gray-50 transition-colors' }, [
    el('td', { className: 'px-4 py-3 font-medium text-gray-900' }, [supporter.name]),
    el('td', { className: 'px-4 py-3 text-gray-600' }, [supporter.address || '—']),
    el('td', { className: 'px-4 py-3 text-gray-600' }, [formatEmailList(supporter.emails)]),
    el('td', { className: 'px-4 py-3 text-gray-600' }, [formatPhoneList(supporter.phones)]),
    el('td', { className: 'px-4 py-3 text-right space-x-1' }, [editBtn, deleteBtn]),
  ]) as HTMLTableRowElement;
}

// ── Create modal ──

function openCreateModal(): void {
  const nameInput = createTextInput('supporter-name', { required: true, placeholder: 'Támogató neve' });
  const addressInput = createTextInput('supporter-address', { placeholder: 'Cím (opcionális)' });
  const notesInput = createTextarea('supporter-notes', { placeholder: 'Megjegyzés (opcionális)', rows: '2' });

  const emailEditor = createContactEditor('email');
  const phoneEditor = createContactEditor('phone');

  const errorDiv = el('div', { className: 'mb-3 hidden rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' });

  const form = el('form', {}, [
    errorDiv,
    createFormGroup('Név *', nameInput, 'supporter-name'),
    createFormGroup('Cím', addressInput, 'supporter-address'),
    emailEditor.element,
    phoneEditor.element,
    createFormGroup('Megjegyzés', notesInput, 'supporter-notes'),
    createFormButtons('Mentés', () => hideModal()),
  ]);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      showFormError(errorDiv, 'A név megadása kötelező.');
      return;
    }

    const emails = emailEditor.getItems().map((item) => ({
      email: item.value,
      is_primary: item.is_primary,
    }));

    const phones = phoneEditor.getItems().map((item) => ({
      phone: item.value,
      is_primary: item.is_primary,
    }));

    try {
      await window.electronAPI.invoke('supporters:create', {
        name,
        address: addressInput.value.trim() || undefined,
        notes: notesInput.value.trim() || undefined,
        emails: emails.length > 0 ? emails : undefined,
        phones: phones.length > 0 ? phones : undefined,
      });
      hideModal();
      await loadSupporters();
    } catch (error) {
      showFormError(errorDiv, `Hiba: ${(error as Error).message}`);
    }
  });

  showModal({ title: 'Új támogató', content: form });
}

// ── Edit modal ──

async function openEditModal(id: number): Promise<void> {
  let supporter = await window.electronAPI.invoke('supporters:get', id);
  if (!supporter) {
    alert('A támogató nem található.');
    return;
  }

  const nameInput = createTextInput('supporter-name', { value: supporter.name, required: true });
  const addressInput = createTextInput('supporter-address', { value: supporter.address || '' });
  const notesInput = createTextarea('supporter-notes', { value: supporter.notes || '', rows: '2' });

  const errorDiv = el('div', { className: 'mb-3 hidden rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' });

  // Contact sections container (refreshed after each IPC operation)
  const contactsContainer = el('div', {});

  function renderContacts(): void {
    contactsContainer.innerHTML = '';

    const emailList = createLiveContactList({
      type: 'email',
      supporterId: supporter!.id,
      items: supporter!.emails.map((e) => ({ id: e.id, value: e.email, is_primary: e.is_primary })),
      onAdd: async (value, isPrimary) => {
        try {
          await window.electronAPI.invoke('supporters:addEmail', {
            supporter_id: supporter!.id,
            email: value,
            is_primary: isPrimary,
          });
          supporter = await window.electronAPI.invoke('supporters:get', supporter!.id);
          renderContacts();
        } catch (error) {
          showFormError(errorDiv, `Hiba: ${(error as Error).message}`);
        }
      },
      onRemove: async (emailId) => {
        try {
          await window.electronAPI.invoke('supporters:removeEmail', emailId);
          supporter = await window.electronAPI.invoke('supporters:get', supporter!.id);
          renderContacts();
        } catch (error) {
          showFormError(errorDiv, `Hiba: ${(error as Error).message}`);
        }
      },
    });

    const phoneList = createLiveContactList({
      type: 'phone',
      supporterId: supporter!.id,
      items: supporter!.phones.map((p) => ({ id: p.id, value: p.phone, is_primary: p.is_primary })),
      onAdd: async (value, isPrimary) => {
        try {
          await window.electronAPI.invoke('supporters:addPhone', {
            supporter_id: supporter!.id,
            phone: value,
            is_primary: isPrimary,
          });
          supporter = await window.electronAPI.invoke('supporters:get', supporter!.id);
          renderContacts();
        } catch (error) {
          showFormError(errorDiv, `Hiba: ${(error as Error).message}`);
        }
      },
      onRemove: async (phoneId) => {
        try {
          await window.electronAPI.invoke('supporters:removePhone', phoneId);
          supporter = await window.electronAPI.invoke('supporters:get', supporter!.id);
          renderContacts();
        } catch (error) {
          showFormError(errorDiv, `Hiba: ${(error as Error).message}`);
        }
      },
    });

    contactsContainer.appendChild(emailList);
    contactsContainer.appendChild(phoneList);
  }

  renderContacts();

  const form = el('form', {}, [
    errorDiv,
    createFormGroup('Név *', nameInput, 'supporter-name'),
    createFormGroup('Cím', addressInput, 'supporter-address'),
    contactsContainer,
    createFormGroup('Megjegyzés', notesInput, 'supporter-notes'),
    createFormButtons('Mentés', () => { hideModal(); loadSupporters(); }),
  ]);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      showFormError(errorDiv, 'A név megadása kötelező.');
      return;
    }

    try {
      await window.electronAPI.invoke('supporters:update', {
        id: supporter!.id,
        name,
        address: addressInput.value.trim() || undefined,
        notes: notesInput.value.trim() || undefined,
      });
      hideModal();
      await loadSupporters();
    } catch (error) {
      showFormError(errorDiv, `Hiba: ${(error as Error).message}`);
    }
  });

  showModal({ title: 'Támogató szerkesztése', content: form });
}

// ── Delete ──

async function handleDelete(supporter: SupporterWithContacts): Promise<void> {
  const confirmed = confirm(`Biztosan törölni szeretnéd "${supporter.name}" támogatót?`);
  if (!confirmed) return;

  try {
    await window.electronAPI.invoke('supporters:delete', supporter.id);
    await loadSupporters();
  } catch (error) {
    alert(`Hiba a törléskor: ${(error as Error).message}`);
  }
}

// ── Helpers ──

function showFormError(errorDiv: HTMLElement, message: string): void {
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}
