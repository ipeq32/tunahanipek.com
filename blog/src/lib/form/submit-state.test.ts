import { describe, expect, it } from 'vitest';
import { deepEqual } from './form-values-equal';
import { isFormSubmitDisabledState } from './submit-state';

describe('deepEqual', () => {
  it('compares primitives and nested objects', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
    expect(
      deepEqual({ a: 1, b: { c: ['x'] } }, { a: 1, b: { c: ['x'] } }),
    ).toBe(true);
    expect(
      deepEqual({ a: 1, b: { c: ['x'] } }, { a: 1, b: { c: ['y'] } }),
    ).toBe(false);
  });
});

describe('isFormSubmitDisabledState', () => {
  const validClean = {
    isSubmitting: false,
    isValid: true,
    isDirty: false,
  };

  it('disables while submitting', () => {
    expect(
      isFormSubmitDisabledState({ ...validClean, isSubmitting: true }),
    ).toBe(true);
  });

  it('disables when invalid', () => {
    expect(isFormSubmitDisabledState({ ...validClean, isValid: false })).toBe(
      true,
    );
  });

  it('disables valid edit form until dirty', () => {
    expect(
      isFormSubmitDisabledState({ ...validClean, requireDirty: true }),
    ).toBe(true);

    expect(
      isFormSubmitDisabledState({
        ...validClean,
        requireDirty: true,
        isDirty: true,
      }),
    ).toBe(false);
  });

  it('enables valid create form without dirty requirement', () => {
    expect(isFormSubmitDisabledState(validClean)).toBe(false);
  });
});
