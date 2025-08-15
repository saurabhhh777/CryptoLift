
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import Tokenlaunchpad from "./pages/Tokenlaunchpad";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/launch-token" element={<Tokenlaunchpad />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
