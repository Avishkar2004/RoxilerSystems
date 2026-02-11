import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]).{8,16}$/;
const nameRegex = /^.{20,60}$/;
const addressMaxLength = 400;
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

function PasswordSection() {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!passwordRegex.test(form.newPassword)) {
      setError(
        "New password must be 8-16 chars, include one uppercase and one special character."
      );
      return;
    }
    setLoading(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setSuccess("Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to update password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto border border-slate-800 bg-slate-900/70">
      <h3 className="text-sm font-semibold text-slate-50">Update Password</h3>
      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        <Input
          label="Current Password"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          labelClassName="text-slate-200"
          className="border-slate-700 bg-slate-900 text-slate-50 placeholder-slate-500"
          required
        />
        <Input
          label="New Password"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          labelClassName="text-slate-200"
          className="border-slate-700 bg-slate-900 text-slate-50 placeholder-slate-500"
          required
        />
        {error && <div className="text-xs text-red-400">{error}</div>}
        {success && (
          <div className="text-xs text-emerald-400">{success}</div>
        )}
        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="secondary" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "USER",
  });
  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminError, setAdminError] = useState("");
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState("");
  const [createStoreError, setCreateStoreError] = useState("");
  const [createStoreSuccess, setCreateStoreSuccess] = useState("");

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/dashboard");
      setStats(data);
    } catch (err) {
      setAdminError(
        err.response?.data?.message ||
        "Failed to load dashboard statistics. Please try again."
      );
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users", {
        params: userFilters,
      });
      setUsers(data);
    } catch (err) {
      setAdminError(
        err.response?.data?.message ||
        "Failed to load users. Please try again."
      );
    }
  };

  const fetchStores = async () => {
    try {
      const { data } = await api.get("/admin/stores", {
        params: storeFilters,
      });
      setStores(data);
    } catch (err) {
      setAdminError(
        err.response?.data?.message ||
        "Failed to load stores. Please try again."
      );
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, []);

  const handleUserFilterChange = (e) => {
    setUserFilters({ ...userFilters, [e.target.name]: e.target.value });
  };

  const handleStoreFilterChange = (e) => {
    setStoreFilters({ ...storeFilters, [e.target.name]: e.target.value });
  };

  const applyUserFilters = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const applyStoreFilters = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleStoreFormChange = (e) => {
    setStoreForm({ ...storeForm, [e.target.name]: e.target.value });
  };

  const createUser = async (e) => {
    e.preventDefault();
    setCreateUserError("");
    setCreateUserSuccess("");

    // client-side validation to mirror backend rules
    if (!nameRegex.test(userForm.name.trim())) {
      setCreateUserError("Name must be between 20 and 60 characters.");
      return;
    }
    if (userForm.address.length > addressMaxLength) {
      setCreateUserError("Address must be at most 400 characters.");
      return;
    }
    if (!emailRegex.test(userForm.email.toLowerCase())) {
      setCreateUserError("Invalid email address.");
      return;
    }
    if (!passwordRegex.test(userForm.password)) {
      setCreateUserError(
        "Password must be 8-16 chars, include one uppercase and one special character."
      );
      return;
    }

    try {
      await api.post("/admin/users", userForm);
      setUserForm({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "USER",
      });
      setCreateUserSuccess("User created successfully.");
      fetchUsers();
    } catch (err) {
      setCreateUserError(
        err.response?.data?.message || "Failed to create user."
      );
    }
  };

  const createStore = async (e) => {
    e.preventDefault();
    setCreateStoreError("");
    setCreateStoreSuccess("");

    if (!nameRegex.test(storeForm.name.trim())) {
      setCreateStoreError("Name must be between 20 and 60 characters.");
      return;
    }
    if (storeForm.address.length > addressMaxLength) {
      setCreateStoreError("Address must be at most 400 characters.");
      return;
    }
    if (storeForm.email && !emailRegex.test(storeForm.email.toLowerCase())) {
      setCreateStoreError("Invalid email address.");
      return;
    }

    try {
      const payload = {
        ...storeForm,
        ownerId: storeForm.ownerId ? Number(storeForm.ownerId) : undefined,
      };
      await api.post("/admin/stores", payload);
      setStoreForm({ name: "", email: "", address: "", ownerId: "" });
      setCreateStoreSuccess("Store created successfully.");
      fetchStores();
    } catch (err) {
      setCreateStoreError(
        err.response?.data?.message || "Failed to create store."
      );
    }
  };

  const viewUserDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      setSelectedUser(data);
    } catch (err) {
      setAdminError(
        err.response?.data?.message || "Failed to fetch user details."
      );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold text-slate-50">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-slate-300">
          Overview of users, stores, and ratings across the platform.
        </p>
        {adminError && (
          <div className="mt-2 text-xs text-red-400">{adminError}</div>
        )}
        {stats && (
          <div className="mt-3 flex flex-wrap gap-3">
            <Card className="min-w-[150px]">
              <div className="text-xs text-slate-400">Total Users</div>
              <div className="text-lg font-semibold text-slate-50">
                {stats.totalUsers}
              </div>
            </Card>
            <Card className="min-w-[150px]">
              <div className="text-xs text-slate-400">Total Stores</div>
              <div className="text-lg font-semibold text-slate-50">
                {stats.totalStores}
              </div>
            </Card>
            <Card className="min-w-[150px]">
              <div className="text-xs text-slate-400">Total Ratings</div>
              <div className="text-lg font-semibold text-slate-50">
                {stats.totalRatings}
              </div>
            </Card>
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-[1.4fr,1fr]">
        <Card>
          <h3 className="text-sm font-semibold text-slate-50">Users</h3>
          <form
            onSubmit={applyUserFilters}
            className="mt-3 grid gap-2 md:grid-cols-5"
          >
            <Input
              label="Name"
              name="name"
              value={userFilters.name}
              onChange={handleUserFilterChange}
            />
            <Input
              label="Email"
              name="email"
              value={userFilters.email}
              onChange={handleUserFilterChange}
            />
            <Input
              label="Address"
              name="address"
              value={userFilters.address}
              onChange={handleUserFilterChange}
            />
            <Input
              label="Role"
              name="role"
              value={userFilters.role}
              onChange={handleUserFilterChange}
            />
            <div className="flex items-end">
              <Button type="submit" variant="secondary">
                Filter
              </Button>
            </div>
          </form>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/80">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                    Address
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                    Role
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800">
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">{u.address}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium " +
                          (u.role === "ADMIN"
                            ? "bg-blue-50 text-blue-700"
                            : u.role === "STORE_OWNER"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-emerald-50 text-emerald-700")
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="secondary"
                        onClick={() => viewUserDetails(u.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-slate-50">
              Add New User
            </h3>
            <form onSubmit={createUser} className="mt-3 space-y-2">
              <Input
                label="Name"
                name="name"
                value={userForm.name}
                onChange={handleUserFormChange}
                required
              />
              <Input
                label="Email"
                name="email"
                value={userForm.email}
                onChange={handleUserFormChange}
                required
              />
              <Input
                label="Address"
                name="address"
                value={userForm.address}
                onChange={handleUserFormChange}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={userForm.password}
                onChange={handleUserFormChange}
                required
              />
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Role
                </label>
                <select
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                  name="role"
                  value={userForm.role}
                  onChange={handleUserFormChange}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>
              {createUserError && (
                <div className="text-xs text-red-400">{createUserError}</div>
              )}
              {createUserSuccess && !createUserError && (
                <div className="text-xs text-emerald-400">
                  {createUserSuccess}
                </div>
              )}
              <Button type="submit">Create User</Button>
            </form>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-50">
              Add New Store
            </h3>
            <form onSubmit={createStore} className="mt-3 space-y-2">
              <Input
                label="Name"
                name="name"
                value={storeForm.name}
                onChange={handleStoreFormChange}
                required
              />
              <Input
                label="Email"
                name="email"
                value={storeForm.email}
                onChange={handleStoreFormChange}
              />
              <Input
                label="Address"
                name="address"
                value={storeForm.address}
                onChange={handleStoreFormChange}
              />
              <Input
                label="Owner ID (Store Owner)"
                name="ownerId"
                value={storeForm.ownerId}
                onChange={handleStoreFormChange}
              />
              {createStoreError && (
                <div className="text-xs text-red-400">{createStoreError}</div>
              )}
              {createStoreSuccess && !createStoreError && (
                <div className="text-xs text-emerald-400">
                  {createStoreSuccess}
                </div>
              )}
              <Button type="submit">Create Store</Button>
            </form>
          </Card>
        </div>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-slate-50">Stores</h3>
        <form
          onSubmit={applyStoreFilters}
          className="mt-3 grid gap-2 md:grid-cols-4"
        >
          <Input
            label="Name"
            name="name"
            value={storeFilters.name}
            onChange={handleStoreFilterChange}
          />
          <Input
            label="Email"
            name="email"
            value={storeFilters.email}
            onChange={handleStoreFilterChange}
          />
          <Input
            label="Address"
            name="address"
            value={storeFilters.address}
            onChange={handleStoreFilterChange}
          />
          <div className="flex items-end">
            <Button type="submit" variant="secondary">
              Filter
            </Button>
          </div>
        </form>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm text-slate-100">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/80">
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                  Address
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} className="border-b border-slate-800">
                  <td className="px-3 py-2">{s.name}</td>
                  <td className="px-3 py-2">{s.email}</td>
                  <td className="px-3 py-2">{s.address}</td>
                  <td className="px-3 py-2">
                    {Number(s.averageRating).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedUser && (
        <Card>
          <h3 className="text-sm font-semibold text-slate-50">User Details</h3>
          <p className="mt-2 text-sm text-slate-100">
            <strong>Name:</strong> {selectedUser.user.name}
          </p>
          <p className="text-sm text-slate-100">
            <strong>Email:</strong> {selectedUser.user.email}
          </p>
          <p className="text-sm text-slate-100">
            <strong>Address:</strong> {selectedUser.user.address}
          </p>
          <p className="text-sm text-slate-100">
            <strong>Role:</strong> {selectedUser.user.role}
          </p>
          {selectedUser.user.role === "STORE_OWNER" &&
            selectedUser.storeRatingInfo && (
              <p className="text-sm text-slate-100">
                <strong>Store Rating:</strong>{" "}
                {Number(
                  selectedUser.storeRatingInfo.averageRating
                ).toFixed(2)}
              </p>
            )}
        </Card>
      )}
    </div>
  );
}

function UserDashboard() {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold text-slate-50">Normal User</h2>
        <p className="mt-1 text-sm text-slate-300">
          Browse all stores, search by name or address, and rate them from 1 to 5.
        </p>
        <div className="mt-3">
          <Link to="/stores">
            <Button>Go to Stores</Button>
          </Link>
        </div>
      </Card>
      <PasswordSection />
    </div>
  );
}

function StoreOwnerDashboard() {
  const [data, setData] = useState(null);

  const fetchRatings = async () => {
    try {
      const { data } = await api.get("/stores/owner/ratings");
      setData(data);
    } catch (err) {
      setData(null);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold text-slate-50">Store Owner</h2>
        {!data && (
          <p className="mt-1 text-sm text-slate-300">
            No store associated with this owner yet.
          </p>
        )}
        {data && (
          <div className="mt-2 space-y-1 text-sm text-slate-100">
            <p>
              <strong>Store:</strong> {data.store.name}
            </p>
            <p>
              <strong>Address:</strong> {data.store.address}
            </p>
            <p>
              <strong>Average Rating:</strong>{" "}
              {Number(data.store.averageRating).toFixed(2)}
            </p>
          </div>
        )}
      </Card>
      {data && (
        <Card>
          <h3 className="text-sm font-semibold text-slate-50">
            Ratings from Users
          </h3>
          {data.ratings.length === 0 ? (
            <p className="mt-2 text-sm text-slate-300">No ratings yet.</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm text-slate-100">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/80">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                      User
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                      Rating
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-300">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                {data.ratings.map((r) => (
                    <tr key={r.id} className="border-b border-slate-800">
                      <td className="px-3 py-2">{r.userName}</td>
                      <td className="px-3 py-2">{r.userEmail}</td>
                      <td className="px-3 py-2">{r.rating}</td>
                      <td className="px-3 py-2">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
      <PasswordSection />
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();

  if (user.role === "ADMIN") {
    return <AdminDashboard />;
  }

  if (user.role === "STORE_OWNER") {
    return <StoreOwnerDashboard />;
  }

  return <UserDashboard />;
}

export default Dashboard;

