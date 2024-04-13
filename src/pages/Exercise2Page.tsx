import React, { useEffect, useState } from "react";
import Range from "../components/Range/Range";

const Exercise2Page = () => {

    const [rangedValues, setRangedValues] = useState([0]);

    useEffect(() => {
        fetch('http://localhost:8000/exercise2').then(res => res.json()).then(data => {
            setRangedValues(data.rangedValues);
        })
    }, []);
    return (<>
        <div className="container mt-3">
        <h1 className="mb-5"> Prueba</h1>
        <Range mode={2} limitMin={rangedValues[0]} limitMax={rangedValues[rangedValues.length-1]} rangedValues={rangedValues}/>
        </div>
    </>);
};

export default Exercise2Page;