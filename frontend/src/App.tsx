import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import KQBH from "./pages/KQBH";
import Ndyduc from './ndyduc';

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Routes>
                    {/*<Route path="/" element={<ndyduc />} />*/}
                    <Route path="/searchingKQBH" element={<KQBH/>}/>
                </Routes>
                <Ndyduc/>
            </div>
        </Router>
);
}

export default App;