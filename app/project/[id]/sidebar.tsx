"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { LayoutDashboard, FolderOpen, Users, ListCheck, Settings } from "lucide-react";

export default function Sidebar() {
  const { id } = useParams() as { id: string };
  const pathname = usePathname();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    axios.get(`/api/project/${id}`)
      .then(res => setProject(res.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  const link = (href: string) =>
    `flex items-center gap-3 p-2 rounded-md transition 
     ${pathname.startsWith(href) ? "text-indigo-600 font-semibold" : "text-gray-600 hover:text-indigo-600"}`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      <h2 className="text-3xl font-semibold mb-8">
        {loading ? "Loading..." : (project?.name ?? "Project Not Found")}
      </h2>

      <nav className="space-y-6 text-sm">
        <Link href={`/project/${id}/dashboard`} className={link(`/project/${id}/dashboard`)}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>

        <Link href={`/project/${id}/features`} className={link(`/project/${id}/features`)}>
          <FolderOpen size={18} /> Features
        </Link>

        <Link href={`/project/${id}/teams`} className={link(`/project/${id}/teams`)}>
          <Users size={18} /> Teams
        </Link>

        <Link href={`/project/${id}/test-plans`} className={link(`/project/${id}/test-plans`)}>
          <ListCheck size={18} /> Test Plans
        </Link>

        <Link href={`/project/${id}/settings`} className={link(`/project/${id}/settings`)}>
          <Settings size={18} /> Settings
        </Link>
      </nav>
    </aside>
  );
}
