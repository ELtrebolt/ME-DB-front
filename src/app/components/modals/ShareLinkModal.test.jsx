import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ShareLinkModal from './ShareLinkModal';

jest.mock('axios');

const defaultProps = {
  show: true,
  onClose: jest.fn(),
  mediaType: 'anime',
  toDoState: false,
  onUpdate: jest.fn(),
  initialShareData: null,
  username: 'testuser',
};

beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockResolvedValue({ data: { exists: false } });
  axios.post.mockResolvedValue({ data: { token: 'abc123' } });
  axios.delete.mockResolvedValue({});

  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
    writable: true,
    configurable: true,
  });
  window.confirm = jest.fn(() => true);
  window.alert = jest.fn();
});

describe('ShareLinkModal', () => {
  // ─── API on open ──────────────────────────────────────────────────────────

  test('fetches share status via GET when initialShareData is null', async () => {
    render(<ShareLinkModal {...defaultProps} />);
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/share/status/anime')
      )
    );
  });

  test('does NOT fetch status when initialShareData is provided', async () => {
    render(
      <ShareLinkModal
        {...defaultProps}
        initialShareData={{ exists: true, token: 'tok1', shareConfig: { collection: true, todo: false } }}
      />
    );
    await new Promise(r => setTimeout(r, 50));
    expect(axios.get).not.toHaveBeenCalled();
  });

  // ─── Generate state (no token) ────────────────────────────────────────────

  test('shows "Generate Public Link" button when no token exists', async () => {
    render(<ShareLinkModal {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /generate public link/i })).toBeInTheDocument()
    );
  });

  test('generate link calls POST /api/share with correct body', async () => {
    render(<ShareLinkModal {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /generate public link/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /generate public link/i }));
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/share'),
        expect.objectContaining({ mediaType: 'anime' })
      )
    );
  });

  test('shows "Link Active" after a successful generate', async () => {
    render(<ShareLinkModal {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /generate public link/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /generate public link/i }));
    await waitFor(() =>
      expect(screen.getByText('Link Active')).toBeInTheDocument()
    );
  });

  // ─── Active token state ───────────────────────────────────────────────────

  test('shows "Link Active" immediately when initialShareData has an existing token', () => {
    render(
      <ShareLinkModal
        {...defaultProps}
        initialShareData={{ exists: true, token: 'tok1', shareConfig: { collection: true, todo: false } }}
      />
    );
    expect(screen.getByText('Link Active')).toBeInTheDocument();
  });

  test('shows the share URL in the input when a token is active', () => {
    render(
      <ShareLinkModal
        {...defaultProps}
        initialShareData={{ exists: true, token: 'tok1', shareConfig: { collection: true, todo: false } }}
        username="alice"
      />
    );
    expect(screen.getByRole('textbox').value).toContain('/user/alice/anime');
  });

  // ─── Copy to clipboard ────────────────────────────────────────────────────

  test('copy button calls navigator.clipboard.writeText with the URL', async () => {
    render(
      <ShareLinkModal
        {...defaultProps}
        initialShareData={{ exists: true, token: 'tok1', shareConfig: { collection: true, todo: false } }}
        username="alice"
      />
    );
    const copyBtn = screen.getByRole('button', { name: '' }); // the icon-only button
    fireEvent.click(copyBtn);
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('/user/alice/anime')
      )
    );
  });

  // ─── Revoke ───────────────────────────────────────────────────────────────

  test('revoke calls window.confirm before proceeding', () => {
    render(
      <ShareLinkModal
        {...defaultProps}
        initialShareData={{ exists: true, token: 'tok1', shareConfig: { collection: true, todo: false } }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /unshare/i }));
    expect(window.confirm).toHaveBeenCalled();
  });

  test('revoke calls DELETE /api/share/:mediaType when confirmed', async () => {
    render(
      <ShareLinkModal
        {...defaultProps}
        initialShareData={{ exists: true, token: 'tok1', shareConfig: { collection: true, todo: false } }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /unshare/i }));
    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/share/anime')
      )
    );
  });

  test('does NOT call DELETE when confirm is cancelled', async () => {
    window.confirm = jest.fn(() => false);
    render(
      <ShareLinkModal
        {...defaultProps}
        initialShareData={{ exists: true, token: 'tok1', shareConfig: { collection: true, todo: false } }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /unshare/i }));
    await new Promise(r => setTimeout(r, 50));
    expect(axios.delete).not.toHaveBeenCalled();
  });

  test('shows "Generate Public Link" again after successful revoke', async () => {
    render(
      <ShareLinkModal
        {...defaultProps}
        initialShareData={{ exists: true, token: 'tok1', shareConfig: { collection: true, todo: false } }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /unshare/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /generate public link/i })).toBeInTheDocument()
    );
  });

  // ─── Generate button disabled state ──────────────────────────────────────

  test('Generate button is disabled when both checkboxes are unchecked', async () => {
    render(<ShareLinkModal {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /generate public link/i })).toBeInTheDocument()
    );
    // Uncheck "Collection"
    fireEvent.click(screen.getByLabelText(/^collection$/i));
    expect(screen.getByRole('button', { name: /generate public link/i })).toBeDisabled();
  });
});
