import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Renders a component wrapped in MemoryRouter for tests that need routing context.
 * @param {React.ReactNode} ui - The component to render
 * @param {object} options
 * @param {string} [options.route='/'] - The initial route
 * @param {string[]} [options.initialEntries] - Initial history entries
 * @param {object} [options.renderOptions] - Extra options passed to @testing-library/react render
 */
export function renderWithRouter(ui, { route = '/', initialEntries, ...renderOptions } = {}) {
  const entries = initialEntries || [route];
  return render(
    <MemoryRouter initialEntries={entries}>
      {ui}
    </MemoryRouter>,
    renderOptions
  );
}

export * from '@testing-library/react';
