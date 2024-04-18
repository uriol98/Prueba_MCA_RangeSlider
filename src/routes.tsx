import React from "react";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import Exercise1Page from "./pages/Exercise1Page";
import Exercise2Page from "./pages/Exercise2Page";

const RouterApp = () => {

    return (
        <Router>
            <Routes>
                <Route path="/exercise1" element={<Exercise1Page />} />
                <Route path="/exercise2" element={<Exercise2Page />} />
                <Route path="*" element={ <Navigate to={"/exercise1"} replace />} />
            </Routes>
        </Router>
    );
};

export default RouterApp;