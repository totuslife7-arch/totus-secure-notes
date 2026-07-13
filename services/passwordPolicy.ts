export const MIN_MASTER_PASSWORD_LENGTH = 12;

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function getMasterPasswordRequirementsText(): string {
  return `At least ${MIN_MASTER_PASSWORD_LENGTH} characters with uppercase, lowercase, a number, and a symbol.`;
}

export function validateMasterPassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < MIN_MASTER_PASSWORD_LENGTH) {
    errors.push(`Use at least ${MIN_MASTER_PASSWORD_LENGTH} characters.`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Include at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Include at least one lowercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Include at least one number.');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Include at least one symbol (e.g. !@#$%).');
  }

  return { valid: errors.length === 0, errors };
}

export function getMasterPasswordValidationMessage(password: string): string | null {
  const result = validateMasterPassword(password);
  return result.valid ? null : result.errors.join(' ');
}
