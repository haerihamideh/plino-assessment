import { Link, Route, Routes } from "react-router-dom";
import './App.css';
import AddLLM from "./pages/AddLLM";
import ListLLMs from "./pages/ListLLMs";
import { Menu, Navbar } from "react-daisyui";

function App() {
    return (
        <div className="App min-h-screen bg-gray-50">
            <Navbar className="bg-slate-600 text-white shadow-lg max-w-6xl mx-auto px-6 py-0.5 rounded-b-lg">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight font-sans">
                        LLM Management
                    </h1>
                </div>
                <div className="flex-none">
                    <Menu horizontal className="space-x-4">
                        <Menu.Item>
                            <Link to="/" className="btn btn-ghost text-white normal-case text-lg hover:bg-indigo-500">
                                Add LLM
                            </Link>
                        </Menu.Item>
                        <Menu.Item>
                            <Link to="/list" className="btn btn-ghost text-white normal-case text-lg hover:bg-indigo-500">
                                List LLMs
                            </Link>
                        </Menu.Item>
                    </Menu>
                </div>
            </Navbar>

            <main className="pt-0 pr-2 pb-4 pl-2  max-w-6xl mx-auto bg-white shadow-md rounded-lg mt-6">
                <Routes>
                    <Route exact path="/" element={<AddLLM />} />
                    <Route path="/list" element={<ListLLMs />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
