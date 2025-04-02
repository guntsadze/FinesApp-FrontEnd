import { useState, useEffect } from "react";
import axios from "axios";

const useCRUD = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the list of items
  const getList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url);
      setData(response.data);
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Create new item
  const create = async (item) => {
    try {
      await axios.post(url, item);
      getList(); // Re-fetch data after creation
    } catch (err) {
      setError("Error creating item");
    }
  };

  // Get single item
  const get = async (id) => {
    try {
      const response = await axios.get(`${url}/${id}`);
      return response.data;
    } catch (err) {
      setError("Error fetching item");
    }
  };

  // Update item
  const update = async (id, item) => {
    try {
      await axios.put(`${url}/${id}`, item);
      getList(); // Re-fetch data after update
    } catch (err) {
      setError("Error updating item");
    }
  };

  // Delete item
  const remove = async (id) => {
    try {
      await axios.delete(`${url}/${id}`);
      getList(); // Re-fetch data after deletion
    } catch (err) {
      setError("Error deleting item");
    }
  };

  useEffect(() => {
    getList();
  }, [url]);

  return { data, loading, error, create, get, update, remove };
};
export default useCRUD;
