import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  test('renders nothing when show is false', () => {
    render(<Modal show={false} onClose={jest.fn()} title="Hidden Modal" />);
    expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument();
  });

  test('renders title and children when show is true', () => {
    render(
      <Modal show={true} onClose={jest.fn()} title="Test Modal">
        <p>Modal body content</p>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  test('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    render(<Modal show={true} onClose={onClose} title="Test" />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('renders footer content when provided', () => {
    render(
      <Modal show={true} onClose={jest.fn()} title="Test" footer={<button>Save</button>}>
        Content
      </Modal>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  test('does not render a footer when footer prop is omitted', () => {
    render(
      <Modal show={true} onClose={jest.fn()} title="Test">
        Content
      </Modal>
    );
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  test('hides the close button when showCloseButton is false', () => {
    render(
      <Modal show={true} onClose={jest.fn()} title="Test" showCloseButton={false} />
    );
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
  });

  test('renders custom header instead of title when header prop is provided', () => {
    render(
      <Modal
        show={true}
        onClose={jest.fn()}
        title="Regular Title"
        header={<span>Custom Header</span>}
      >
        Body
      </Modal>
    );
    expect(screen.getByText('Custom Header')).toBeInTheDocument();
    expect(screen.queryByText('Regular Title')).not.toBeInTheDocument();
  });

  test('calls onOverlayClick when the overlay backdrop is clicked', () => {
    const onOverlayClick = jest.fn();
    const { container } = render(
      <Modal show={true} onClose={jest.fn()} title="Test" onOverlayClick={onOverlayClick}>
        Content
      </Modal>
    );
    // The outermost div is the backdrop
    fireEvent.click(container.firstChild);
    expect(onOverlayClick).toHaveBeenCalledTimes(1);
  });
});
