import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const nameRegex = /^.{20,60}$/;
const addressMaxLength = 400;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,16}$/;
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!nameRegex.test(form.name.trim())) {
      newErrors.name = "Name must be between 20 and 60 characters.";
    }
    if (form.address.length > addressMaxLength) {
      newErrors.address = "Address must be at most 400 characters.";
    }
    if (!emailRegex.test(form.email.toLowerCase())) {
      newErrors.email = "Invalid email address.";
    }
    if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "Password must be 8-16 chars, include one uppercase and one special character.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form);
      navigate("/stores");
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto border border-slate-800 bg-slate-900/70">
      <h2 className="text-lg font-semibold text-slate-50">
        Signup as Normal User
      </h2>
      <p className="mt-1 text-sm text-slate-300">
        Create an account to start rating stores on the platform.
      </p>
      <form onSubmit={handleSubmit} className="mt-4">
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          labelClassName="text-slate-200"
          className="border-slate-700 bg-slate-900 text-slate-50 placeholder-slate-500"
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          labelClassName="text-slate-200"
          className="border-slate-700 bg-slate-900 text-slate-50 placeholder-slate-500"
          required
        />
        <Input
          label="Address"
          name="address"
          value={form.address}
          onChange={handleChange}
          error={errors.address}
          labelClassName="text-slate-200"
          className="border-slate-700 bg-slate-900 text-slate-50 placeholder-slate-500"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          labelClassName="text-slate-200"
          className="border-slate-700 bg-slate-900 text-slate-50 placeholder-slate-500"
          required
        />
        {submitError && (
          <div className="mt-1 text-xs text-red-400">{submitError}</div>
        )}
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Signup"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default Signup;

