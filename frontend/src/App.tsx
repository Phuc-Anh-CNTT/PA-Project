import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import KQBH from "./pages/KQBH";
import Ndyduc from './ndyduc';

function App() {
    return (
        <Router>
            <div className="w-full flex flex-col min-h-screen">
                <Routes>
                    {/*<Route path="/" element={<ndyduc />} />*/}
                    <Route path="/" element={<KQBH/>}/>
                </Routes>
                <Ndyduc/>
            </div>
        </Router>
    );
}

export default App;