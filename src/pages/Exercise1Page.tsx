import React, { useState, useEffect } from "react";
import Range from "../components/Range/Range";

const Exercise1Page = () => {
    const [state, setState] = useState({ minValue: undefined, maxValue: undefined });

    useEffect(() => {
        fetch('http://localhost:8000/exercise1').then(res => res.json()).then(data => {
            setState({ minValue: data.min, maxValue: data.max});
        }).catch(error => {
            console.log(error);
        });
    }, []);

    return (<>
        <div className="container mt-3">
        <h1 className="mb-5"> Exercise 1</h1>
        {state.minValue !== undefined && state.maxValue !== undefined ?  
            <Range mode={'slider'} rangedValues={[]} limitMin={state.minValue} limitMax={state.maxValue}  /> 
        : <div> Loading... </div>
        }
        </div>
    </>);
};

export default Exercise1Page;