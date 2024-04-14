import React from 'react';
import { render, screen } from '@testing-library/react';
import Exercise1Page from './Exercise1Page';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));
import { useState } from 'react';

describe('Exercise1Page test', () => {
    beforeEach(()=>{
        useState.mockImplementation(jest.requireActual('react').useState);
      })

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.resetModules();
    });

    it('render loading', () => {
        render(<Exercise1Page />)
        const title = screen.queryByText('Loading...');
        expect(title).toBeDefined();
    });

    it('render slider', () => {
        useState.mockImplementationOnce(() => [{ minValue: 0.00, maxValue: 100.00}, jest.fn()]);
        const { container } = render(<Exercise1Page />);
        const slider = container.querySelector('.Slider');
        expect(slider).not.toBeNull();
    });
});