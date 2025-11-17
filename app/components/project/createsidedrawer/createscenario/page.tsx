"use client";

import { useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";

interface CreateScenarioDrawerProps {
  open: boolean;
  onClose: () => void;
  featureId: string;
  onSaved?: (scenarioId: string) => void;
}

export default function CreateScenarioDrawer({
  open,
  onClose,
  featureId,
  onSaved
}: CreateScenarioDrawerProps) {
  
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addStep = () => {
    setSteps([...steps, { type: "", description: "" }]);
  };

  const updateStep = (index: number, key: string, value: string) => {
    const updated = [...steps];
    updated[index][key] = value;
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  
  const saveScenario = async () => {
    if (!scenarioName.trim()) {
      alert("Scenario name is required");
      return;
    }

    setLoading(true);

    try {
      // 🔥 FIXED — res stored properly
      const res = await axios.post("/api/scenario", {
        name: scenarioName,
        description: scenarioDescription,
        featureId,
        testSteps: steps,
      });

      // SUCCESS
      setScenarioName("");
      setScenarioDescription("");
      setSteps([]);
      onClose();

      if (onSaved) onSaved(res.data.id);

    } catch (err) {
      console.error("Save Error:", err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-0 right-0 h-full w-[720px] bg-white shadow-xl z-50 
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="h-full flex flex-col overflow-y-auto p-6">
          <h1 className="text-xl font-semibold mb-6">Add Scenario</h1>

          {/* Scenario Name */}
          <div className="mb-5">
            <label className="text-sm font-medium">Scenario Name *</label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={scenarioDescription}
              onChange={(e) => setScenarioDescription(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1 h-28"
            />
          </div>

          {/* Steps */}
          <div className="flex justify-between items-center mt-8 mb-3">
            <h2 className="text-lg font-semibold">Test Steps</h2>
            <button
              onClick={addStep}
              className="border px-4 py-1 rounded text-sm"
            >
              + Add Step
            </button>
          </div>

          {steps.length === 0 && (
            <div className="border p-6 rounded text-gray-400 text-center">
              No steps added yet.
            </div>
          )}

          <div className="space-y-3 mt-2">
            {steps.map((step, index) => (
              <div key={index} className="border p-3 rounded flex gap-3 items-center">
                <select
                  value={step.type}
                  onChange={(e) => updateStep(index, "type", e.target.value)}
                  className="border px-2 py-2 rounded w-40 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Given">Given</option>
                  <option value="When">When</option>
                  <option value="Then">Then</option>
                  <option value="And">And</option>
                  <option value="But">But</option>
                </select>

                <input
                  type="text"
                  value={step.description}
                  onChange={(e) => updateStep(index, "description", e.target.value)}
                  className="flex-1 border px-3 py-2 rounded text-sm"
                />

                <button
                  onClick={() => removeStep(index)}
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-6 flex justify-end gap-3 ">
            <button onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>

            <button
              onClick={saveScenario}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
