import { render, screen, fireEvent } from '@testing-library/react';
import DeleteModal from './DeleteModal';

// Helper: click the first trigger button (mobile button with title="Delete")
const openModal = () => fireEvent.click(screen.getAllByTitle('Delete')[0]);

describe('DeleteModal', () => {
  test('renders trigger delete button(s)', () => {
    render(<DeleteModal onDeleteClick={jest.fn()} type="media" />);
    expect(screen.getAllByTitle('Delete').length).toBeGreaterThan(0);
  });

  test('modal is not visible initially', () => {
    render(<DeleteModal onDeleteClick={jest.fn()} type="media" />);
    expect(screen.queryByText('Delete Confirmation')).not.toBeInTheDocument();
  });

  test('opens confirmation modal when trigger is clicked', () => {
    render(<DeleteModal onDeleteClick={jest.fn()} type="media" />);
    openModal();
    expect(screen.getByText('Delete Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to remove this record?')).toBeInTheDocument();
  });

  test('closes the modal when Cancel is clicked', () => {
    render(<DeleteModal onDeleteClick={jest.fn()} type="media" />);
    openModal();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Delete Confirmation')).not.toBeInTheDocument();
  });

  test('calls onDeleteClick and closes on confirm', () => {
    const onDeleteClick = jest.fn();
    render(<DeleteModal onDeleteClick={onDeleteClick} type="media" />);
    openModal();
    // The modal confirm button has btn-sm; the mobile trigger also has btn-sm but has d-md-none
    const confirmBtn = screen
      .getAllByRole('button', { name: /^delete$/i })
      .find(btn => btn.classList.contains('btn-sm') && !btn.classList.contains('d-md-none'));
    fireEvent.click(confirmBtn);
    expect(onDeleteClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Delete Confirmation')).not.toBeInTheDocument();
  });

  test('shows type-specific confirmation text for non-media type', () => {
    render(<DeleteModal onDeleteClick={jest.fn()} type="anime" />);
    openModal();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByText('Yes, Delete Everything')).toBeInTheDocument();
  });

  test('calls onModalOpen callback when trigger is clicked', () => {
    const onModalOpen = jest.fn();
    render(<DeleteModal onDeleteClick={jest.fn()} type="media" onModalOpen={onModalOpen} />);
    openModal();
    expect(onModalOpen).toHaveBeenCalledTimes(1);
  });

  test('calls onModalClose callback when Cancel is clicked', () => {
    const onModalClose = jest.fn();
    render(
      <DeleteModal onDeleteClick={jest.fn()} type="media" onModalClose={onModalClose} />
    );
    openModal();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onModalClose).toHaveBeenCalledTimes(1);
  });
});
