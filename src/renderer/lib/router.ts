export interface Route {
  id: string;
  title: string;
  render: (container: HTMLElement) => void | Promise<void>;
}

let routes: Route[] = [];
let currentRouteId: string | null = null;

export function registerRoutes(newRoutes: Route[]): void {
  routes = newRoutes;
}

export function navigateTo(routeId: string): void {
  window.location.hash = `#${routeId}`;
}

export function getCurrentRouteId(): string | null {
  return currentRouteId;
}

export function startRouter(): void {
  window.addEventListener('hashchange', () => handleRoute());
  handleRoute();
}

function handleRoute(): void {
  const hash = window.location.hash.replace('#', '') || routes[0]?.id;
  const route = routes.find((r) => r.id === hash);

  if (!route) {
    if (routes.length > 0) {
      navigateTo(routes[0].id);
    }
    return;
  }

  currentRouteId = route.id;

  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = route.title;

  const contentEl = document.getElementById('page-content');
  if (contentEl) {
    contentEl.innerHTML = '';
    route.render(contentEl);
  }

  window.dispatchEvent(new CustomEvent('route-changed', { detail: route.id }));
}
