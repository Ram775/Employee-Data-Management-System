import { useState, useEffect } from "react";
import axios from "axios";

export default function UserForm() {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});

  // 1. Admin ka banaya hua form structure fetch karein
  useEffect(() => {
    const fetchForm = async () => {
      const { data } = await axios.get(
        "http://localhost:5000/api/forms/get-form",
      );
      if (data && data.fields) setFields(data.fields);
    };
    fetchForm();
  }, []);

  // 2. Input handle karein
  const handleChange = (label, value) => {
    setFormData({ ...formData, [label]: value });
  };

  // 3. Data submit karein
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/user/submit", formData);
      alert("Form submitted successfully!");
    } catch (err) {
      alert("Error submitting form");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <h2 className="text-2xl font-bold mb-4">Employee Data Form</h2>
      {fields.map((f, i) => (
        <div key={i} className="mb-4">
          <label className="block mb-1">{f.label}</label>
          <input
            className="border p-2 w-full"
            type={f.type}
            onChange={(e) => handleChange(f.label, e.target.value)}
            required
          />
        </div>
      ))}
      <button type="submit" className="bg-blue-600 text-white p-3 rounded">
        Submit Data
      </button>
    </form>
  );
}
