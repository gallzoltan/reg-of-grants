import { el } from '../lib/dom-helpers';

export function createStatCard(label: string, value: string): HTMLElement {
  return el('div', { className: 'rounded-lg border border-gray-200 bg-white p-5' }, [
    el('p', { className: 'text-sm text-gray-500' }, [label]),
    el('p', { className: 'mt-1 text-2xl font-semibold text-gray-900' }, [value]),
  ]);
}
