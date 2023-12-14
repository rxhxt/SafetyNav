import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Maps from './components/Maps';
import Routing from './components/Routing';
import NavbarComponent from './components/NavbarComponent';
import Report from './components/Report'

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<React.Fragment> {/* or use <>...</> for short syntax */}
            <NavbarComponent />
            <div>

              <Maps />
            </div>
          </React.Fragment>} />

          <Route path="/routing" element={<React.Fragment> {/* or use <>...</> for short syntax */}
            <NavbarComponent />
            <div>
              <Routing />
            </div>
            </React.Fragment>} />
            <Route path="/complaint" element={<React.Fragment> {/* or use <>...</> for short syntax */}
            <NavbarComponent />
            <div>
              <Report />
            </div>
            </React.Fragment>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
