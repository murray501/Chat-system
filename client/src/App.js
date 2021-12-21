import React from "react";
import {Routes, Route} from "react-router-dom";
import { Whoops404 } from "./pages";
import Home from "./home";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Whoops404 />} />
      </Routes>
    </div>
  )
}

export default App;
