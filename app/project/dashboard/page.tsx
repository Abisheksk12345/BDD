"use client";

import { useState, useEffect } from "react";
import { Trash2 } from 'lucide-react';
import { FiSearch } from "react-icons/fi";
import Header from "@/app/header/page";
import Image from "next/image";
import CreateProjectDrawer from "@/app/components/project/createsidedrawer/page";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function DashboardPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get("/api/project");
      setProjects(res.data);
    } catch {
      toast.error("Failed to load projects ❌");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
const deleteProject = async (id: string) => {
  try {
    await axios.delete(`/api/project/${id}`);
    toast.success("Project deleted successfully!");
    fetchProjects();  // refresh list
  } catch (err) {
    toast.error("Failed to delete project ❌");
  }
};
const formatDate = (dateString: string) => {
  if (!dateString) return "-";

  const d = new Date(dateString);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};


  return (
    <div className="flex h-screen w-full">
      <Header />

      <main className="flex-1 px-5 py-4 flex flex-col overflow-y-auto">

        <h1 className="text-2xl font-bold text-gray-900">All Projects</h1>
        <p className="text-gray-600 mt-1 mb-8">My Projects</p>

        {/* Search + Create */}
        <div className="flex justify-end mb-8 w-full">
          <div className="flex items-center gap-4">

            <div className="flex items-center gap-3 w-[300px] border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <FiSearch size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                className="outline-none flex-1 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-[#3730A3] hover:bg-[#5a54e6] text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              +Create Project
            </button>

          </div>
        </div>

        {/* ✅ If No Projects → Show Empty State */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <Image
              src="/startup-metaphor-flat-icon.png"
              width={240}
              height={240}
              alt="No projects illustration"
              className="mb-6"
            />

            <p className="text-gray-600 text-sm mb-4">
              You Have Not Created Any Projects Yet
            </p>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-[#3730A3] hover:bg-[#5a54e6] text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              +Create Project
            </button>
          </div>
        ) : (
          /* ✅ Show Project Table*/
         <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <table className="w-full text-sm">
    <thead className="bg-gray-50 text-gray-600 font-medium">
     <tr>
        <th className="p-4 text-left">Project Name ↑↓</th>
        <th className="p-4 text-left">Project Key</th>
        <th className="p-4 text-left">Project Type</th>
        <th className="p-4 text-left">Project Owner</th>
        <th className="p-4 text-left">Start Date</th>
        <th className="p-4 text-left">End Date</th>
        <th className="p-4 text-left">Status</th>
        <th className="p-4 text-right">Actions</th>
      </tr>
    </thead>

   <tbody className="divide-y divide-gray-200 text-gray-800">
  {filtered.map((p) => (
    <tr
      key={p.id}
      onClick={() => window.location.assign(`/project/${p.id}/dashboard`)}
      className="hover:bg-gray-50 transition cursor-pointer"
    >
      {/* Project Name */}
      <td className="p-4 text-indigo-600 font-medium">{p.name}</td>

      {/* Project Key */}
      <td className="p-4">{p.key || "-"}</td>

      {/* Project Type */}
      <td className="p-4 capitalize">
        {p.type?.replace("_", " ").toLowerCase()}
      </td>

      {/* Project Owner */}
  <td className="p-4">
  {p.owner?.member?.fullName || "-"}
</td>

      {/* Start Date */}
      <td className="p-4">
       {formatDate(p.startDate)}

      </td>

      {/* End Date */}
      <td className="p-4">
       {formatDate(p.startDate)}
      </td>

      {/* Status */}
      <td className="p-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            p.status === "COMPLETED"
              ? "bg-green-100 text-green-700"
              : p.status === "IN_PROGRESS"
              ? "bg-yellow-100 text-yellow-700"
              : p.status === "ON_HOLD"
              ? "bg-orange-100 text-orange-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {p.status?.replace("_", " ") || "-"}
        </span>
      </td>

      {/* ACTIONS */}
      <td
        className="p-4 text-right"
        onClick={(e) => e.stopPropagation()} // prevent row click
      >
        <button
          onClick={() => deleteProject(p.id)}
          className="text-red-500 hover:text-red-700 font-bold text-lg"
        >
         <Trash2 />
        </button>
      </td>
    </tr>
  ))}
</tbody>

  </table>
</div>
        )}

      </main>

      {/* Drawer */}
      <CreateProjectDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          fetchProjects(); // ✅ Refresh list after create
        }}
      />

    </div>
  );
}
