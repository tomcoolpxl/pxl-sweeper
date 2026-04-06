import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        removeItem: vi.fn(key => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        key: vi.fn(i => Object.keys(store)[i] || null),
        get length() { return Object.keys(store).length; }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock dialog methods
if (typeof HTMLDialogElement !== 'undefined') {
    HTMLDialogElement.prototype.showModal = vi.fn(function() { this.open = true; });
    HTMLDialogElement.prototype.close = vi.fn(function() { this.open = false; });
}
