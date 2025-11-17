"use client";

import { useState } from "react";
import axios from "axios";

interface CreateTeamModalProps {
  projectId: string;
  onClose: () => void;
  onCreated?: () => void | Promise<void>; // ✅ allow async functions too
}

export default function CreateTeamModal({
  projectId,
  onClose,
  onCreated,
}: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");

    if (!teamName.trim()) {
      setError("Team name is required!");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/team", {
        name: teamName.trim(),
        description: description.trim(),
        projectId,
      });

      setTeamName("");
      setDescription("");
      onCreated?.(); // ✅ Refresh team list
      onClose(); // ✅ Close drawer
    } catch (err: any) {
      console.error("Create Team Error:", err);
      setError("Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
      {/* Drawer container */}
      <div className="w-full sm:w-[50%] md:w-[40%] lg:w-[35%] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between  p-5">
          <h2 className="text-lg font-semibold text-gray-800">Create New Team</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-2">
              {error}
            </div>
          )}

          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter Team Name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter Description..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm h-28 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className=" p-5  flex justify-end gap-3">
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
