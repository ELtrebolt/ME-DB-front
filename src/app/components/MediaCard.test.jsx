import { renderWithRouter, screen, fireEvent } from '../../test-utils';
import MediaCard from './MediaCard';

const baseMedia = {
  ID: 42,
  title: 'Attack on Titan',
  year: '2020-04-07',
  mediaType: 'anime',
  tier: 'S',
};

describe('MediaCard', () => {
  // ─── Rendering ─────────────────────────────────────────────────────────────

  test('renders the media title', () => {
    renderWithRouter(<MediaCard media={baseMedia} />);
    expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
  });

  test('renders the year extracted from the date string', () => {
    renderWithRouter(<MediaCard media={baseMedia} />);
    expect(screen.getByText('2020')).toBeInTheDocument();
  });

  test('renders "-" when year is null', () => {
    renderWithRouter(<MediaCard media={{ ...baseMedia, year: null }} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  test('renders "-" when year is undefined', () => {
    renderWithRouter(<MediaCard media={{ ...baseMedia, year: undefined }} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  // ─── Link vs onClick mode ───────────────────────────────────────────────────

  test('renders a Link to the media details URL when no onCardClick prop', () => {
    renderWithRouter(<MediaCard media={baseMedia} />);
    const link = screen.getByRole('link', { name: /attack on titan/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toContain('/anime/42');
  });

  test('includes basePath in the link URL', () => {
    renderWithRouter(<MediaCard media={baseMedia} basePath="/demo" />);
    const link = screen.getByRole('link', { name: /attack on titan/i });
    expect(link.getAttribute('href')).toContain('/demo/anime/42');
  });

  test('renders a span (not a Link) when onCardClick prop is provided', () => {
    const onClick = jest.fn();
    renderWithRouter(<MediaCard media={baseMedia} onCardClick={onClick} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Attack on Titan').tagName).toBe('SPAN');
  });

  test('calls onCardClick with the media object when clicked', () => {
    const onClick = jest.fn();
    renderWithRouter(<MediaCard media={baseMedia} onCardClick={onClick} />);
    fireEvent.click(screen.getByText('Attack on Titan'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(baseMedia);
  });

  test('does not call anything on click when no onCardClick', () => {
    // Just verifying no crash when clicking the link
    renderWithRouter(<MediaCard media={baseMedia} />);
    expect(() => fireEvent.click(screen.getByRole('link'))).not.toThrow();
  });

  // ─── URL query string preservation ─────────────────────────────────────────

  test('preserves existing query parameters in the link URL', () => {
    renderWithRouter(<MediaCard media={baseMedia} />, {
      route: '/anime/collection?tags=action,romance',
    });
    const link = screen.getByRole('link', { name: /attack on titan/i });
    expect(link.getAttribute('href')).toContain('?tags=action,romance');
  });

  test('does not append query string when there are no params', () => {
    renderWithRouter(<MediaCard media={baseMedia} />, { route: '/anime/collection' });
    const link = screen.getByRole('link', { name: /attack on titan/i });
    expect(link.getAttribute('href')).not.toContain('?');
  });

  // ─── Width style ────────────────────────────────────────────────────────────

  test('sets a numeric pixel width style on the card element', () => {
    const { container } = renderWithRouter(<MediaCard media={baseMedia} />);
    const card = container.querySelector('.card');
    expect(card.style.width).toMatch(/^\d+(\.\d+)?px$/);
  });

  test('applies pointer cursor when onCardClick is provided', () => {
    const { container } = renderWithRouter(
      <MediaCard media={baseMedia} onCardClick={jest.fn()} />
    );
    expect(container.querySelector('.card').style.cursor).toBe('pointer');
  });

  test('applies grab cursor when no onCardClick', () => {
    const { container } = renderWithRouter(<MediaCard media={baseMedia} />);
    expect(container.querySelector('.card').style.cursor).toBe('grab');
  });
});
