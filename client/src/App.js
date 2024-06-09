import {Link, Route, Routes} from "react-router-dom";
import './App.css';
import AddLLM from "./pages/AddLLM";
import ListLLMs from "./pages/ListLLMs";
import {Button, Footer, Menu, Navbar} from "react-daisyui";

function App() {
  return (
    <div className="App">
      <Navbar className="bg-base-300 text-base-content">
        <div className="flex-1">
          <Button tag="a" color="ghost" className="normal-case text-xl">
            Plino - Tech assessment
          </Button>
        </div>
        <div className="flex-none">
          <Menu horizontal={true} className="px-1">
            <Menu.Item>
              <Link to="/">Add a new LLM</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to="/list">List the LLMs</Link>
            </Menu.Item>
          </Menu>
        </div>
      </Navbar>

      <Routes>
        <Route exact path="/" element={<AddLLM/>}/>
        <Route path="/list" element={<ListLLMs/>}/>
      </Routes>

      <Footer className="footer-center p-4 bg-base-300 text-base-content fixed inset-x-0 bottom-0">
        <aside>
          <p>Developed with ❤️ by Giuseppe Steduto for Plino</p>
        </aside>
      </Footer>
    </div>
  );
}

export default App;
