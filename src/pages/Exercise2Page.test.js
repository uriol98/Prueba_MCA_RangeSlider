import React from 'react';
import { render, screen } from '@testing-library/react';
import Exercise2Page from './Exercise2Page';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));
import { useState } from 'react';

describe('Exercise2Page test', () => {
    beforeEach(()=>{
        useState.mockImplementation(jest.requireActual('react').useState);
      })

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.resetModules();
    });

    it('render loading', () => {
        render(<Exercise2Page />)
        const title = screen.queryByText('Loading...');
        expect(title).toBeDefined();
    });

    it('render slider', () => {
        useState.mockImplementationOnce(() => [[2.00, 4.00, 6.00, 8.00], jest.fn()]);
        const { container } = render(<Exercise2Page />);
        const slider = container.querySelector('.Slider');
        expect(slider).not.toBeNull();
    });
});