import React, { useEffect, useState } from "react";
import Range from "../components/Range/Range";

const Exercise2Page = () => {

    const [rangedValues, setRangedValues] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/exercise2').then(res => res.json()).then(data => {
        const sortedArray =  data.rangedValues.sort((a: number, b: number) => a - b);   
        setRangedValues(sortedArray);
        }).catch(error => {
            console.log(error);
        });
    }, []);
    return (<>
        <div className="container mt-3">
        <h1 className="mb-5"> Exercise 2</h1>
        { rangedValues.length !== 0 ? 
        <Range mode={'ranged'} limitMin={rangedValues[0]} limitMax={rangedValues[rangedValues.length-1]} rangedValues={rangedValues}/>
        : 
        <div> Loading... </div>
        }
        </div>
    </>);
};

export default Exercise2Page;