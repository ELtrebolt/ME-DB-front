import { render, screen, fireEvent } from '@testing-library/react';
import NewTypeModal from './NewTypeModal';

const defaultProps = {
  show: true,
  setShow: jest.fn(),
  onSaveClick: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('NewTypeModal', () => {
  // ─── Visibility ────────────────────────────────────────────────────────────

  test('renders modal content when show is true', () => {
    render(<NewTypeModal {...defaultProps} />);
    expect(screen.getByText('Add New Type')).toBeInTheDocument();
  });

  test('does not render modal content when show is false', () => {
    render(<NewTypeModal {...defaultProps} show={false} />);
    expect(screen.queryByText('Add New Type')).not.toBeInTheDocument();
  });

  // ─── Input ─────────────────────────────────────────────────────────────────

  test('renders the input with placeholder from constants', () => {
    render(<NewTypeModal {...defaultProps} />);
    expect(screen.getByPlaceholderText('e.g. Restaurants')).toBeInTheDocument();
  });

  test('updates the input value as the user types', () => {
    render(<NewTypeModal {...defaultProps} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Music' } });
    expect(screen.getByRole('textbox')).toHaveValue('Music');
  });

  // ─── Save ──────────────────────────────────────────────────────────────────

  test('calls onSaveClick with the typed name when Save is clicked', () => {
    render(<NewTypeModal {...defaultProps} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Music' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(defaultProps.onSaveClick).toHaveBeenCalledWith('Music');
  });

  test('calls setShow(false) when Save is clicked', () => {
    render(<NewTypeModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(defaultProps.setShow).toHaveBeenCalledWith(false);
  });

  test('resets the input to empty after Save', () => {
    render(<NewTypeModal {...defaultProps} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Music' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    // Re-render open to check state reset
    render(<NewTypeModal {...defaultProps} />);
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('');
  });

  // ─── Cancel ────────────────────────────────────────────────────────────────

  test('calls setShow(false) when Cancel is clicked', () => {
    render(<NewTypeModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.setShow).toHaveBeenCalledWith(false);
  });

  test('does not call onSaveClick when Cancel is clicked', () => {
    render(<NewTypeModal {...defaultProps} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Music' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onSaveClick).not.toHaveBeenCalled();
  });
});
