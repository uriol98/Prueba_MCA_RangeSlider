import React from 'react';
import { render, screen } from '@testing-library/react';
import Range from './Range/Range';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));
import { useState } from 'react';

const initialMinState = {
    minReal: 0,
    minRelative: 0,
    isDragging: false,
};
const initialMaxState = {
    maxReal: 0,
    maxRelative: 100,
    isDragging: false,
};


const mockState = (minState, maxState, minSetState, maxSetState) => {
    useState.mockImplementationOnce(() => [minState || initialMinState, minSetState || jest.fn()]).
    mockImplementationOnce(() => [maxState || initialMaxState, maxSetState || jest.fn()]);
}

describe('Exercise2Page test', () => {
    beforeEach(()=>{
        useState.mockImplementationOnce(jest.requireActual('react').useState);
      })

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.resetModules();
    });

    it('render slider mode ranged', () => {
        mockState(undefined, undefined, undefined, undefined);
        const mockRef = { current: null };
        jest.spyOn(React, 'useRef').mockReturnValueOnce(mockRef);

        const { container } = render(<Range mode="ranged" limitMax={4.00} limitMin={0.00} rangedValues={[0.00, 2.00, 4.00]} />);
        const input = container.querySelector('<input>');
        expect(input).not.toBeNull();
    });

    it('drag min', () => {
        const setState = jest.fn();
        mockState(undefined, undefined, setState, undefined);
        const mockRef = { current: null };
        jest.spyOn(React, 'useRef').mockReturnValueOnce(mockRef);

        const { container } = render(<Range mode="slider" limitMax={4.00} limitMin={0.00} rangedValues={[0.00, 2.00, 4.00]} />);
        const input = container.querySelector('#minReal');
        input.dispatchEvent(onmousedown);
        expect(setState).toHaveBeenCalledWith(expect.objectContaining({isDragging: true}));
    });
    it('drag max', () => {
        const setState = jest.fn();
        mockState(undefined, undefined, setState, undefined);
        const mockRef = { current: null };
        jest.spyOn(React, 'useRef').mockReturnValueOnce(mockRef);

        const { container } = render(<Range mode="slider" limitMax={4.00} limitMin={0.00} rangedValues={[0.00, 2.00, 4.00]} />);
        const input = container.querySelector('#maxReal');
        input.dispatchEvent(onmousedown);
        expect(setState).toHaveBeenCalledWith(expect.objectContaining({isDragging: true}));
    });
});