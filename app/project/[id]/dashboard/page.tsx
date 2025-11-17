"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Download } from "lucide-react";

export default function ProjectDashboardPage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/project/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!project) return <div className="p-10 text-red-500">Project Not Found</div>;

  return (
    <div className="p-6 flex flex-col gap-6">

      <div className="bg-white rounded-xl p-6 shadow-sml">  

        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-semibold">{project.name}</h1>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
            <Download size={16} />
            Export
          </button>
        </div>

        <p className="text-gray-600 leading-relaxed max-w-2xl">
          {project.description || "No project description available."}
        </p>

        <button className="mt-6 px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition">
          Feature ({project.features?.length ?? 0})
        </button>

      </div>

    </div>
  );
}
