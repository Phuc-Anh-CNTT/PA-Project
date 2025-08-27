import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import KQBH from "./pages/KQBH";

function App() {
  return (
    <Router>
      <Routes>
        {/*<Route path="/" element={<ndyduc />} />*/}
        <Route path="/searchingKQBH" element={<KQBH />} />
      </Routes>
    </Router>
  );
}

export default App;