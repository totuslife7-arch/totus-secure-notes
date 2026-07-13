import * as FileSystem from 'expo-file-system/legacy';

import { appendAuditEvent } from '@/services/auditLog';
import { encryptVaultJson, decryptVaultJson } from '@/services/sessionCrypto';
import { EncryptedPayload } from '@/services/encryption';
import {
  CustomTemplateDefinition,
  CustomTemplatesVault,
  DEFAULT_CATEGORIES,
} from '@/store/customTemplateSchema';

const VAULT_DIR = `${FileSystem.documentDirectory}vault/`;
const TEMPLATES_FILE = `${VAULT_DIR}customTemplates.enc`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(VAULT_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
  }
}

function emptyVault(): CustomTemplatesVault {
  return { v: 1, templates: [], categories: [...DEFAULT_CATEGORIES] };
}

export async function loadCustomTemplatesVault(password: string): Promise<CustomTemplatesVault> {
  await ensureDir();
  const info = await FileSystem.getInfoAsync(TEMPLATES_FILE);
  if (!info.exists) {
    return emptyVault();
  }

  try {
    const json = await FileSystem.readAsStringAsync(TEMPLATES_FILE);
    const payload = JSON.parse(json) as EncryptedPayload;
    const plaintext = await decryptVaultJson(payload, password);
    const data = JSON.parse(plaintext) as CustomTemplatesVault;
    return {
      v: 1,
      templates: data.templates ?? [],
      categories: data.categories?.length ? data.categories : [...DEFAULT_CATEGORIES],
    };
  } catch {
    return emptyVault();
  }
}

export async function saveCustomTemplatesVault(
  password: string,
  vault: CustomTemplatesVault,
): Promise<void> {
  await ensureDir();
  const payload = await encryptVaultJson(JSON.stringify(vault), password);
  await FileSystem.writeAsStringAsync(TEMPLATES_FILE, JSON.stringify(payload));
}

export async function listCustomTemplates(password: string): Promise<CustomTemplateDefinition[]> {
  const vault = await loadCustomTemplatesVault(password);
  return vault.templates.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getCustomTemplate(
  password: string,
  id: string,
): Promise<CustomTemplateDefinition | null> {
  const vault = await loadCustomTemplatesVault(password);
  return vault.templates.find((t) => t.id === id) ?? null;
}

export async function upsertCustomTemplate(
  password: string,
  template: CustomTemplateDefinition,
): Promise<CustomTemplateDefinition[]> {
  const vault = await loadCustomTemplatesVault(password);
  const index = vault.templates.findIndex((t) => t.id === template.id);
  const updated = { ...template, updatedAt: new Date().toISOString() };

  if (index >= 0) {
    vault.templates[index] = updated;
  } else {
    vault.templates.unshift(updated);
  }

  if (template.category && !vault.categories.includes(template.category)) {
    vault.categories.push(template.category);
  }

  await saveCustomTemplatesVault(password, vault);
  appendAuditEvent(password, 'template_save', template.id).catch(() => undefined);
  return vault.templates;
}

export async function deleteCustomTemplate(password: string, id: string): Promise<void> {
  const vault = await loadCustomTemplatesVault(password);
  vault.templates = vault.templates.filter((t) => t.id !== id);
  await saveCustomTemplatesVault(password, vault);
}
