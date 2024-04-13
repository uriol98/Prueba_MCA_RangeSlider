import { any, number } from "prop-types";
import React, {useEffect, useState, useRef, useMemo } from "react";

const initialMinState = {
    minValue: 0,
    minRelative: 0,
    isDragging: false,
};
const initialMaxState = {
    maxValue: 0,
    maxRelative: 100,
    isDragging: false,
};

interface RangeProps {
    mode: number;
    limitMin?: number;
    limitMax?: number;
    rangedValues?: number[];
};

const Range = ({mode, limitMin = 0, limitMax = 100, rangedValues = []}: RangeProps) => {
    return (<>
        {mode && {
            1: <Slider1 mode={mode} limitMax={limitMax} limitMin={limitMin} />,
            2: <Slider2 mode={mode} limitMax={limitMax} limitMin={limitMin} rangedValues={rangedValues}/>
        }[mode]}
    </>)
}

const Slider2 = ({mode, limitMin = 0, limitMax = 100, rangedValues = []}: RangeProps) => {
    const [minState, setMinState] = useState({ ...initialMinState});
    const [maxState, setMaxState] = useState({ ...initialMaxState});

    const sliderRef = useRef(null);
   
    const [relativeStep, positionValues] = useMemo(() => {
        const relativeStep = rangedValues ? 100/(rangedValues.length -1) : 0;
        let positionValues: any = [];
        if(rangedValues){
            rangedValues.forEach((value, idx) => {
                positionValues.push({ position: (relativeStep * idx).toFixed(2), value});
            });
        }
        return [relativeStep, positionValues];
    }, [rangedValues])

    const [minPosition, maxPosition] = useMemo(() => {
        let min;
        let max;
        if(positionValues){
             min = positionValues.find((x: any) => x.position === minState.minValue.toFixed(2));
             max = positionValues.find((x: any) => x.position === maxState.maxValue.toFixed(2));
        }
        return [min?.value || rangedValues[0], max?.value || rangedValues[rangedValues.length-1]];
    }, [minState.minValue, maxState.maxValue, positionValues]);

    useEffect(() => {
        if(mode === 1){
            setMaxState({ ...maxState, maxValue: limitMax || 100});
            setMinState({ ...minState, minValue: limitMin || 0});
        }
        else if(mode === 2) {
            setMinState({ ...minState, minValue: 0.00})
            setMaxState({ ...maxState, maxValue: 100.00})
        };
    }, [limitMin, limitMax]);
    
     const updateValueMode1 = (evt: React.MouseEvent<HTMLDivElement>) => {
        const offsetX = evt.clientX;
        //@ts-ignore
        const rect = sliderRef?.current?.getBoundingClientRect();
        const percentage = ((offsetX - rect.left) / rect.width) * 100;
        if (minState.isDragging) {
            const minRelative = Math.min(Math.max(0, percentage), maxState.maxRelative); 
            setMinState((prevState) => ({ ...prevState, minRelative: minRelative < maxState.maxValue ? minRelative : minState.minValue }));
            const minReal = positionValues.find((x: any) => x.position === minRelative.toFixed(2));
            if(minReal) setMinState((prevState) => ({ ...prevState, minValue: parseFloat(minReal.position) }));
        } else if (maxState.isDragging) {
            const maxRelative = Math.max(Math.min(100, percentage), minState.minRelative); 
            setMaxState((prevState) => ({ ...prevState, maxRelative: maxRelative > minState.minValue ? maxRelative: maxState.maxValue }));
            const maxReal = positionValues.find((x: any) => x.position === maxRelative.toFixed(2));
            if(maxReal) setMaxState((prevState) => ({ ...prevState, maxValue: parseFloat(maxReal.position) }));
        }
     };

     const handleMouseUp = () => {
        setMaxState({ ...maxState, isDragging: false});
        setMinState({ ...minState, isDragging: false});
     }

     const handleMouseDownMin = () => setMinState({ ...minState, isDragging: true});
     const handleMouseDownMax = () => setMaxState({ ...maxState, isDragging: true });

 

    return (
    <>
        <div className="w-50 mb-5 d-md-flex justify-content-md-between">
            <div>
                <label> min value: {minPosition}</label>
            </div>
            <div>
                <label> max value: {maxPosition}</label>
            </div>
        </div>

        <div className="Slider" ref={sliderRef} onMouseMove={updateValueMode1} onMouseUp={handleMouseUp}>
            <div className="mb-3 d-md-flex justify-content-md-end">
                <span> {limitMin}</span>
                <div className="flex-grow-1"></div>
                <span>{limitMax}</span>
            </div>
            <div className="Slider-track">
                { positionValues && positionValues.map( (_: any, idx: number) => {
                    return (<div key={idx} className="Slider-step" style={{ left: `${positionValues[idx].position}%`}}></div>)
                })}
                <div className="Slider-pointer" onMouseDown={handleMouseDownMin} style={{  left: `${minState.minValue-4}%`}} id="minValue">
                </div>
                <div className="Slider-pointer" onMouseDown={handleMouseDownMax} style={{  left: `${maxState.maxValue-4}%`}} id="maxValue">
                </div>
            </div>
        </div>

    </>);
};





















const Slider1 = ({mode, limitMin = 0, limitMax = 100, rangedValues = []}: RangeProps) => {
    const [minState, setMinState] = useState({ ...initialMinState});
    const [maxState, setMaxState] = useState({ ...initialMaxState});

    const sliderRef = useRef(null);

    useEffect(() => {
        if(mode === 1){
            setMaxState({ ...maxState, maxValue: limitMax || 100});
            setMinState({ ...minState, minValue: limitMin || 0});
        }
        else if(mode === 2) {
            setMinState({ ...minState, minValue: rangedValues[0]})
            setMaxState({ ...maxState, maxValue: rangedValues[rangedValues?.length -1]})
        };
    }, [limitMin, limitMax]);
    
    const setMinValue = (evt: React.FocusEvent<HTMLInputElement>) => {
        evt.preventDefault();
        const min = parseFloat(evt.target.value) || 0;
        const minReal = min < limitMin ? limitMin :  min >= maxState.maxValue ? maxState.maxValue -1 :min;
        const minRelative = calculateRealtiveValue(minReal);
        setMinState({ ...minState, minValue: minReal, minRelative});
    };

    const setMaxValue = (evt: React.FocusEvent<HTMLInputElement>) => {
        evt.preventDefault();
        const max = parseFloat(evt.target.value) || limitMax;
        const maxReal = max > limitMax ? limitMax : max < minState.minValue ? minState.minValue +1 : max;
        const maxRelative = calculateRealtiveValue(max);
        setMaxState({ ...maxState, maxValue: maxReal, maxRelative});
    };

     const updateValueMode1 = (evt: React.MouseEvent<HTMLDivElement>) => {
        const offsetX = evt.clientX;
        //@ts-ignore
        const rect = sliderRef?.current?.getBoundingClientRect();
        const percentage = ((offsetX - rect.left) / rect.width) * 100;
        if (minState.isDragging) {
            const newValue = Math.min(Math.max(0, percentage), maxState.maxRelative); 
            const minValue = calculateRealValue(newValue);
            setMinState({ ...minState, minRelative: newValue, minValue });
        } else if (maxState.isDragging) {
            const newValue = Math.max(Math.min(100, percentage), minState.minRelative); 
            const maxValue = calculateRealValue(newValue);
            setMaxState({ ...maxState, maxRelative: newValue, maxValue });
        }
     };

     const handleMouseUp = () => {
        setMaxState({ ...maxState, isDragging: false});
        setMinState({ ...minState, isDragging: false});
     }

     const handleMouseDownMin = () => setMinState({ ...minState, isDragging: true});
     const handleMouseDownMax = () => setMaxState({ ...maxState, isDragging: true });

     const calculateRealtiveValue = ( value: number) => {
        const dist = limitMax - limitMin;
        return Number(((value * 100) / dist).toFixed(2));
     };

     const calculateRealValue = ( value: number) => {
        const dist = limitMax - limitMin;
        return Number(((value * dist) / 100).toFixed(2));
     };

    return (
    <>
        <div className="w-50 mb-3 d-md-flex justify-content-md-between">
            <div>
                <label> min value</label><input type="number"  name="minValue" value={minState.minValue} onChange={setMinValue}/>
            </div>
            <div>
                <label> max value</label><input type="number" step="any" name="maxValue" value={maxState.maxValue} onChange={setMaxValue}/>
            </div>
        </div>

        <div className="Slider" ref={sliderRef} onMouseMove={updateValueMode1} onMouseUp={handleMouseUp}>
            <div className="mb-3 d-md-flex justify-content-md-end">
                <span> {limitMin}</span>
                <div className="flex-grow-1"></div>
                <span>{limitMax}</span>
            </div>
            <div className="Slider-track">
                <div className="Slider-pointer" onMouseDown={handleMouseDownMin} style={{  left: `${minState.minRelative-6}%`}} id="minValue">
                </div>
                <div className="Slider-pointer" onMouseDown={handleMouseDownMax} style={{  left: `${maxState.maxRelative-6}%`}} id="maxValue">
                </div>
            </div>
        </div>
    </>);
}

// Component amb nomes part 1
// const Range = ({mode, limitMin, limitMax, rangedValues}: RangeProps) => {
//     const [minState, setMinState] = useState({ ...initialMinState});
//     const [maxState, setMaxState] = useState({ ...initialMaxState});

//     const sliderRef = useRef(null);

//     useEffect(() => {
//         if(mode === 1){
//             setMaxState({ ...maxState, maxValue: limitMax || 100});
//             setMinState({ ...minState, minValue: limitMin || 0});
//         }
//         else if(mode === 2) {
//             setMinState({ ...minState, minValue: rangedValues[0]})
//             setMaxState({ ...maxState, maxValue: rangedValues[rangedValues?.length -1]})
//         };
//     }, [limitMin, limitMax]);
    
//     const setMinValue = (evt: React.FocusEvent<HTMLInputElement>) => {
//         evt.preventDefault();
//         const min = parseFloat(evt.target.value) || 0;
//         const minReal = min < limitMin ? limitMin :  min >= maxState.maxValue ? maxState.maxValue -1 :min;
//         const minRelative = calculateRealtiveValue(minReal);
//         setMinState({ ...minState, minValue: minReal, minRelative});
//     };

//     const setMaxValue = (evt: React.FocusEvent<HTMLInputElement>) => {
//         evt.preventDefault();
//         const max = parseFloat(evt.target.value) || limitMax;
//         const maxReal = max > limitMax ? limitMax : max < minState.minValue ? minState.minValue +1 : max;
//         const maxRelative = calculateRealtiveValue(max);
//         setMaxState({ ...maxState, maxValue: maxReal, maxRelative});
//     };

//      const updateValue = (evt: React.MouseEvent<HTMLDivElement>) => {
//         const offsetX = evt.clientX;
//         //@ts-ignore
//         const rect = sliderRef?.current?.getBoundingClientRect();
//         const percentage = ((offsetX - rect.left) / rect.width) * 100;
//         if (minState.isDragging) {
//             const newValue = Math.min(Math.max(0, percentage), maxState.maxRelative); 
//             const minValue = calculateRealValue(newValue);
//             setMinState({ ...minState, minRelative: newValue, minValue });
//         } else if (maxState.isDragging) {
//             const newValue = Math.max(Math.min(100, percentage), minState.minRelative); 
//             const maxValue = calculateRealValue(newValue);
//             setMaxState({ ...maxState, maxRelative: newValue, maxValue });
//         }
//      };

//      const handleMouseUp = () => {
//         setMaxState({ ...maxState, isDragging: false});
//         setMinState({ ...minState, isDragging: false});
//      }

//      const handleMouseDownMin = () => setMinState({ ...minState, isDragging: true});
//      const handleMouseDownMax = () => setMaxState({ ...maxState, isDragging: true });

//      const calculateRealtiveValue = ( value: number) => {
//         const dist = limitMax - limitMin;
//         return Number(((value * 100) / dist).toFixed(2));
//      };

//      const calculateRealValue = ( value: number) => {
//         const dist = limitMax - limitMin;
//         return Number(((value * dist) / 100).toFixed(2));
//      };

//     return (
//     <>
//         <div className="w-50 mb-3 d-md-flex justify-content-md-between">
//             <div>
//                 <label> min value</label><input type="number"  name="minValue" value={minState.minValue} onChange={setMinValue}/>
//             </div>
//             <div>
//                 <label> max value</label><input type="number" step="any" name="maxValue" value={maxState.maxValue} onChange={setMaxValue}/>
//             </div>
//         </div>

//         <div className="Slider" ref={sliderRef} onMouseMove=        {updateValue} onMouseUp={handleMouseUp}>
//             <div className="mb-3 d-md-flex justify-content-md-end">
//                 <span> {limitMin}</span>
//                 <div className="flex-grow-1"></div>
//                 <span>{limitMax}</span>
//             </div>
//             <div className="Slider-track">
//                 <div className="Slider-pointer" onMouseDown={handleMouseDownMin} style={{  left: `${minState.minRelative-6}%`}} id="minValue">
//                 </div>
//                 <div className="Slider-pointer" onMouseDown={handleMouseDownMax} style={{  left: `${maxState.maxRelative-6}%`}} id="maxValue">
//                 </div>
//             </div>
//         </div>
//     </>);
// };

export default Range;