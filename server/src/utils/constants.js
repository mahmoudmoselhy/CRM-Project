// Modules that per-user access can be granted on (must match PermissionModule enum).
const PERMISSION_MODULES = [
  'LEADS',
  'TASKS',
  'INVOICES',
  'SOURCES',
  'REPORTS',
  'SETTINGS',
  'USERS',
];

// Optional extensions toggled per company via CompanyFeature.
const EXTENSION_KEYS = [
  'AI_ASSISTANT',
  'INTEGRATIONS_API',
  'WHATSAPP',
  'EMAIL',
  'PDF_INVOICES',
  'KANBAN',
  'REALTIME',
  'DARK_MODE',
];

module.exports = { PERMISSION_MODULES, EXTENSION_KEYS };
