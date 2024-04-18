import React, {useEffect, useState, useRef, useMemo } from "react";

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

interface RangeProps {
    mode: 'slider' | 'ranged';
    limitMin?: number;
    limitMax?: number;
    rangedValues?: number[];
};

interface InputLabelProps {
    mode: string, minMax: string, value: number, onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void,
}

interface LabelMinMax {
    min: string,
    max: string,
    [key: string]: string;
};

interface Configuration {
    slider: {
        slider: { min: number; max: number };
        updateValue: (evt: React.MouseEvent<HTMLDivElement>) => void;
        handleMouseUp: () => void,
    };
    ranged: {
        slider: { min: number; max: number };
        updateValue: (evt: React.MouseEvent<HTMLDivElement>) => void;
        handleMouseUp: () => void,
    };
}

const Range = ({mode, limitMin = 0, limitMax = 100, rangedValues = []}: RangeProps) => {
    const [minState, setMinState] = useState({ ...initialMinState});
    const [maxState, setMaxState] = useState({ ...initialMaxState});
    const sliderRef = useRef(null);

    useEffect(() => {
            setMaxState((prevState) =>  ({ ...prevState, maxReal: mode === 'slider' && limitMax ? limitMax : 100.00 }));
            setMinState((prevState) => ({ ...prevState, minReal: mode === 'slider' && limitMin ? limitMin : 0 }));
    }, [limitMin, limitMax, mode]);
    
    // RANGED

    const  positionValues = useMemo(() => {
        if(!rangedValues || rangedValues.length === 0) return [];
        const relativeStep = rangedValues ? 100/(rangedValues.length -1) : 0;
        let positionValues: any = [];
            rangedValues.forEach((value, idx) => {
                positionValues.push({ position: (relativeStep * idx).toFixed(2), value});
            });
        return  positionValues;
    }, [rangedValues])

    const [minPosition, maxPosition] = useMemo(() => {
        let min;
        let max;
        if(positionValues && positionValues.length !== 0){
             min = positionValues?.find((x: any) => x.position === minState.minReal.toFixed(2));
             max = positionValues?.find((x: any) => x.position === maxState.maxReal.toFixed(2));
        }
        return [min?.value || rangedValues[0], max?.value || rangedValues[rangedValues.length-1]];
    }, [minState.minReal, maxState.maxReal, positionValues, rangedValues]);
   
    const updateValueRanged = (evt: React.MouseEvent<HTMLDivElement>) => {
        const offsetX = evt.clientX;
        //@ts-ignore
        const rect = sliderRef?.current?.getBoundingClientRect();
        const percentage = ((offsetX - rect.left) / rect.width) * 100;
        if (minState.isDragging) {
            const minRelative = Math.min(Math.max(0, percentage), maxState.maxRelative); 
            //Set position relative. In case is greater than max, set to minReal
            setMinState((prevState) => ({ ...prevState, minRelative: minRelative < maxState.maxReal ? minRelative : minState.minReal }));
            //find if relative position matches a range value position
            const minReal = positionValues.find((x: any) => minRelative > x.position -4 && minRelative < x.position +4 );
            if(minReal) setMinState((prevState) => ({ ...prevState, minReal: parseFloat(minReal.position) }));
        } else if (maxState.isDragging) {
            const maxRelative = Math.max(Math.min(100, percentage), minState.minRelative);
            // Set position relative. In case is lower than min, set to maxReal 
            setMaxState((prevState) => ({ ...prevState, maxRelative: maxRelative > minState.minReal ? maxRelative: maxState.maxReal }));
            //find if relative position matches a range value position
            const maxReal = positionValues.find((x: any) => maxRelative > x.position -4 && maxRelative < x.position +4);
            if(maxReal) setMaxState((prevState) => ({ ...prevState, maxReal: parseFloat(maxReal.position) }));
        }
     };

    //SLIDER

    const updateValueSlider = (evt: React.MouseEvent<HTMLDivElement>) => {
        const offsetX = evt.clientX;
        //@ts-ignore
        const rect = sliderRef?.current?.getBoundingClientRect();
        const percentage = ((offsetX - rect.left) / rect.width) * 100;
        if (minState.isDragging) {
            const newValue = Math.min(Math.max(0, percentage), maxState.maxRelative); 
            const minReal = calculateRealValue(newValue);
            setMinState({ ...minState, minRelative: newValue, minReal });
        } else if (maxState.isDragging) {
            const newValue = Math.max(Math.min(100, percentage), minState.minRelative); 
            const maxReal = calculateRealValue(newValue);
            setMaxState({ ...maxState, maxRelative: newValue, maxReal });
        }
     };

    const setMinValue = (evt: React.ChangeEvent<HTMLInputElement>) => {
        evt.preventDefault();
        const min = parseFloat(evt.target.value) || 0;
        const minReal = min < limitMin ? limitMin :  min >= maxState.maxReal ? maxState.maxReal -1 :min;
        const minRelative = calculateRealtiveValue(minReal);
        setMinState({ ...minState, minReal: minReal, minRelative});
    };

    const setMaxValue = (evt: React.ChangeEvent<HTMLInputElement>) => {
        evt.preventDefault();
        const max = parseFloat(evt.target.value) || limitMax;
        const maxReal = max > limitMax ? limitMax : max < minState.minReal ? minState.minReal +1 : max;
        const maxRelative = calculateRealtiveValue(max);
        setMaxState({ ...maxState, maxReal: maxReal, maxRelative});
    };


     const calculateRealtiveValue = ( value: number) => {
        const dist = limitMax - limitMin;
        return Number(((value * 100) / dist).toFixed(2));
     };
    
     const calculateRealValue = ( value: number) => {
        const dist = limitMax - limitMin;
        return Number(((value * dist) / 100).toFixed(2));
     };

    //COMMON 

    const handleMouseUp = () => {
        setMaxState({ ...maxState, isDragging: false});
        setMinState({ ...minState, isDragging: false});
     }
    const handleMouseUpRanged = () => {
        setMaxState({ ...maxState, maxRelative: maxState.maxReal, isDragging: false});
        setMinState({ ...minState, minRelative: minState.minReal, isDragging: false});
     }

     const handleMouseDownMin = () => setMinState({ ...minState, isDragging: true});
     const handleMouseDownMax = () => setMaxState({ ...maxState, isDragging: true });

     const configuration: Configuration = {
        slider: {
            slider: { min: minState.minRelative, max: maxState.maxRelative},
            updateValue: updateValueSlider,
            handleMouseUp: handleMouseUp,

        },
        ranged: {
            slider: { min: minState.minRelative, max: maxState.maxRelative},
            updateValue: updateValueRanged,
            handleMouseUp: handleMouseUpRanged,
        },
        
    };

    return (<>
        <div className="w-50 mb-5 d-md-flex justify-content-md-between">
            <InputLabel mode={mode} minMax="min" value={mode === 'slider' ? minState.minReal : minPosition} onChange={setMinValue} />
            <InputLabel mode={mode} minMax="max" value={mode === 'slider' ? maxState.maxReal : maxPosition} onChange={setMaxValue} />
        </div>

        <div className="Slider" ref={sliderRef} onMouseMove={configuration[mode].updateValue} onMouseUp={configuration[mode].handleMouseUp}>
            <div className="mb-3 d-md-flex justify-content-md-end">
                <span> {limitMin}</span>
                <div className="flex-grow-1"></div>
                <span>{limitMax}</span>
            </div>
                { mode === 'ranged' && positionValues && positionValues.length !== 0 && positionValues.map( (_: any, idx: number) => {
                    return (<div key={idx} className="Slider-step" style={{ left: `${positionValues[idx].position}%`}}></div>)
                })}
            <div className="Slider-track">
                <div className="Slider-pointer" onMouseDown={handleMouseDownMin} style={{  left: `${configuration[mode].slider.min-4}%`}} id="minReal">
                </div>
                <div className="Slider-pointer" onMouseDown={handleMouseDownMax} style={{  left: `${configuration[mode].slider.max-4}%`}} id="maxReal">
                </div>
            </div>
        </div>
    </>)
};


const InputLabel = ({ mode, minMax, value, onChange }: InputLabelProps)=> {
    // crear state interno y con un timeout disparar el evento para el debounce 
    //de esta forma no daria problemas a la hora de actualizar el valor maximo a traves de input
    const label: LabelMinMax = {
        min: 'min Value:',
        max: 'max Value:',
    };
    return(
        <div>
        {mode === 'slider' ? (<>
        <label> min value</label>
        <input type="number"  name="minReal" value={value} onChange={onChange}/>
        </>)
            : <label>{`${label[minMax]} ${value}`}</label>
        }
    </div>
    )
};


export default Range;