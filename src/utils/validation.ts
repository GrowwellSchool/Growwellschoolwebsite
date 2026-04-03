export type ValidationConfig = {
  requiredFields?: string[];
  requiredImages?: string[];
  imageKey?: string;
  newImageKey?: string;
  idKey?: string;
};

export type ValidationResult = {
  isValid: boolean;
  error: string;
  invalidFields: string[];
};

/**
 * Validates fields in a data object based on the provided configuration.
 * @param data The data object to validate.
 * @param config Configuration specifying required fields and images.
 * @param sectionName The name of the section (for error messaging).
 */
export const validateFields = (
  data: any,
  config: ValidationConfig,
  sectionName: string
): ValidationResult => {
  const invalidFields: string[] = [];

  if (config.requiredFields) {
    for (const field of config.requiredFields) {
      const value = data[field];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        invalidFields.push(field);
      }
    }
  }

  if (config.requiredImages) {
    for (const imgField of config.requiredImages) {
      let value = data[imgField];

      // Support checking both imageKey and newImageKey if provided
      if (imgField === config.imageKey && config.newImageKey) {
        const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
        if (isEmpty) {
          value = data[config.newImageKey];
        }
      }

      if (Array.isArray(value)) {
        if (value.some(v => !v || (typeof v === 'string' && v.trim() === ''))) {
          invalidFields.push(imgField);
        }
      } else if (!value || (typeof value === 'string' && value.trim() === '')) {
        invalidFields.push(imgField);
      }
    }
  }

  if (invalidFields.length > 0) {
    const error = invalidFields.some(f => f.toLowerCase().includes('image'))
      ? `Please upload all required images in "${sectionName}".`
      : `Please fill in all mandatory fields in "${sectionName}".`;
    
    return { isValid: false, error, invalidFields };
  }

  return { isValid: true, error: '', invalidFields: [] };
};

/**
 * Validates an array of items and returns indexed field names for errors.
 * @param items Array of items to validate.
 * @param config Configuration for each item.
 * @param sectionName The name of the section.
 */
export const validateArrayFields = (
  items: any[],
  config: ValidationConfig,
  sectionName: string
): ValidationResult => {
  if (!items || items.length === 0) return { isValid: true, error: '', invalidFields: [] };

  const allInvalidFields: string[] = [];
  let firstErrorMsg = '';

  for (let i = 0; i < items.length; i++) {
    const result = validateFields(items[i], config, sectionName);
    if (!result.isValid) {
      const fieldsToClear = Object.keys(items[i]);
      if (fieldsToClear.length > 0) {
        // Logic for clearing specific field errors would be handled by the caller
      }
      if (!firstErrorMsg) firstErrorMsg = result.error;
      const id = config.idKey ? items[i][config.idKey] : i;
      result.invalidFields.forEach(field => {
        allInvalidFields.push(`${id}-${field}`);
      });
    }
  }

  if (allInvalidFields.length > 0) {
    return { isValid: false, error: firstErrorMsg, invalidFields: allInvalidFields };
  }

  return { isValid: true, error: '', invalidFields: [] };
};
