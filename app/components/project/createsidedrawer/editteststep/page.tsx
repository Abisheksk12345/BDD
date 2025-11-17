"use client";

import { useState,useEffect } from "react";
import { X, Trash2 } from "lucide-react";

const stepTypes = ["Given", "When", "Then", "And"];

export default function EditTestStepsDrawer({
  open,
  onClose,
  initialSteps = [],
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialSteps: any[];
  onSave: (steps: any[]) => void;
}) {
  const [steps, setSteps] = useState(initialSteps);

  const addStep = () => {
    setSteps([...steps, { type: "Given", description: "" }]);
  };

  const updateStep = (index: number, field: string, value: string) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(steps);
    onClose();
  };
  useEffect(() => {
  if (open) {
    setSteps(initialSteps);
  }
}, [initialSteps, open]);
  if (!open) return null;



  return (
    <div
      className="fixed inset-0 bg-black/30 flex justify-end z-50"
      onClick={onClose}
    >
      <div
        className="w-[700px] bg-white h-full p-8 shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="text-2xl font-semibold">Edit Test Steps</h2>

        {/* Divider line */}
        

        {/* Add Step Button aligned right */}
        <div className="flex justify-end mb-6">
          <button
            onClick={addStep}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
          >
            + Add Steps
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-5">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border rounded-lg p-4 bg-white"
            >
              {/* Dropdown */}
              <select
                value={step.type}
                onChange={(e) =>
                  updateStep(index, "type", e.target.value)
                }
                className="border rounded px-3 py-2 text-sm w-32"
              >
                {stepTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Input */}
              <input
                type="text"
               value={step.description ?? ""}
                placeholder="Step description"
                onChange={(e) =>
                  updateStep(index, "description", e.target.value)
                }
                className="flex-1 border rounded px-3 py-2 text-sm"
              />

              {/* Trash */}
              <button
                onClick={() => removeStep(index)}
                className="text-red-500 hover:bg-red-100 p-2 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
<div className="fixed bottom-0 right-0 w-[700px] bg-white  p-4 flex justify-end gap-4">
  <button
    onClick={onClose}
    className="px-4 py-2 border rounded-lg"
  >
    Cancel
  </button>

  <button
    onClick={handleSave}
    className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
  >
    Save
  </button>
</div>
      </div>
    </div>
  );
}
