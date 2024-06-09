import React, {useEffect} from 'react';
import {Input, Select, Table} from "react-daisyui";
import axios from "axios";

function ListLLMs() {
  const [llms, setLLMs] = React.useState([]);
  const [filterCategory, setFilterCategory] = React.useState('');
  const [filterCompany, setFilterCompany] = React.useState('');
  const [filteredLLMs, setFilteredLLMs] = React.useState([]);
  const possibleCategories = ['Vision', 'Instruct', 'Chat', 'Other']; //TODO fetch from API

  useEffect(() => {
    axios.get('http://localhost:8000/llms').then(response => {
      setLLMs(response.data.llms);
    }).catch(error => {
      console.error(error);
    });
  }, []);

  useEffect(() => {
    setFilteredLLMs(llms.filter(llm => {
      const categoryMatch = !filterCategory || llm.category.toLowerCase() === filterCategory.toLowerCase();
      const companyMatch = !filterCompany || llm.company.toLowerCase().includes(filterCompany.toLowerCase());
      return categoryMatch && companyMatch;
    }));
  }, [llms, filterCategory, filterCompany]);

  return (
    <div className="container mx-auto p-4 ">
      <div className="prose lg:prose-xl">
        <h3 className="text-left">Browse the Large Language Models!</h3>
        <p className="text-left"> You can filter the results in the table using the appropriate input fields below.</p>
      </div>

      <Table zebra className="mt-7">
        <Table.Head>
          <span/>
          <span>Company</span>
          <span>Model name</span>
          <span>Release date</span>
          <span>Category</span>
          <span>Num. million parameters</span>
        </Table.Head>

        <Table.Body>
          <Table.Row>
            <span/>
            <div >
              <Input className="w-full" placeholder="Filter by company..." onChange={e => setFilterCompany(e.target.value)}/>
            </div>
            <span/>
            <span/>
            <div >
              <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full">
                <option value={''}>
                  Filter by category
                </option>
                {possibleCategories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </Select>
            </div>
            <span/>
          </Table.Row>
          {filteredLLMs.map((llm, index) => (
            <Table.Row key={index}>
              <span>{index}</span>
              <span>{llm.company}</span>
              <span>{llm.model_name}</span>
              <span>{llm.release_date}</span>
              <span>{llm.category}</span>
              <span>{llm.num_million_parameters}</span>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

export default ListLLMs;