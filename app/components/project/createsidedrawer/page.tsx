"use client";

import { FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectDrawerUI({ isOpen, onClose }: DrawerProps) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [type, setType] = useState("");
  const [template, setTemplate] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/staff/list").then((res) => setStaffList(res.data));
  }, []);

  const handleSave = async () => {
    if (!name || !type) {
      toast.error("Project Name & Type are required ❗");
      return;
    }

    try {
await axios.post("/api/project", {
  name,
  key,
  type: type.toUpperCase(),
  template,
  ownerId: owner,   // <-- FIXED
  status: status?.toUpperCase() || null,
  description,
  startDate: startDate || null,
  endDate: endDate || null,
});


      toast.success("Project Created Successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong ❌");
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div
        className={`w-full sm:w-[60%] md:w-[55%] lg:w-[45%] bg-white h-full shadow-xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 ">
          <h2 className="text-xl font-semibold">Create Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Project Name */}
          <div className="section">
            <label className="label">Project Name *</label>
            <input
              className="input"
              placeholder="Enter Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Project Key */}
          <div className="section">
            <label className="label">Project Key</label>
            <input
              className="input"
              placeholder="Enter Project Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="section">
            <label className="label">Project Type *</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Select</option>
              <option>Internal</option>
              <option>Client</option>
              <option>Maintenance</option>
              <option>Research</option>
            </select>
          </div>

          {/* Template */}
          <div className="section">
            <label className="label">Project Template</label>
            <select className="input" value={template} onChange={(e) => setTemplate(e.target.value)}>
              <option value="">Select</option>
              <option>Agile Board</option>
              <option>Scrum</option>
              <option>Kanban</option>
              <option>Custom</option>
            </select>
          </div>

          {/* Owner */}
          <div className="section">
            <label className="label">Project Owner</label>
 <select
  className="input"
  value={owner}
  onChange={(e) => setOwner(e.target.value)}
>
  <option value="">Select</option>
  {staffList.map((s: any) => (
    <option key={s.id} value={s.id}>
      {s.member?.fullName}
    </option>
  ))}
</select>


          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div className="section">
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="section">
              <label className="label">End Date</label>
              <input
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="section">
            <label className="label">Project Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Select</option>
              <option>Planning</option>
              <option>In Progress</option>
              <option>On Hold</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

          {/* Description */}
          <div className="section">
            <label className="label">Description</label>
            <textarea
              className="input h-24"
              placeholder="Enter Description.."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6   ">
          <button onClick={onClose} className="btn-secondary btn">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary btn">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
