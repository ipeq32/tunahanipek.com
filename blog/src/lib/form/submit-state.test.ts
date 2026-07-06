import { describe, expect, it } from 'vitest';
import { isFormSubmitDisabledState } from './submit-state';

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
