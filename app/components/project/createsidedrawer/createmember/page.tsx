"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface AddMemberDrawerProps {
  teamId: string;
  onClose: () => void;
  onAdded?: () => void;
}

const roles = [
  "Team Lead",
  "Project Manager",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "QA / Tester",
  "Business Analyst",
];

export default function AddMemberDrawer({ teamId, onClose, onAdded }: AddMemberDrawerProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [filteredList, setFilteredList] = useState<any[]>([]);


  // ✅ Load all staff data once
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get("/api/staff/list");
        const staffMembers = res.data
          .map((s: any) => s.member)
          .filter((m: any) => m && m.fullName); // remove nulls
        setStaffList(staffMembers);
      } catch (err) {
        console.error("Failed to fetch staff:", err);
      }
    };
    fetchStaff();
  }, []);

  // ✅ When selecting a name, auto-fill email & role
  const handleNameSelect = (name: string) => {
    setFullName(name);
    const found = staffList.find((m) => m.fullName === name);
    if (found) {
      setEmail(found.email || "");
      setRole(formatRole(found.role));
    } else {
      setEmail("");
      setRole("");
    }
  };

  // Format enum role to readable form
  const formatRole = (role: string) =>
    role
      ?.replace(/_/g, " ")
      ?.toLowerCase()
      ?.replace(/\b\w/g, (c) => c.toUpperCase());

  const handleSave = async () => {
    setError("");

    if (!fullName.trim() || !email.trim() || !role) {
      setError("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/member", {
        teamId,
        fullName,
        email,
        role: role.toUpperCase().replace(/\s+/g, "_").replace("/", ""),
      });

      toast.success("Member added successfully!");
      onAdded?.();
      onClose();
    } catch (err) {
      console.error("Add Member Error:", err);
      toast.error("Failed to add member!");
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="w-full sm:w-[50%] md:w-[40%] lg:w-[35%] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Add Member</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-2">
              {error}
            </div>
          )}

          {/* Full Name with Auto Suggest */}
{/* Full Name (Company-Standard Dropdown) */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Full Name <span className="text-red-500">*</span>
  </label>

  {/* Input Field */}
  <input
    type="text"
    value={fullName}
    onChange={(e) => {
      const value = e.target.value;
      setFullName(value);

      const query = value.toLowerCase();
      setFilteredList(
        staffList.filter((s) =>
          s.fullName.toLowerCase().includes(query)
        )
      );
    }}
    placeholder="Search or enter full name"
    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm 
               focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
               outline-none bg-white shadow-sm transition-all duration-150"
  />

  {/* Dropdown */}
  {filteredList.length > 0 && (
    <ul
      className="absolute z-20 mt-1 w-full bg-white border border-gray-200 
                 rounded-lg shadow-lg max-h-56 overflow-y-auto animate-fadeIn"
    >
      {filteredList.map((s, index) => (
        <li
          key={`${s.fullName}-${index}`}
          onClick={() => {
            setFullName(s.fullName);
            setEmail(s.email);
            setRole(formatRole(s.role));  
            setFilteredList([]); // Close dropdown
          }}
          className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-indigo-50"
        >
          {s.fullName}
        </li>
      ))}
    </ul>
  )}
</div>


          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email Address"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">Select</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-md text-sm hover:bg-gray-100 disabled:opacity-60"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-indigo-600 text-white px-5 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
