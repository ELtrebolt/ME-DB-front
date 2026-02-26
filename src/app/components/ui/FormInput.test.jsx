import { render, screen, fireEvent } from '@testing-library/react';
import FormInput from './FormInput';

describe('FormInput', () => {
  test('renders an input element', () => {
    render(<FormInput />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('renders label when provided', () => {
    render(<FormInput label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  test('does not render a label when prop is omitted', () => {
    render(<FormInput />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  test('shows error message and applies is-invalid class', () => {
    render(<FormInput error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('is-invalid');
  });

  test('shows helper text when no error is present', () => {
    render(<FormInput helperText="Max 50 characters" />);
    expect(screen.getByText('Max 50 characters')).toBeInTheDocument();
  });

  test('hides helper text when error is present', () => {
    render(<FormInput error="Error" helperText="Helper" />);
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
  });

  test('passes through extra props (placeholder, type, etc.)', () => {
    render(<FormInput placeholder="Enter name" type="email" />);
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  test('calls onChange when the value changes', () => {
    const onChange = jest.fn();
    render(<FormInput onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
