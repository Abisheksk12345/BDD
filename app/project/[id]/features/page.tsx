"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Download } from "lucide-react";
import { GripVertical, ChevronDown, Folder } from "lucide-react";
import CreateScenarioDrawer from "@/app/components/project/createsidedrawer/createscenario/page";
import EditTestStepsDrawer from "@/app/components/project/createsidedrawer/editteststep/page";



export default function FeaturePage() {
  const { id } = useParams() as { id: string };

  const [project, setProject] = useState<any>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
const [newFeatureName, setNewFeatureName] = useState("");
const [mode, setMode] = useState<"none" | "create" | "view" | "scenario">("none");

const [createName, setCreateName] = useState("");
const [createDescription, setCreateDescription] = useState("");
const [openScenarioDrawer, setOpenScenarioDrawer] = useState(false);
const [selectedScenario, setSelectedScenario] = useState<any>(null);
const [featureDragIndex, setFeatureDragIndex] = useState<number | null>(null);
const [scenarioDragIndex, setScenarioDragIndex] = useState<number | null>(null);
const [openStepsDrawer, setOpenStepsDrawer] = useState(false);
const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null);





const handleStepDrop = async (dropIndex: number) => {
  if (scenarioDragIndex === null) return;

  const list = [...selectedScenario.testSteps];
  const dragged = list[scenarioDragIndex];

  // Reorder steps
  list.splice(scenarioDragIndex, 1);
  list.splice(dropIndex, 0, dragged);

  // Auto-update step numbers
  const finalList = list.map((s, idx) => ({
    ...s,
    order: idx + 1,
  }));

  // Update UI (right panel)
  setSelectedScenario((prev: any) => ({
    ...prev,
    testSteps: finalList,
  }));

  // Save to backend
  await axios.put(`/api/scenario/${selectedScenario.id}`, {
    name: selectedScenario.name,
    description: selectedScenario.description,
    testSteps: finalList,
  });

  setScenarioDragIndex(null);
};



const handleScenarioDrop = async (featureId: string, dropIndex: number) => {
  if (scenarioDragIndex === null) return;

  // Find target feature
  const updatedFeature = features.find((f) => f.id === featureId);
  if (!updatedFeature) return;

  // Clone scenarios
  const list = [...updatedFeature.scenarios];
  const dragged = list[scenarioDragIndex];

  // reorder
  list.splice(scenarioDragIndex, 1);
  list.splice(dropIndex, 0, dragged);

  // assign order properly
  const finalList = list.map((s, idx) => ({
    ...s,
    order: idx + 1,
  }));

  // Update UI
  setFeatures((prev) =>
    prev.map((f) =>
      f.id === featureId ? { ...f, scenarios: finalList } : f
    )
  );
  if (selectedFeature?.id === featureId) {
  setSelectedFeature((prev: any) => ({
    ...prev,
    scenarios: finalList,
  }));
}

  // Save in DB
  await saveScenarioOrder(finalList);

  setScenarioDragIndex(null);
};
const saveScenarioOrder = async (scenarios: any[]) => {
  try {
    await axios.put("/api/scenario/order", {
      scenarios: scenarios.map((s) => ({
        id: s.id,
        order: s.order,
      })),
    });
  } catch (err) {
    console.log("Scenario order save error:", err);
  }
};




const handleFeatureDrop = async (dropIndex: number) => {
  if (featureDragIndex === null) return;

  const updated = [...features];
  const draggedItem = updated[featureDragIndex];

  // reorder
  updated.splice(featureDragIndex, 1);
  updated.splice(dropIndex, 0, draggedItem);

  // assign order
  const finalList = updated.map((f, idx) => ({
    ...f,
    order: idx + 1,
  }));

  setFeatures(finalList);
  setFeatureDragIndex(null);

  await saveFeatureOrder(finalList);
};

const saveFeatureOrder = async (list: any[]) => {
  try {
    await axios.put(`/api/feature/${id}/feature-order`, {
      features: list.map((f) => ({
        id: f.id,
        order: f.order,
      })),
    });
  } catch (err) {
    console.log("Feature order save error:", err);
  }
};



  useEffect(() => {
    async function loadData() {
      try {
        const projectRes = await axios.get(`/api/project/${id}`);
        setProject(projectRes.data);

        const featuresRes = await axios.get(`/api/feature?projectId=${id}`);
        setFeatures(featuresRes.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!project) return <div className="p-10 text-red-500">Project Not Found</div>;
  async function saveFeature() {
  if (!createName.trim()) return alert("Feature name is required");

  try {
    const res = await axios.post("/api/feature", {
      name: createName,
      description: createDescription,
      projectId: id,
    });

    const newFeature = res.data;

    // update left list
    setFeatures((prev) => [...prev, newFeature]);

    // select newly created feature
    setSelectedFeature(newFeature);

    // switch mode to view
    setMode("view");

    // clear form
    setCreateName("");
    setCreateDescription("");

  } catch (err) {
    console.log(err);
  }
}
const loadFeatureAgain = async () => {
  if (!selectedFeature?.id) return;

  try {
    const res = await axios.get(`/api/feature/${selectedFeature.id}`);
    setSelectedFeature(res.data);
  } catch (err) {
    console.log(err);
  }
};
const loadScenario = async (scenarioId: string) => {
  try {
    const res = await axios.get(`/api/scenario/${scenarioId}`);
    setSelectedScenario(res.data);
  } catch (err) {
    console.log("Scenario load error:", err);
  }
};

const reloadFeaturesList = async () => {
  const res = await axios.get(`/api/feature?projectId=${id}`);
  setFeatures(res.data);
};

return (
  <div className="flex h-screen bg-gray-100">



    {/* ------------------------------------------------ */}
    {/* MIDDLE PANEL — Feature Tree */}
    {/* ------------------------------------------------ */}
    <section className="w-80 border-r bg-white p-4 flex flex-col">
      
      {/* Search */}
      <input
        type="text"
        placeholder="Search Feature..."
        className="w-full border px-3 py-2 rounded text-sm"
      />
<button
  onClick={() => {
    setMode("create");
    setSelectedFeature(null);
  }}
  className="w-full mt-3 border border-indigo-400 text-indigo-600 py-1 rounded-lg text-sm flex items-center justify-center gap-4 hover:bg-indigo-50 transition"
>
  <span className="text-lg">+</span> Add Feature
</button>   

{/* Feature + Scenario Tree */}
<div className="mt-4 space-y-2 text-sm">
{features.map((feature, index) => {

  const isSelected = selectedFeature?.id === feature.id;
  const scenarioCount = feature.scenarios?.length || 0;

  return (
    <div
      key={feature.id}
      draggable
      onDragStart={() => setFeatureDragIndex(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleFeatureDrop(index)}
    >
      {/* ---------- Feature Row ---------- */}
      <div
        onClick={() => {
          setSelectedFeature(feature);
          setMode("view");
            setExpandedFeatureId(prev => prev === feature.id ? null : feature.id);
        }}
        className={`flex items-center gap-2 p-2 rounded cursor-pointer 
            hover:bg-gray-100
            ${isSelected ? "bg-gray-100 text-indigo-600 font-medium" : ""}
          `}
      >
        <GripVertical size={16} className="text-gray-400 cursor-move" />
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform duration-200    ${expandedFeatureId === feature.id ? "rotate-180" : ""} `}
        />
       
        <Folder size={14} className="text-gray-500" />

        <span className="truncate">
          {feature.order}. {feature.name} ({scenarioCount})
        </span>
      </div>

        {/* ---------- Scenario List ---------- */}
       {expandedFeatureId === feature.id && scenarioCount > 0 && (

          <div className="mt-1 ml-6 space-y-1">
{feature.scenarios.map((scenario: any, sIndex: number) => (
  <div
    key={scenario.id}
    draggable
    onDragStart={(e) => {
      e.stopPropagation();
      setScenarioDragIndex(sIndex);
    }}
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      e.stopPropagation();
      handleScenarioDrop(feature.id, sIndex);
    }}
    className="flex items-center gap-2 p-2 cursor-pointer rounded hover:bg-gray-100"
  >
    <GripVertical size={14} className="text-gray-300 cursor-move" />

    <input type="checkbox" className="w-3 h-3" />

    <span
      onClick={(e) => {
        e.stopPropagation();
        loadScenario(scenario.id);
        setMode("scenario");
      }}
      className="text-gray-700 truncate"
    >
      {scenario.order}. {scenario.name}
    </span>
  </div>
))}

 
          </div>
        )}

      </div>
    );
  })}
</div>



    </section>

    {/* ------------------------------------------------ */}
    {/* RIGHT PANEL — Add Feature Form (like screenshot) */}
    {/* ------------------------------------------------ */}
<main className="flex-1 p-6 overflow-y-auto">

  {/* NOTHING SELECTED */}
  {mode === "none" && (
    <div className="text-gray-500 text-center mt-20">
      Please select a feature or click "Add Feature"
    </div>
  )}

  {/* CREATE FEATURE */}
  {mode === "create" && (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Add Feature</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setMode("none")}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={saveFeature}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Feature Name</label>
          <input
            type="text"
            placeholder="Enter Feature Name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            placeholder="Enter Description.."
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
            className="w-full border rounded px-3 py-3 text-sm h-28"
          />
        </div>
      </div>
    </div>
  )}

  {/* VIEW FEATURE */}
  {mode === "view" && selectedFeature && (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-5 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">{selectedFeature.name}</h1>
          <button className="flex items-center gap-2 border px-3 py-1 rounded-md text-sm hover:bg-gray-50">
            <Download size={16} /> Export
          </button>
        </div>

        {/* Description Box */}
        <div className="mt-4 text-gray-700 leading-relaxed">
          {selectedFeature.description || (
            <span className="text-gray-400 italic">No description added</span>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Created at {new Date(selectedFeature.createdAt).toLocaleString()} <br />
            Updated at {new Date(selectedFeature.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Scenarios */}
      <div className="bg-white p-5 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold">
            Scenarios ({selectedFeature.scenarios?.length ?? 0})
          </h2>

          <button
            onClick={() => setOpenScenarioDrawer(true)}
            className="border px-3 py-1 rounded text-sm"
          >
            + Add Scenario
          </button>
        </div>

        {/* Empty message */}
        {(selectedFeature.scenarios?.length ?? 0) === 0 && (
          <div className="border w-full py-6 text-center rounded text-gray-400">
            Use button above to create a new scenario
          </div>
        )}
     
      </div>

    </div>
  )}
{/* ============================
     SCENARIO VIEW (RIGHT PANEL)
   ============================ */}
{mode === "scenario" && selectedScenario && (
  <div className="space-y-6">

    {/* Scenario title + description */}
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <h1 className="text-lg font-semibold">{selectedScenario.name}</h1>
      
      <p className="text-gray-600 mt-2">
        {selectedScenario.description || "No description added"}
      </p>
    </div>

    {/* Test Steps */}
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold">Test Steps</h2>
      <button
  onClick={() => setOpenStepsDrawer(true)}
  className="border px-3 py-1 rounded text-sm"
>
  Edit
</button>
      </div>

<div className="space-y-2">
  {selectedScenario.testSteps?.map((step: any, index: number) => (
    <div
      key={index}
      draggable
      onDragStart={() => setScenarioDragIndex(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleStepDrop(index)}
      className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-move"
    >
      {/* Number */}

      <span className="text-xs bg-gray-200 px-2 py-1 rounded w-6 text-center">
        {index + 1}
      </span>

      {/* Checkbox */}
      <input type="checkbox" />

      {/* Keyword */}
      <span className="font-medium text-indigo-600">
        {step.type}
      </span>

      {/* Description */}
      <span className="truncate">{step.description}</span>
    </div>
  ))}
</div>

    </div>

  </div>
)}


  {/* Scenario Drawer */}
<CreateScenarioDrawer
  open={openScenarioDrawer}
  onClose={() => setOpenScenarioDrawer(false)}
  featureId={selectedFeature?.id}
onSaved={async (scenarioId: string) => {
  setOpenScenarioDrawer(false);

  await reloadFeaturesList();    // 🔥 left panel updates
  await loadFeatureAgain();      // 🔥 selected feature updates
  await loadScenario(scenarioId); // 🔥 right panel updates

  setMode("scenario");
}}

/>
<EditTestStepsDrawer
  open={openStepsDrawer}
  onClose={() => setOpenStepsDrawer(false)}
  initialSteps={selectedScenario?.testSteps || []}
  onSave={async (updatedSteps) => {
    await axios.put(`/api/scenario/${selectedScenario.id}`, {
      testSteps: updatedSteps,
      name: selectedScenario.name,
      description: selectedScenario.description,
    });

    await loadScenario(selectedScenario.id); // Refresh after save
  }}
/>




</main>



  </div>
);

}
