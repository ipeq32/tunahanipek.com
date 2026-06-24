import { describe, expect, it } from 'vitest';

import { parseWebhookEvent } from '@/lib/webhooks/parse-event';

describe('parseWebhookEvent', () => {
  it('parses Coolify deployment failure payloads', () => {
    const result = parseWebhookEvent('coolify', {
      payload: {
        success: false,
        event: 'deployment_failure',
        application_name: 'my-blog',
        project: 'Production',
      },
      headers: {},
    });

    expect(result.eventType).toBe('deployment_failure');
    expect(result.severity).toBe('ERROR');
    expect(result.title).toContain('my-blog');
  });

  it('parses generic webhook payloads', () => {
    const result = parseWebhookEvent('generic', {
      payload: {
        type: 'backup_completed',
        success: true,
        message: 'Nightly backup finished',
      },
      headers: {},
    });

    expect(result.eventType).toBe('backup_completed');
    expect(result.severity).toBe('SUCCESS');
    expect(result.title).toBe('Nightly backup finished');
  });

  it('parses GitHub payloads using X-GitHub-Event header', () => {
    const result = parseWebhookEvent('github', {
      payload: {
        action: 'opened',
        repository: { full_name: 'org/repo' },
      },
      headers: { 'x-github-event': 'pull_request' },
    });

    expect(result.eventType).toBe('pull_request.opened');
    expect(result.title).toContain('org/repo');
  });

  it('normalizes legacy enum-style integration keys', () => {
    const result = parseWebhookEvent('COOLIFY', {
      payload: { event: 'deployment_success', success: true },
      headers: {},
    });

    expect(result.severity).toBe('SUCCESS');
  });
});
