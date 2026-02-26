import {
  suggestionsByLabel,
  toCapitalNotation,
  filterData,
  getTruncatedTitle,
  calculateDropdownWidth,
  createEmptyTiersObject,
} from './helpers';

// ─── toCapitalNotation ──────────────────────────────────────────────────────

describe('toCapitalNotation', () => {
  test('capitalizes the first letter of each word', () => {
    expect(toCapitalNotation('hello world')).toBe('Hello World');
  });

  test('lowercases the rest of each word', () => {
    expect(toCapitalNotation('ANIME MOVIES')).toBe('Anime Movies');
  });

  test('returns empty string for empty input', () => {
    expect(toCapitalNotation('')).toBe('');
  });

  test('returns empty string for null/undefined', () => {
    expect(toCapitalNotation(null)).toBe('');
    expect(toCapitalNotation(undefined)).toBe('');
  });

  test('handles single word', () => {
    expect(toCapitalNotation('anime')).toBe('Anime');
  });
});

// ─── suggestionsByLabel ─────────────────────────────────────────────────────

describe('suggestionsByLabel', () => {
  const suggestions = [
    { value: 1, label: 'Attack on Titan' },
    { value: 2, label: 'Naruto' },
    { value: 3, label: 'One Piece' },
  ];

  test('returns suggestions matching the search value', () => {
    const result = suggestionsByLabel('naruto', suggestions);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Naruto');
  });

  test('returns all suggestions for empty search value', () => {
    const result = suggestionsByLabel('', suggestions);
    expect(result).toHaveLength(suggestions.length);
  });

  test('returns empty array when no match', () => {
    const result = suggestionsByLabel('zzz', suggestions);
    expect(result).toHaveLength(0);
  });

  test('is case-insensitive', () => {
    const result = suggestionsByLabel('NARUTO', suggestions);
    expect(result).toHaveLength(1);
  });
});

// ─── createEmptyTiersObject ─────────────────────────────────────────────────

describe('createEmptyTiersObject', () => {
  test('returns an object with all standard tier keys', () => {
    const obj = createEmptyTiersObject();
    ['S', 'A', 'B', 'C', 'D', 'F'].forEach(tier => {
      expect(obj).toHaveProperty(tier);
    });
  });

  test('each tier value is an empty array', () => {
    const obj = createEmptyTiersObject();
    Object.values(obj).forEach(arr => expect(arr).toEqual([]));
  });
});

// ─── calculateDropdownWidth ─────────────────────────────────────────────────

describe('calculateDropdownWidth', () => {
  test('returns minWidth for empty labels array', () => {
    expect(calculateDropdownWidth([], { minWidth: 80 })).toBe(80);
  });

  test('returns at least minWidth for short labels', () => {
    const width = calculateDropdownWidth(['Hi'], { minWidth: 100 });
    expect(width).toBeGreaterThanOrEqual(100);
  });

  test('wider label produces larger width', () => {
    const short = calculateDropdownWidth(['Hi']);
    const long = calculateDropdownWidth(['A very long dropdown label here']);
    expect(long).toBeGreaterThan(short);
  });

  test('handles object labels with hasIcon', () => {
    // Use minWidth: 0 so the raw calculation is not clamped
    const withIcon = calculateDropdownWidth([{ text: 'Hello', hasIcon: true }], { minWidth: 0, iconWidth: 20 });
    const withoutIcon = calculateDropdownWidth([{ text: 'Hello', hasIcon: false }], { minWidth: 0, iconWidth: 20 });
    expect(withIcon).toBeGreaterThan(withoutIcon);
  });

  test('desktop variant uses wider char width than mobile', () => {
    // Use minWidth: 0 so raw char-based widths are not clamped
    const mobile = calculateDropdownWidth(['Hello'], { variant: 'mobile', minWidth: 0 });
    const desktop = calculateDropdownWidth(['Hello'], { variant: 'desktop', minWidth: 0 });
    expect(desktop).toBeGreaterThan(mobile);
  });
});

// ─── getTruncatedTitle ──────────────────────────────────────────────────────

describe('getTruncatedTitle', () => {
  test('includes media type and group in the result', () => {
    const result = getTruncatedTitle('tv', 'collection');
    expect(result).toMatch(/Tv/i);
    expect(result).toMatch(/Collection/i);
  });

  test('truncates long titles (omits "Tier List")', () => {
    // 'Anime Collection Tier List' = 26 chars > 20, so truncated
    const result = getTruncatedTitle('anime', 'collection');
    expect(result).not.toContain('Tier List');
  });

  test('formats to-do correctly', () => {
    const result = getTruncatedTitle('tv', 'to-do');
    expect(result).toContain('To-Do');
  });
});

// ─── filterData ─────────────────────────────────────────────────────────────

describe('filterData', () => {
  const mockSetSuggestedTags = jest.fn();
  const mockSetSearchChanged = jest.fn();

  const tierData = {
    S: [{ ID: 1, title: 'Attack on Titan', tier: 'S', tags: ['action'], year: '2020-01-01' }],
    A: [{ ID: 2, title: 'Naruto', tier: 'A', tags: ['shonen'], year: '2019-01-01' }],
    B: [], C: [], D: [], F: [],
  };

  const callFilter = (overrides = {}) =>
    filterData(
      'tierData' in overrides ? overrides.tierData : tierData,
      overrides.timePeriod ?? 'all',
      overrides.startDate ?? null,
      overrides.endDate ?? null,
      overrides.allTags ?? [],
      overrides.selectedTags ?? [],
      overrides.tagLogic ?? 'OR',
      mockSetSuggestedTags,
      mockSetSearchChanged,
      overrides.searchQuery ?? '',
      overrides.searchScope ?? ['title'],
      overrides.selectedTiers ?? ['S', 'A', 'B', 'C', 'D', 'F'],
      overrides.sortOrder ?? 'default'
    );

  beforeEach(() => {
    mockSetSuggestedTags.mockClear();
    mockSetSearchChanged.mockClear();
  });

  test('returns all items when no filters applied', () => {
    const result = callFilter();
    expect(result.S).toHaveLength(1);
    expect(result.A).toHaveLength(1);
  });

  test('returns empty tiers for null tierData', () => {
    const result = callFilter({ tierData: null });
    expect(result).toEqual({ S: [], A: [], B: [], C: [], D: [], F: [] });
  });

  test('filters by search query on title', () => {
    const result = callFilter({ searchQuery: 'naruto' });
    expect(result.S).toHaveLength(0);
    expect(result.A).toHaveLength(1);
  });

  test('filters by selected tiers', () => {
    const result = callFilter({ selectedTiers: ['S'] });
    expect(result.S).toHaveLength(1);
    expect(result.A).toHaveLength(0);
  });

  test('filters by selected tags with OR logic', () => {
    const result = callFilter({ selectedTags: [{ label: 'action' }], tagLogic: 'OR' });
    expect(result.S).toHaveLength(1);
    expect(result.A).toHaveLength(0);
  });

  test('filters by selected tags with AND logic', () => {
    const result = callFilter({
      selectedTags: [{ label: 'action' }, { label: 'shonen' }],
      tagLogic: 'AND',
    });
    // Neither item has both 'action' AND 'shonen'
    expect(result.S).toHaveLength(0);
    expect(result.A).toHaveLength(0);
  });

  test('sorts by titleAZ', () => {
    const data = {
      S: [
        { ID: 2, title: 'Banana', tier: 'S', tags: [], year: '2020-01-01' },
        { ID: 1, title: 'Apple', tier: 'S', tags: [], year: '2019-01-01' },
      ],
      A: [], B: [], C: [], D: [], F: [],
    };
    const result = callFilter({ tierData: data, sortOrder: 'titleAZ' });
    expect(result.S[0].title).toBe('Apple');
    expect(result.S[1].title).toBe('Banana');
  });

  test('calls setSuggestedTags and setSearchChanged(false)', () => {
    callFilter();
    expect(mockSetSuggestedTags).toHaveBeenCalled();
    expect(mockSetSearchChanged).toHaveBeenCalledWith(false);
  });
});
