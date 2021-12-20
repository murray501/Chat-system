import React from "react";
import {Routes, Route} from "react-router-dom";
import {
  Home,
  Whoops404,
} from "./pages";

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
