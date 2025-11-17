"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { Trash2 } from "lucide-react";
import AddMemberDrawer from "../createmember/page";

interface TeamDetailsDrawerProps {
  teamId: string;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function TeamDetailsDrawer({
  teamId,
  onClose,
  onUpdated,
}: TeamDetailsDrawerProps) {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchTeam = async () => {
    try {
      const res = await axios.get(`/api/team/${teamId}`);
      setTeam(res.data);
    } catch (err) {
      toast.error("Failed to load team details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [teamId]);
  
const handleDeleteMember = async (memberId: string) => {
  try {
    await axios.delete(`/api/member/${memberId}`);
    toast.success("Member deleted!");
    fetchTeam(); // refresh members list
  } catch (error) {
    console.error("Delete Member Error:", error);
    toast.error("Failed to delete member");
  }
};

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      await axios.delete(`/api/team/${teamId}`);
      toast.success("Team deleted");
      onUpdated?.();
      onClose();
    } catch {
      toast.error("Failed to delete team");
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex justify-end items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
          Loading team details...
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="w-full sm:w-[50%] md:w-[40%] lg:w-[35%] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className=" p-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">{team.name}</h2>
          <button onClick={onClose} className="text-gray-500 text-lg hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <p className="text-sm text-gray-500">
              {team.members?.length} Members
            </p>
          </div>

          <div>
            <h3 className="text-gray-700 font-medium mb-1">Description</h3>
            <p className="text-gray-600 text-sm">
              {team.description || "No description provided."}
            </p>
          </div>

          <div>
            <h3 className="text-gray-700 font-medium mb-2">Team Lead</h3>
            <select
              value={team.leadId || ""}
              onChange={(e) =>
                setTeam((prev: any) => ({ ...prev, leadId: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Lead</option>
              {team.members.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-gray-700 font-medium mb-2 flex items-center justify-between">
              Team Members
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                👥 Add Members
              </button>
            </h3>

            <div className="space-y-3">
              {team.members.map((m: any) => (
                <div
                  key={m.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
                      {m.fullName
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {m.fullName}
                      </p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                      <p className="text-xs text-gray-600">{m.role}</p>
                    </div>
                  </div>
                <button
  onClick={() => handleDeleteMember(m.id)}
  className="text-red-500 hover:text-red-700"
>
  <Trash2 size={16} />
</button>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className=" p-5 flex justify-end gap-3">
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-md text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              axios.put(`/api/team/${teamId}`, team);
              toast.success("Team updated");
              onUpdated?.();
              onClose();
            }}
            className="bg-indigo-600 text-white px-5 py-2 rounded-md text-sm hover:bg-indigo-700"
          >
            Save
          </button>
        </div>

        {showAddMember && (
          <AddMemberDrawer
            teamId={teamId}
            onClose={() => setShowAddMember(false)}
            onAdded={fetchTeam}
          />
        )}
      </div>
    </div>
  );
}
