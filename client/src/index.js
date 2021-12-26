import React from 'react';
import {render} from 'react-dom';
import App from './App';
import "bulma/css/bulma.css";

import { BrowserRouter as Router } from "react-router-dom";

render(
  <Router>
    <App />
  </Router>,
  document.getElementById("content")
);