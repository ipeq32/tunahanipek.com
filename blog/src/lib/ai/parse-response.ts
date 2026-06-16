import { jsonrepair } from 'jsonrepair';

function assertRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('AI response JSON must be an object');
  }

  return value as Record<string, unknown>;
}

function parseJsonObjectLiteral(json: string): Record<string, unknown> {
  try {
    return assertRecord(JSON.parse(json));
  } catch (primaryError) {
    try {
      return assertRecord(JSON.parse(jsonrepair(json)));
    } catch {
      const message =
        primaryError instanceof Error
          ? primaryError.message
          : 'Invalid AI response JSON';
      throw new Error(message);
    }
  }
}

export function extractJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in AI response');
  }

  const json = candidate.slice(start, end + 1);
  return parseJsonObjectLiteral(json);
}

export function pickString(
  data: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = data[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function pickStringArray(
  data: Record<string, unknown>,
  key: string,
): string[] {
  const value = data[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
}
