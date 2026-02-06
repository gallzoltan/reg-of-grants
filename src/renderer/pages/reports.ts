export function renderReportsPage(container: HTMLElement): void {
  container.innerHTML = `
    <div class="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
      <p class="text-lg font-medium">Jelentések</p>
      <p class="mt-1 text-sm">Jelentések és statisztikák itt fognak megjelenni.</p>
    </div>
  `;
}
