export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  children?: (Node | string)[],
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    }
  }
  if (children) {
    for (const child of children) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    }
  }
  return element;
}

export function clearElement(element: HTMLElement): void {
  element.innerHTML = '';
}

export function showError(container: HTMLElement, message: string): void {
  const div = el('div', { className: 'rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700' }, [
    message,
  ]);
  container.appendChild(div);
}

export function showEmpty(container: HTMLElement, message: string): void {
  const div = el('div', { className: 'rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500' }, [
    el('p', { className: 'text-sm' }, [message]),
  ]);
  container.appendChild(div);
}
