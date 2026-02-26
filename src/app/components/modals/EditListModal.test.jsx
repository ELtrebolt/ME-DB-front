import { render, screen, fireEvent } from '@testing-library/react';
import EditListModal from './EditListModal';

const defaultProps = {
  show: true,
  setShow: jest.fn(),
  onSave: jest.fn(),
  currentDescription: '',
  isHomePage: false,
  showHomePageOption: true,
};

beforeEach(() => jest.clearAllMocks());

describe('EditListModal', () => {
  // ─── Visibility ────────────────────────────────────────────────────────────

  test('renders when show is true', () => {
    render(<EditListModal {...defaultProps} />);
    expect(screen.getByText('Edit List')).toBeInTheDocument();
  });

  test('does not render when show is false', () => {
    render(<EditListModal {...defaultProps} show={false} />);
    expect(screen.queryByText('Edit List')).not.toBeInTheDocument();
  });

  // ─── Reset on open ─────────────────────────────────────────────────────────

  test('initialises textarea with currentDescription', () => {
    render(<EditListModal {...defaultProps} currentDescription="My anime list" />);
    expect(screen.getByRole('textbox')).toHaveValue('My anime list');
  });

  test('resets textarea to currentDescription when modal re-opens', () => {
    const { rerender } = render(<EditListModal {...defaultProps} show={false} currentDescription="original" />);
    rerender(<EditListModal {...defaultProps} show={true} currentDescription="original" />);
    expect(screen.getByRole('textbox')).toHaveValue('original');
  });

  // ─── Character limit ───────────────────────────────────────────────────────

  test('shows character counter', () => {
    render(<EditListModal {...defaultProps} currentDescription="hello" />);
    expect(screen.getByText('5/100')).toBeInTheDocument();
  });

  test('does not allow typing beyond 100 characters', () => {
    render(<EditListModal {...defaultProps} />);
    const longText = 'a'.repeat(110);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: longText } });
    expect(screen.getByRole('textbox').value).toHaveLength(100);
  });

  test('counter turns text-danger at the 100-char limit', () => {
    render(<EditListModal {...defaultProps} currentDescription={'a'.repeat(100)} />);
    expect(screen.getByText('100/100').className).toContain('text-danger');
  });

  // ─── Home page toggle ──────────────────────────────────────────────────────

  test('shows the "Set as Home Page" option when showHomePageOption is true', () => {
    render(<EditListModal {...defaultProps} />);
    expect(screen.getByText('Set as Home Page')).toBeInTheDocument();
  });

  test('hides the "Set as Home Page" option when showHomePageOption is false', () => {
    render(<EditListModal {...defaultProps} showHomePageOption={false} />);
    expect(screen.queryByText('Set as Home Page')).not.toBeInTheDocument();
  });

  test('clicking the home-page row toggles the checked icon class', () => {
    const { container } = render(<EditListModal {...defaultProps} isHomePage={false} />);
    const row = screen.getByText('Set as Home Page').closest('div[style]');
    // Initially unchecked
    expect(container.querySelector('i.far.fa-square')).toBeInTheDocument();
    fireEvent.click(row);
    expect(container.querySelector('i.fas.fa-check-square')).toBeInTheDocument();
  });

  test('initialises as checked when isHomePage is true', () => {
    const { container } = render(<EditListModal {...defaultProps} isHomePage={true} />);
    expect(container.querySelector('i.fas.fa-check-square')).toBeInTheDocument();
  });

  // ─── Save ──────────────────────────────────────────────────────────────────

  test('calls onSave with description and setAsHome when Save is clicked', () => {
    render(<EditListModal {...defaultProps} currentDescription="My list" isHomePage={false} />);
    // Toggle home page on
    fireEvent.click(screen.getByText('Set as Home Page').closest('div[style]'));
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(defaultProps.onSave).toHaveBeenCalledWith({
      description: 'My list',
      setAsHome: true,
    });
  });

  test('calls setShow(false) after saving', () => {
    render(<EditListModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(defaultProps.setShow).toHaveBeenCalledWith(false);
  });

  // ─── Cancel ────────────────────────────────────────────────────────────────

  test('calls setShow(false) on Cancel', () => {
    render(<EditListModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.setShow).toHaveBeenCalledWith(false);
  });

  test('does not call onSave on Cancel', () => {
    render(<EditListModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });
});
