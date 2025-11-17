"use client";

import { FiHome, FiPlus, FiHelpCircle } from "react-icons/fi";

export default function Header() {
  return (
    <aside className="w-24 h-screen bg-[#374151] text-white flex flex-col py-6">

      {/* TOP SECTION */}
      <div className="flex flex-col items-center space-y-8">
        <div className="text-lg font-medium opacity-80">Logo</div>

        <button className="p-3 rounded-lg hover:bg-white/20 transition">
          <FiHome size={22} />
        </button>

        <hr className="w-10 border-white/30" />

        <button className="p-3 rounded-lg hover:bg-white/20 transition">
          <FiPlus size={24} />
        </button>
      </div>

      {/* PUSH BOTTOM ITEMS DOWN */}
      <div className="flex-grow" />

      {/* BOTTOM SECTION */}
      <div className="flex flex-col items-center space-y-6">
        <button className="p-3 rounded-full hover:bg-white/20 transition">
          <FiHelpCircle size={22} />
        </button>

        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#3730A3] font-semibold">
          AD
        </div>
      </div>

    </aside>
  );
}
