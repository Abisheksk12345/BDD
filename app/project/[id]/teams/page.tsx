"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Plus, Users, MoreVertical,SquarePen } from "lucide-react";
import CreateTeamModal from "@/app/components/project/createsidedrawer/createteam/page";
import AddMemberDrawer from "@/app/components/project/createsidedrawer/createmember/page";
import TeamDetailsDrawer from "@/app/components/project/createsidedrawer/editmember/page";


export default function TeamsPage() {
  const { id } = useParams() as { id: string };
  const [teams, setTeams] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showTeamDrawer, setShowTeamDrawer] = useState(false);

  

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`/api/team?projectId=${id}`);
      setTeams(res.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [id]);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header + Search + Create */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Teams</h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search teams..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-72 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => setShowDrawer(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            <Plus size={16} /> Create Team
          </button>
        </div>
      </div>

      {/* Teams Grid */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between relative"
          >
            {/* Menu Button */}
            <button className="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
              <MoreVertical size={18} />
            </button>

            {/* Team Header */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{team.name}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Users size={14} /> {team.members?.length || 0} Members
              </p>

              {/* Description */}
              <p className="text-gray-600 text-sm mt-3 line-clamp-3">
                {team.description || "No description provided."}
              </p>

              {/* First Member Preview */}
     {/* Team Lead Section */}
{team.members?.length > 0 && (
  (() => {
    const lead = team.members.find(
      (m: any) => m.role?.toLowerCase().includes("lead")
    );

    if (!lead) return null;

    const initials = lead.fullName
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();

    return (
      <div className="flex items-center gap-2 mt-4 text-sm text-gray-800">
        <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
        <span className="text-gray-700 font-medium">{lead.fullName}</span>
      </div>
    );
  })()
)}

            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                   <button
                onClick={() => {
                  setSelectedTeam(team.id);
                  setShowTeamDrawer(true);
                }}
                className="flex-1 border border-gray-300 px-3 py-2 rounded-md text-sm flex items-center justify-center gap-1 hover:bg-gray-50 transition"
              >
             <SquarePen />
                
                Edit
              </button>

              <button   onClick={() => {
    setSelectedTeam(team.id);
    setShowAddMember(true);
  }}  className="flex-1 border border-gray-300 px-3 py-2 rounded-md text-sm flex items-center justify-center gap-1 hover:bg-gray-50 transition">
                 <Users />
                
                Add Members
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Teams Found */}
      {filteredTeams.length === 0 && (
        <p className="text-gray-500 text-sm text-center">No Teams Found</p>
      )}

      {/* Drawer */}
      {showDrawer && (
        <CreateTeamModal
          projectId={id}
          onClose={() => setShowDrawer(false)}
          onCreated={() => fetchTeams()}
        />
      )}
      {showAddMember && selectedTeam && (
  <AddMemberDrawer
    teamId={selectedTeam}
    onClose={() => setShowAddMember(false)}
    onAdded={() => fetchTeams()}
  />
)}

   {showTeamDrawer && selectedTeam && (
        <TeamDetailsDrawer
          teamId={selectedTeam}
          onClose={() => setShowTeamDrawer(false)}
          onUpdated={() => fetchTeams()}
        />
      )}
    </div>
  );
}
