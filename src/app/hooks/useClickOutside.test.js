import { renderHook, act } from '@testing-library/react';
import { useClickOutside } from './useClickOutside';

describe('useClickOutside', () => {
  test('calls onClickOutside when clicking outside the ref element', () => {
    const onClickOutside = jest.fn();
    const inner = document.createElement('div');
    document.body.appendChild(inner);
    const ref = { current: inner };

    renderHook(() => useClickOutside(ref, onClickOutside));

    act(() => {
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(onClickOutside).toHaveBeenCalledTimes(1);
    document.body.removeChild(inner);
  });

  test('does not call onClickOutside when clicking inside the ref element', () => {
    const onClickOutside = jest.fn();
    const inner = document.createElement('div');
    document.body.appendChild(inner);
    const ref = { current: inner };

    renderHook(() => useClickOutside(ref, onClickOutside));

    act(() => {
      inner.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(onClickOutside).not.toHaveBeenCalled();
    document.body.removeChild(inner);
  });

  test('supports an array of refs — fires only when outside all of them', () => {
    const onClickOutside = jest.fn();
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    document.body.appendChild(div1);
    document.body.appendChild(div2);

    renderHook(() =>
      useClickOutside([{ current: div1 }, { current: div2 }], onClickOutside)
    );

    // Click outside both → should fire
    act(() => {
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(onClickOutside).toHaveBeenCalledTimes(1);

    // Click inside div1 → should NOT fire
    onClickOutside.mockClear();
    act(() => {
      div1.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(onClickOutside).not.toHaveBeenCalled();

    document.body.removeChild(div1);
    document.body.removeChild(div2);
  });

  test('removes the mousedown listener when the hook unmounts', () => {
    const onClickOutside = jest.fn();
    const div = document.createElement('div');
    const ref = { current: div };
    const spy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useClickOutside(ref, onClickOutside));
    unmount();

    expect(spy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    spy.mockRestore();
  });
});
