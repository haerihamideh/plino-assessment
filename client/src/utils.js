import axios from "axios";

const API_URL = 'http://localhost:8000';

// Get the possible LLM categories from the API
export async function getPossibleLLMCategories() {
  const response = await axios.get(`${API_URL}/config`);
  return response.data.allowed_llm_categories;
}