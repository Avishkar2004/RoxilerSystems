import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "ADMIN") {
        navigate("/dashboard");
      } else if (user.role === "STORE_OWNER") {
        navigate("/dashboard");
      } else {
        navigate("/stores");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto border border-slate-800 bg-slate-900/70">
      <h2 className="text-lg font-semibold text-slate-50">Login</h2>
      <p className="mt-1 text-sm text-slate-300">
        Use your email and password to access your account. Admins, normal users,
        and store owners all log in from here.
      </p>
      <form onSubmit={handleSubmit} className="mt-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
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
          labelClassName="text-slate-200"
          className="border-slate-700 bg-slate-900 text-slate-50 placeholder-slate-500"
          required
        />
        {error && <div className="mt-1 text-xs text-red-400">{error}</div>}
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default Login;

