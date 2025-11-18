"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Download } from "lucide-react";
import { GripVertical, ChevronDown, Folder } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import CreateScenarioDrawer from "@/app/components/project/createsidedrawer/createscenario/page";
import EditTestStepsDrawer from "@/app/components/project/createsidedrawer/editteststep/page";
import DragOverlay from "@/app/components/dragoverlay";
// <-- import

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
  const [searchTerm, setSearchTerm] = useState("");

  // --- Custom Drag Overlay state ---
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<React.ReactNode | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dropIndexRef = useRef<number | null>(null); // keep stable reference


  const [scenarioDragItem, setScenarioDragItem] = useState<React.ReactNode | null>(null);
const [scenarioDragPos, setScenarioDragPos] = useState<{ x: number; y: number } | null>(null);
const [scenarioIsDragging, setScenarioIsDragging] = useState(false);
const scenarioDropIndexRef = useRef<number | null>(null);
const [scenarioDropIndex, setScenarioDropIndex] = useState<number | null>(null);
// scenario drag refs already exist — add this new ref:
const scenarioDragFeatureIdRef = useRef<string | null>(null);



const [stepDragIndex, setStepDragIndex] = useState<number | null>(null);
const [stepDragPos, setStepDragPos] = useState<{ x: number; y: number } | null>(null);
const [stepDragItem, setStepDragItem] = useState<React.ReactNode | null>(null);

const stepDropIndexRef = useRef<number | null>(null);
const [stepIsDragging, setStepIsDragging] = useState(false);


useEffect(() => {
  if (!stepIsDragging) return;

  const onMove = (e: MouseEvent) => {
    setStepDragPos({ x: e.clientX, y: e.clientY });
  };

  const onUp = async () => {
    setStepIsDragging(false);
    setStepDragItem(null);
    setStepDragPos(null);

    if (
      stepDropIndexRef.current !== null &&
      stepDragIndex !== null &&
      selectedScenario
    ) {
      await handleStepDrop(stepDropIndexRef.current);
    }

    setStepDragIndex(null);

    stepDropIndexRef.current = null;
  };

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  return () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
}, [stepIsDragging, stepDragIndex]);




useEffect(() => {
  if (!scenarioIsDragging) return;

  const onMove = (e: MouseEvent) => {
    setScenarioDragPos({ x: e.clientX, y: e.clientY });
  };

  const onUp = async () => {
  setScenarioIsDragging(false);
  setScenarioDragItem(null);
  setScenarioDragPos(null);

  const target = scenarioDropIndexRef.current;

  // get originating feature id
  const originFeatureId = scenarioDragFeatureIdRef.current;

  if (target !== null && scenarioDragIndex !== null && originFeatureId) {
    // call scenario reorder (featureId, dropIndex)
    await handleScenarioDrop(originFeatureId, target);
  }

  // cleanup
  scenarioDropIndexRef.current = null;
  setScenarioDropIndex(null);
  setScenarioDragIndex(null);
  scenarioDragFeatureIdRef.current = null;
};


  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  return () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
}, [scenarioIsDragging, scenarioDragIndex]);


  // load data
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

  // global mouse listeners while dragging
  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY });
    };
    const onUp = async () => {
      // perform drop if we have a target
      setIsDragging(false);
      setDragItem(null);
      setDragPos(null);

      const target = dropIndexRef.current;
      if (target !== null && featureDragIndex !== null) {
        // call reorder function
        await handleFeatureDrop(target);
      } else {
        // cleanup featureDragIndex
        setFeatureDragIndex(null);
      }

      setDropIndex(null);
      dropIndexRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, featureDragIndex]);

  // -------------------------
  // Reordering helpers (same as your original)
  // -------------------------
  const saveFeatureOrder = async (list: any[]) => {
    try {
      await axios.put(`/api/feature/${id}/feature-order`, {
        features: list.map((f) => ({ id: f.id, order: f.order })),
      });
    } catch (err) {
      console.log("Feature order save error:", err);
    }
  };

  const handleFeatureDrop = async (dropIdx: number) => {
    // if drag started from null, ignore
    if (featureDragIndex === null) return;

    const updated = [...features];
    const draggedItem = updated[featureDragIndex];

    // reorder
    updated.splice(featureDragIndex, 1);
    updated.splice(dropIdx, 0, draggedItem);

    // assign order
    const finalList = updated.map((f, idx) => ({ ...f, order: idx + 1 }));

    setFeatures(finalList);
    setFeatureDragIndex(null);

    await saveFeatureOrder(finalList);
  };

  // Scenario / Step reorder functions unchanged (left as-is)
  const saveScenarioOrder = async (scenarios: any[]) => {
    try {
      await axios.put("/api/scenario/order", {
        scenarios: scenarios.map((s) => ({ id: s.id, order: s.order })),
      });
    } catch (err) {
      console.log("Scenario order save error:", err);
    }
  };

  const handleScenarioDrop = async (featureId: string, dropIndexLocal: number) => {
    if (scenarioDragIndex === null) return;

    const updatedFeature = features.find((f) => f.id === featureId);
    if (!updatedFeature) return;

    const list = [...updatedFeature.scenarios];
    const dragged = list[scenarioDragIndex];

    list.splice(scenarioDragIndex, 1);
    list.splice(dropIndexLocal, 0, dragged);

    const finalList = list.map((s, idx) => ({ ...s, order: idx + 1 }));

    setFeatures((prev) => prev.map((f) => (f.id === featureId ? { ...f, scenarios: finalList } : f)));
    if (selectedFeature?.id === featureId) {
      setSelectedFeature((prev: any) => ({ ...prev, scenarios: finalList }));
    }

    await saveScenarioOrder(finalList);
    setScenarioDragIndex(null);
  };

const handleStepDrop = async (dropIndex: number) => {
  if (!selectedScenario) return;
  if (stepDragIndex === null) return;

  const list = [...selectedScenario.testSteps];
  const dragged = list[stepDragIndex];

  list.splice(stepDragIndex, 1);
  list.splice(dropIndex, 0, dragged);

  const finalList = list.map((s, i) => ({ ...s, order: i + 1 }));

  setSelectedScenario((prev: any) => ({
    ...prev,
    testSteps: finalList,
  }));

  await axios.put(`/api/scenario/${selectedScenario.id}`, {
    name: selectedScenario.name,
    description: selectedScenario.description,
    testSteps: finalList,
  });

  setStepDragIndex(null);
};


  // helpers to reload
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

  // Save feature form
  async function saveFeature() {
    if (!createName.trim()) return toast.error("Feature name is required ");
    try {
      const res = await axios.post("/api/feature", {
        name: createName,
        description: createDescription,
        projectId: id,
      });

      const newFeature = res.data;
      setFeatures((prev) => [...prev, newFeature]);
      setSelectedFeature(newFeature);
      setMode("view");
      setCreateName("");
      setCreateDescription("");
    } catch (err) {
      console.log(err);
    }
  }

  if (loading) return <div className="p-10">Loading...</div>;
  if (!project) return <div className="p-10 text-red-500">Project Not Found</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* MIDDLE PANEL — Feature Tree */}
      <section className="w-80 border-r bg-white p-4 flex flex-col">
        {/* Search */}
        <input
          type="text"
          placeholder="Search Feature..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-search"
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
          {features
            .filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((feature, index) => {
              const isSelected = selectedFeature?.id === feature.id;
              const scenarioCount = feature.scenarios?.length || 0;

              return (
                // wrapper receives mouseEnter events to track drop target
                <div
                  key={feature.id}
                  data-feature-id={feature.id}
                  onMouseEnter={() => {
                    if (isDragging) {
                      setDropIndex(index);
                      dropIndexRef.current = index;
                    }
                  }}
                  onMouseLeave={() => {
                    if (isDragging) {
                      setDropIndex((prev) => (prev === index ? null : prev));
                      if (dropIndexRef.current === index) dropIndexRef.current = null;
                    }
                  }}
                >
                  {/* ---- Feature Row (custom drag via onMouseDown) ---- */}
                  <div
                    onMouseDown={(e) => {
                      // left button only
                      if (e.button !== 0) return;
                      e.preventDefault();

                      setFeatureDragIndex(index);
                      setIsDragging(true);

                      // overlay JSX: copy any UI you want to show while dragging
                     const rowClasses =
  "flex items-center gap-2 p-2 rounded bg-white shadow text-gray-700";

setDragItem(
  <div
    className={rowClasses}
    style={{
      width: e.currentTarget.getBoundingClientRect().width + "px",
    }}
  >
    <GripVertical size={16} className="text-gray-400" />
    <ChevronDown size={14} className="text-gray-500" />
    <Folder size={14} className="text-gray-500" />
    <span className="truncate">
      {feature.order}. {feature.name} ({feature.scenarios?.length || 0})
    </span>
  </div>
);


                      setDragPos({ x: e.clientX, y: e.clientY });

                      // set immediate dropIndex to current hovered index
                      setDropIndex(index);
                      dropIndexRef.current = index;
                    }}
                    onClick={() => {
                      setSelectedFeature(feature);
                      setMode("view");
                      setExpandedFeatureId((prev) => (prev === feature.id ? null : feature.id));
                    }}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                      isSelected ? "bg-gray-100 text-indigo-600 font-medium" : ""
                    }`}
                  >
                    <GripVertical size={16} className="text-gray-400 cursor-move" />
                    <ChevronDown
                      size={14}
                      className={`text-gray-500 transition-transform duration-200 ${
                        expandedFeatureId === feature.id ? "rotate-180" : ""
                      }`}
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
        data-scenario-id={scenario.id}

        // ⭐ Track drop target
        onMouseEnter={() => {
          if (scenarioIsDragging) {
            scenarioDropIndexRef.current = sIndex;
            setScenarioDropIndex(sIndex);
          }
        }}

        className="relative"
      >
        {/* === Scenario Row (custom drag, NOT draggable) === */}
        <div
       onMouseDown={(e) => {
  // left button only
  if (e.button !== 0) return;
  e.stopPropagation();
  e.preventDefault();

  setScenarioDragIndex(sIndex);
  setScenarioIsDragging(true);

  // store originating feature id so drop can call handleScenarioDrop(featureId, index)
  scenarioDragFeatureIdRef.current = feature.id;

  const elem = e.currentTarget as HTMLElement;
  const width = elem.getBoundingClientRect().width;

  // Overlay UI SAME as real row
  setScenarioDragItem(
    <div
      className="flex items-center gap-2 p-2 cursor-pointer rounded bg-white shadow"
      style={{ width: width }}
    >
      <GripVertical size={14} className="text-gray-300 cursor-move" />
      <input type="checkbox" className="w-3 h-3" />
      <span className="text-gray-700 truncate">
        {scenario.order}. {scenario.name}
      </span>
    </div>
  );

  setScenarioDragPos({ x: e.clientX, y: e.clientY });

  scenarioDropIndexRef.current = sIndex;
  setScenarioDropIndex(sIndex);
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
      </div>
    ))}
  </div>
)}

                </div>
              );
            })}
        </div>
      </section>

      {/* RIGHT PANEL — Add Feature Form */}
      <main className="flex-1 p-6 overflow-y-auto">
        {mode === "none" && (
          <div className="text-gray-500 text-center mt-20 flex flex-col items-center">
            <Image src="/imageFeature.jpg" alt="No Selection" width={220} height={220} className="opacity-80 mb-4" />
            <p className="text-gray-500">Please select a feature or click "Add Feature"</p>
          </div>
        )}

        {mode === "create" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-lg font-semibold">Add Feature</h1>
              <div className="flex gap-2">
                <button onClick={() => setMode("none")} className="border px-4 py-2 rounded">
                  Cancel
                </button>
                <button onClick={saveFeature} className="bg-indigo-600 text-white px-4 py-2 rounded">
                  Save
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded shadow space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Feature Name</label>
                <input type="text" placeholder="Enter Feature Name" value={createName} onChange={(e) => setCreateName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea placeholder="Enter Description.." value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} className="w-full border rounded px-3 py-3 text-sm h-28" />
              </div>
            </div>
          </div>
        )}

        {/* VIEW FEATURE */}
        {mode === "view" && selectedFeature && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">{selectedFeature.name}</h1>
                <button className="flex items-center gap-2 border px-3 py-1 rounded-md text-sm hover:bg-gray-50">
                  <Download size={16} /> Export
                </button>
              </div>
              <div className="mt-4 text-gray-700 leading-relaxed">
                {selectedFeature.description || <span className="text-gray-400 italic">No description added</span>}
                <p className="text-xs text-gray-500 mt-4">
                  Created at {new Date(selectedFeature.createdAt).toLocaleString()} <br />
                  Updated at {new Date(selectedFeature.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold">Scenarios ({selectedFeature.scenarios?.length ?? 0})</h2>
                <button onClick={() => setOpenScenarioDrawer(true)} className="border px-3 py-1 rounded text-sm">
                  + Add Scenario
                </button>
              </div>

              {(selectedFeature.scenarios?.length ?? 0) === 0 && <div className="border w-full py-6 text-center rounded text-gray-400">Use button above to create a new scenario</div>}
            </div>
          </div>
        )}

        {/* SCENARIO VIEW */}
        {mode === "scenario" && selectedScenario && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h1 className="text-lg font-semibold">{selectedScenario.name}</h1>
              <p className="text-gray-600 mt-2">{selectedScenario.description || "No description added"}</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold">Test Steps</h2>
                <button onClick={() => setOpenStepsDrawer(true)} className="border px-3 py-1 rounded text-sm">
                  Edit
                </button>
              </div>

             <div className="space-y-2">
  {selectedScenario.testSteps?.map((step: any, index: number) => (
    <div
      key={index}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();

        setStepDragIndex(index);
        setStepIsDragging(true);

        stepDropIndexRef.current = index;

        setStepDragItem(
          <div
            className="flex items-center gap-3 p-3 border rounded bg-white shadow"
            style={{ width: e.currentTarget.getBoundingClientRect().width }}
          >
            <span className="text-xs bg-gray-200 px-2 py-1 rounded w-6 text-center">
              {index + 1}
            </span>

            <input type="checkbox" />

            <span className="font-medium text-indigo-600">{step.type}</span>
            <span className="truncate">{step.description}</span>
          </div>
        );

        setStepDragPos({ x: e.clientX, y: e.clientY });
      }}
      onMouseEnter={() => {
        if (stepIsDragging) stepDropIndexRef.current = index;
      }}
      className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-move"
    >
      <span className="text-xs bg-gray-200 px-2 py-1 rounded w-6 text-center">
        {index + 1}
      </span>
      <input type="checkbox" />
      <span className="font-medium text-indigo-600">{step.type}</span>
      <span className="truncate">{step.description}</span>
    </div>
  ))}
</div>

            </div>
          </div>
        )}

        {/* Drawers */}
        <CreateScenarioDrawer
          open={openScenarioDrawer}
          onClose={() => setOpenScenarioDrawer(false)}
          featureId={selectedFeature?.id}
          onSaved={async (scenarioId: string) => {
            setOpenScenarioDrawer(false);
            await reloadFeaturesList();
            await loadFeatureAgain();
            await loadScenario(scenarioId);
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
            await loadScenario(selectedScenario.id);
          }}
        />
      </main>

      {/* Drag overlay rendered at root via portal */}
   <DragOverlay item={dragItem} position={dragPos} />
<DragOverlay item={scenarioDragItem} position={scenarioDragPos} />
<DragOverlay item={stepDragItem} position={stepDragPos} />

    </div>
  );
}
