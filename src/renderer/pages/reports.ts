import type { DonationWithSupporter } from '@shared/types/donation';
import { el, clearElement, showError } from '../lib/dom-helpers';
import { formatCurrency, formatDate } from '../lib/formatters';
import { createStatCard } from '../components/stat-card';

export async function renderReportsPage(container: HTMLElement): Promise<void> {
  clearElement(container);

  let supporters: { id: number; name: string }[];
  let donations: DonationWithSupporter[];

  try {
    [supporters, donations] = await Promise.all([
      window.electronAPI.invoke('supporters:list'),
      window.electronAPI.invoke('donations:list'),
    ]);
  } catch (error) {
    showError(container, `Hiba az adatok betöltésekor: ${(error as Error).message}`);
    return;
  }

  // ── Stat cards (5.1) ──
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const latestDonation = donations.length > 0 ? donations[0] : null;

  const statsGrid = el('div', { className: 'mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4' }, [
    createStatCard('Támogatók', String(supporters.length)),
    createStatCard('Adományok', String(donations.length)),
    createStatCard('Összesített összeg', formatCurrency(totalAmount, 'HUF')),
    createStatCard('Legutóbbi adomány', latestDonation ? formatDate(latestDonation.donation_date) : '—'),
  ]);

  container.appendChild(statsGrid);

  // ── Top 10 supporters (5.2) ──
  const supporterTotals = new Map<string, number>();
  for (const d of donations) {
    supporterTotals.set(d.supporter_name, (supporterTotals.get(d.supporter_name) ?? 0) + d.amount);
  }

  const top10 = [...supporterTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topCard = el('div', { className: 'mb-6 rounded-lg border border-gray-200 bg-white p-6' }, [
    el('h3', { className: 'mb-4 text-base font-semibold text-gray-900' }, ['Top 10 támogató összeg szerint']),
    ...(top10.length > 0
      ? [createRankingTable(top10)]
      : [el('p', { className: 'text-sm text-gray-400' }, ['Nincs adat.'])]),
  ]);

  container.appendChild(topCard);

  // ── Payment method distribution (5.2) ──
  const methodTotals = new Map<string, { count: number; amount: number }>();
  for (const d of donations) {
    const method = d.payment_method || 'Ismeretlen';
    const entry = methodTotals.get(method) ?? { count: 0, amount: 0 };
    entry.count++;
    entry.amount += d.amount;
    methodTotals.set(method, entry);
  }

  const methodRows = [...methodTotals.entries()].sort((a, b) => b[1].amount - a[1].amount);

  const methodCard = el('div', { className: 'rounded-lg border border-gray-200 bg-white p-6' }, [
    el('h3', { className: 'mb-4 text-base font-semibold text-gray-900' }, ['Fizetési módok megoszlása']),
    ...(methodRows.length > 0
      ? [createMethodTable(methodRows, donations.length, totalAmount)]
      : [el('p', { className: 'text-sm text-gray-400' }, ['Nincs adat.'])]),
  ]);

  container.appendChild(methodCard);
}

function createRankingTable(rows: [string, number][]): HTMLElement {
  const headerRow = el('tr', { className: 'border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500' }, [
    el('th', { className: 'px-3 py-2 w-10' }, ['#']),
    el('th', { className: 'px-3 py-2' }, ['Támogató']),
    el('th', { className: 'px-3 py-2 text-right' }, ['Összeg']),
  ]);

  const bodyRows = rows.map(([name, amount], i) =>
    el('tr', { className: 'border-b border-gray-100 hover:bg-gray-50 transition-colors' }, [
      el('td', { className: 'px-3 py-2 text-sm text-gray-400' }, [String(i + 1)]),
      el('td', { className: 'px-3 py-2 text-sm text-gray-900' }, [name]),
      el('td', { className: 'px-3 py-2 text-right text-sm font-medium text-gray-900' }, [formatCurrency(amount, 'HUF')]),
    ]),
  );

  return el('div', { className: 'overflow-x-auto' }, [
    el('table', { className: 'w-full border-collapse text-sm' }, [
      el('thead', {}, [headerRow]),
      el('tbody', {}, bodyRows),
    ]),
  ]);
}

function createMethodTable(
  rows: [string, { count: number; amount: number }][],
  totalCount: number,
  totalAmount: number,
): HTMLElement {
  const headerRow = el('tr', { className: 'border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500' }, [
    el('th', { className: 'px-3 py-2' }, ['Fizetési mód']),
    el('th', { className: 'px-3 py-2 text-right' }, ['Darab']),
    el('th', { className: 'px-3 py-2 text-right' }, ['Arány']),
    el('th', { className: 'px-3 py-2 text-right' }, ['Összeg']),
  ]);

  const bodyRows = rows.map(([method, { count, amount }]) => {
    const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0';
    return el('tr', { className: 'border-b border-gray-100 hover:bg-gray-50 transition-colors' }, [
      el('td', { className: 'px-3 py-2 text-sm text-gray-900' }, [method]),
      el('td', { className: 'px-3 py-2 text-right text-sm text-gray-600' }, [String(count)]),
      el('td', { className: 'px-3 py-2 text-right text-sm text-gray-600' }, [`${pct}%`]),
      el('td', { className: 'px-3 py-2 text-right text-sm font-medium text-gray-900' }, [formatCurrency(amount, 'HUF')]),
    ]);
  });

  // Footer with totals
  const footerRow = el('tr', { className: 'border-t border-gray-300 font-medium' }, [
    el('td', { className: 'px-3 py-2 text-sm text-gray-900' }, ['Összesen']),
    el('td', { className: 'px-3 py-2 text-right text-sm text-gray-900' }, [String(totalCount)]),
    el('td', { className: 'px-3 py-2 text-right text-sm text-gray-900' }, ['100%']),
    el('td', { className: 'px-3 py-2 text-right text-sm text-gray-900' }, [formatCurrency(totalAmount, 'HUF')]),
  ]);

  return el('div', { className: 'overflow-x-auto' }, [
    el('table', { className: 'w-full border-collapse text-sm' }, [
      el('thead', {}, [headerRow]),
      el('tbody', {}, bodyRows),
      el('tfoot', {}, [footerRow]),
    ]),
  ]);
}
