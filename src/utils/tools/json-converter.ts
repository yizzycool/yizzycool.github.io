import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { Parser as CsvParser } from 'json2csv';

/**
 * Converts a JSON string or object to YAML format.
 */
export function jsonToYaml(jsonInput: string | object): string {
  try {
    const obj =
      typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
    return stringifyYaml(obj);
  } catch (error) {
    throw new Error(
      `Failed to convert to YAML: ${(error as Error).message || 'Invalid JSON input'}`
    );
  }
}

/**
 * Converts a YAML string to JSON format.
 */
export function yamlToJson(yamlInput: string): string {
  try {
    const obj = parseYaml(yamlInput);
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to convert to JSON: ${(error as Error).message || 'Invalid YAML input'}`
    );
  }
}

/**
 * Converts a JSON string or object to CSV format.
 */
export function jsonToCsv(jsonInput: string | object): string {
  try {
    const obj =
      typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;

    // Normalize input to array for CSV conversion
    const data = Array.isArray(obj) ? obj : [obj];
    const parser = new CsvParser();
    return parser.parse(data);
  } catch (error) {
    throw new Error(
      `Failed to convert to CSV: ${(error as Error).message || 'Invalid JSON input'}`
    );
  }
}
