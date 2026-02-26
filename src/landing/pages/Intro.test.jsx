import { renderWithRouter, screen } from '../../test-utils';
import Intro from './Intro';

beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('Intro page', () => {
  test('renders the ME-DB brand name', () => {
    renderWithRouter(<Intro />);
    expect(screen.getAllByText(/ME-DB/i).length).toBeGreaterThan(0);
  });

  test('renders at least one Sign In button', () => {
    renderWithRouter(<Intro />);
    expect(screen.getAllByText(/sign in/i).length).toBeGreaterThan(0);
  });

  test('renders navigation links (About, Features, Why, FAQ)', () => {
    renderWithRouter(<Intro />);
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    const { container } = renderWithRouter(<Intro />);
    expect(container).not.toBeEmptyDOMElement();
  });
});
