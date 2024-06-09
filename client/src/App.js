import './App.css';
import {Alert, Button, Card, Divider, Input, Select, Toast} from "react-daisyui";
import {useState} from "react";
import axios from "axios";

function App() {
  const [company, setCompany] = useState('');
  const [modelName, setModelName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [category, setCategory] = useState('');
  const [numMillionParams, setNumMillionParams] = useState(0);
  const possibleCategories = ['Vision', 'Instruct', 'Chat', 'Other']; //TODO fetch from API

  const [notification, setNotification] = useState(undefined);

  const handleSaveLLM = (isLLMRandom) => {
    let data = undefined;
    let APIrequest;
    if (!isLLMRandom) {
      data = {
        company: company,
        model_name: modelName,
        release_date: releaseDate,
        category: category,
        num_million_parameters: numMillionParams,
      }
      APIrequest = axios.post('http://localhost:8000/llm', data);
    } else {
      APIrequest = axios.post('http://localhost:8000/llm');
    }
    APIrequest.then(response => {
      setNotification(
        {
          type: "success",
          message: "LLM added successfully!"
        }
      );
    }).catch(error => {
      let message = "An unexpected error occurred while adding the LLM!";
      if (error.response) {
        switch (error.response.status) {
          case 409:
            message = "The LLM you tried to add is already in the DB!"
            break;
        }
      }
      setNotification(
        {
          type: "error",
          message: message
        }
      );
    }).finally(
      // Hide the notification after 5 seconds
      () => {
        setTimeout(() => {
          setNotification(undefined);
        }, 5000);
      }
    )
  }

  return (
    <div className="App">
      <nav className="navbar bg-base-300 text-base-content">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Plino - Tech assessment</a>
        </div>
      </nav>

      <section className="grid place-items-center mt-6">
        <Card className="sm:w-full md:w-1/2 lg:w-1/3">
          <Card.Body>
            <Card.Title tag="h2">Add a new LLM!</Card.Title>

            <div className="grid grid-cols-6 gap-4">
              <div className="form-control col-span-6 md:col-span-3 w-full">
                <label className="label">
                  <span className="label-text">Company</span>
                </label>
                <Input onChange={e => setCompany(e.target.value)}/>
              </div>

              <div className="form-control col-span-6 md:col-span-3 w-full">
                <label className="label">
                  <span className="label-text">Model name</span>
                </label>
                <Input onChange={e => setModelName(e.target.value)}/>
              </div>

              <div className="form-control col-span-6 md:col-span-2 w-full">
                <label className="label">
                  <span className="label-text">Release date</span>
                </label>
                <Input type="date" onChange={e => setReleaseDate(e.target.value)}/>
              </div>

              <div className="form-control col-span-6 md:col-span-2 w-full">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <Select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value={''} disabled>
                    Choose a category
                  </option>
                  {possibleCategories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </Select>
              </div>

              <div className="form-control col-span-6 md:col-span-2 w-full">
                <label className="label">
                  <span className="label-text">Num. million parameters</span>
                </label>
                <Input type="number" onChange={e => setNumMillionParams(parseInt(e.target.value))}/>
              </div>

              <Button className="col-span-6 btn-primary mt-2"
                      onClick={() => handleSaveLLM(false)}>Add!</Button>
            </div>


            <Divider>or</Divider>

            <Button className="btn-secondary" onClick={() => handleSaveLLM(true)}>Generate randomly</Button>
          </Card.Body>
        </Card>
      </section>

      {/* TODO in the future, improve the notification system by allowing multiple alerts to be shown at the same time */}
      {notification &&
        <Toast vertical='top' horizontal='end'>
          <Alert status={notification.type}>{notification.message}</Alert>
        </Toast>
      }

      <footer className="footer footer-center p-4 bg-base-300 text-base-content fixed inset-x-0 bottom-0">
        <aside>
          <p>Developed with ❤️ by Giuseppe Steduto for Plino</p>
        </aside>
      </footer>
    </div>
  );
}

export default App;
