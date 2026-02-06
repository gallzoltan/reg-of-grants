import { navigateTo, getCurrentRouteId } from '../lib/router';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'supporters', label: 'Támogatók', icon: '&#9823;' },
  { id: 'donations', label: 'Adományok', icon: '&#9830;' },
  { id: 'import', label: 'Importálás', icon: '&#8677;' },
  { id: 'reports', label: 'Jelentések', icon: '&#9776;' },
  { id: 'export', label: 'Exportálás', icon: '&#8680;' },
];

export function renderNavigation(container: HTMLElement): void {
  container.innerHTML = '';

  for (const item of navItems) {
    const button = document.createElement('button');
    button.dataset.navId = item.id;
    button.className = getNavButtonClasses(item.id);
    button.innerHTML = `
      <span class="text-base leading-none">${item.icon}</span>
      <span>${item.label}</span>
    `;
    button.addEventListener('click', () => navigateTo(item.id));
    container.appendChild(button);
  }

  window.addEventListener('route-changed', () => updateActiveState(container));
}

function getNavButtonClasses(id: string): string {
  const base = 'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors';
  const isActive = getCurrentRouteId() === id;
  if (isActive) {
    return `${base} bg-gray-700 text-white font-medium`;
  }
  return `${base} text-gray-300 hover:bg-gray-700/50 hover:text-white`;
}

function updateActiveState(container: HTMLElement): void {
  const buttons = container.querySelectorAll<HTMLButtonElement>('[data-nav-id]');
  for (const button of buttons) {
    button.className = getNavButtonClasses(button.dataset.navId!);
  }
}
