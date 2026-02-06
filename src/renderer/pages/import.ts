export function renderImportPage(container: HTMLElement): void {
  container.innerHTML = `
    <div class="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
      <p class="text-lg font-medium">Importálás</p>
      <p class="mt-1 text-sm">Banki tranzakciók CSV importálása itt fog megjelenni.</p>
    </div>
  `;
}
