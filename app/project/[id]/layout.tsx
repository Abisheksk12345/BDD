import Header from "@/app/header/page";
import Sidebar from "./sidebar";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F7F7FB] text-gray-800">
      <Header />
      <Sidebar />   {/* ✅ Sidebar now gets id correctly */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
