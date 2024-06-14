import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Input, Select, Toast } from "react-daisyui";
import axios from "axios";
import { getPossibleLLMCategories } from "../utils";

function AddLLM() {
  const [company, setCompany] = useState('');
  const [modelName, setModelName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [category, setCategory] = useState('');
  const [numMillionParams, setNumMillionParams] = useState(0);
  const [possibleCategories, setPossibleCategories] = useState([]);

  const [notification, setNotification] = useState(undefined);

  useEffect(() => {
    getPossibleLLMCategories()
        .then(categories => setPossibleCategories(categories));
  }, []);

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
            message: "LLM added to the database!"
          }
      );
      // Clear form fields after successful addition
      setCompany('');
      setModelName('');
      setReleaseDate('');
      setCategory('');
      setNumMillionParams(0);
    }).catch(error => {
      let message = "An unexpected error happened";
      if (error.response) {
        switch (error.response.status) {
          case 409:
            message = "The LLM you tried to add is already in the database"
            break;
          default:
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

  const today = new Date().toISOString().split('T')[0]; // Get today's date

  return (
      <>
        <section className="grid place-items-center mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
            <Card className="shadow-xl w-full md:w-auto"> {/* Adjust the width of the card */}
              <Card.Body>
                <Card.Title tag="h2">Add a New LLM</Card.Title>
                <div className="flex flex-col" style={{ gap: '8px' }}>
                  <label className="label">Company</label>
                  <Input placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />

                  <label className="label">Model Name</label>
                  <Input placeholder="Model Name" value={modelName} onChange={e => setModelName(e.target.value)} />

                  <label className="label">Release Date</label>
                  <Input type="date" placeholder="Release Date" max={today} value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />

                  <label className="label">Category</label>
                  <Select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value={''} disabled>Select Category</option>
                    {possibleCategories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                    ))}
                  </Select>

                  <label className="label">Number of Million Parameters</label>
                  <Input type="number" placeholder="Number of Million Parameters" value={numMillionParams} onChange={e => setNumMillionParams(parseInt(e.target.value))} />

                  <Button onClick={() => handleSaveLLM(false)}>Add LLM</Button>
                </div>
              </Card.Body>
            </Card>
            <Card className="shadow-xl w-full md:w-auto"> {/* Adjust the width of the card */}
              <Card.Body className="flex flex-col items-center justify-center">
                <Card.Title tag="h2">Generate Random LLM</Card.Title>
                <Button className="mt-4" onClick={() => handleSaveLLM(true)}>Generate</Button>
              </Card.Body>
            </Card>
          </div>
        </section>

        {notification &&
            <Toast vertical='top' horizontal='end'>
              <Alert status={notification.type}>{notification.message}</Alert>
            </Toast>
        }
      </>
  );
}

export default AddLLM;
