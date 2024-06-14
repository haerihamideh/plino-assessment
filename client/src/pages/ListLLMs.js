import React, {useEffect, useState} from 'react';
import {Button, Card, Input, Select, Table} from "react-daisyui";
import axios from "axios";
import {getPossibleLLMCategories} from "../utils";

function ListLLMs() {
  const [llms, setLLMs] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filteredLLMs, setFilteredLLMs] = useState([]);
  const [possibleCategories, setPossibleCategories] = useState([]);

  useEffect(() => {
    getPossibleLLMCategories()
        .then(categories => setPossibleCategories(categories));

    axios.get('http://localhost:8000/llms').then(response => {
      setLLMs(response.data.llms);
    }).catch(error => {
      console.error(error);
    });

    // Initialize WebSocket connection to listen for new LLMs
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onopen = () => {
      console.log('WebSocket connected');
    }
    ws.onmessage = (event) => {
      const newLLM = JSON.parse(event.data);
      setLLMs(prevLLMs => [...prevLLMs, newLLM]);
    };
    ws.onerror = (error) => {
      console.error(error);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    setFilteredLLMs(llms.filter(llm => {
      const categoryMatch = !filterCategory || llm.category.toLowerCase() === filterCategory.toLowerCase();
      const companyMatch = !filterCompany || llm.company.toLowerCase().includes(filterCompany.toLowerCase());
      return categoryMatch && companyMatch;
    }));
  }, [llms, filterCategory, filterCompany]);

  return (
      <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
        <Card className="w-full bg-white shadow-lg">
          <Card.Body>
            <Card.Title className="text-center text-2xl font-bold mb-6">List of LLMs</Card.Title>
            <Table className="table-auto w-full">
              <thead>
              <tr className="bg-gray-200">
                <th className="p-4">#</th>
                <th className="p-4">Company</th>
                <th className="p-4">Model Name</th>
                <th className="p-4">Release Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Number of Million Parameters</th>
              </tr>
              <tr>
                <td className="p-4"/>
                <td className="p-4">
                  <Input className="w-full" placeholder="Filter by company" onChange={e => setFilterCompany(e.target.value)} />
                </td>
                <td className="p-4"/>
                <td className="p-4"/>
                <td className="p-4">
                  <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full">
                    <option value={''}>Filter by category</option>
                    {possibleCategories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </td>
                <td className="p-4"/>
              </tr>
              </thead>
              <tbody>
              {filteredLLMs.map((llm, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 text-center">{index + 1}</td>
                    <td className="p-4">{llm.company}</td>
                    <td className="p-4">{llm.model_name}</td>
                    <td className="p-4">{llm.release_date}</td>
                    <td className="p-4">{llm.category}</td>
                    <td className="p-4 text-right">{llm.num_million_parameters}</td>
                  </tr>
              ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
  );
}

export default ListLLMs;
