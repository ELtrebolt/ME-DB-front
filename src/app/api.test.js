import { api, setUnauthorizedHandler } from './api';

describe('api wrapper — 401 handler', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setUnauthorizedHandler(null);
  });

  function mockFetch(status, body = {}) {
    global.fetch = jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    });
  }

  test('invokes registered handler on 401 and still throws', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    mockFetch(401, { message: 'unauth' });

    await expect(api.get('/some/url')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('does NOT invoke handler on 403 (forbidden, not unauthorized)', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    mockFetch(403, { message: 'forbidden' });

    await expect(api.get('/some/url')).rejects.toMatchObject({
      response: { status: 403 },
    });
    expect(handler).not.toHaveBeenCalled();
  });

  test('does NOT invoke handler on 500', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    mockFetch(500, {});

    await expect(api.get('/some/url')).rejects.toMatchObject({
      response: { status: 500 },
    });
    expect(handler).not.toHaveBeenCalled();
  });

  test('handler exception does not swallow the original HTTP error', async () => {
    setUnauthorizedHandler(() => { throw new Error('handler bug'); });
    mockFetch(401, {});

    await expect(api.get('/some/url')).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  test('successful response returns parsed JSON and ignores handler', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    mockFetch(200, { ok: true });

    const res = await api.get('/some/url');
    expect(res.data).toEqual({ ok: true });
    expect(handler).not.toHaveBeenCalled();
  });
});
