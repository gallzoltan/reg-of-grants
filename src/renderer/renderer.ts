import './styles/main.css';
import { registerRoutes, startRouter } from './lib/router';
import { renderNavigation } from './components/navigation';
import { renderSupportersPage } from './pages/supporters';
import { renderDonationsPage } from './pages/donations';
import { renderImportPage } from './pages/import';
import { renderReportsPage } from './pages/reports';
import { renderExportPage } from './pages/export';

registerRoutes([
  { id: 'supporters', title: 'Támogatók', render: renderSupportersPage },
  { id: 'donations', title: 'Adományok', render: renderDonationsPage },
  { id: 'import', title: 'Importálás', render: renderImportPage },
  { id: 'reports', title: 'Jelentések', render: renderReportsPage },
  { id: 'export', title: 'Exportálás', render: renderExportPage },
]);

const navContainer = document.getElementById('nav');
if (navContainer) {
  renderNavigation(navContainer);
}

startRouter();
