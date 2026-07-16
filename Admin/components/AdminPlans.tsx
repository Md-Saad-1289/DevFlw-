import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Layers, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

interface Plan {
  id: string;
  _id?: string;
  name: string;
  key: string;
  price: string;
  maxProjects: number;
  features: string[];
}

interface AdminPlansProps {
  plans: Plan[];
  onAddPlan: (plan: Omit<Plan, 'id'>) => Promise<boolean>;
  onUpdatePlan: (id: string, updates: Partial<Plan>) => Promise<boolean>;
  onDeletePlan: (id: string) => Promise<boolean>;
}

export const AdminPlans: React.FC<AdminPlansProps> = ({
  plans,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [price, setPrice] = useState('');
  const [maxProjects, setMaxProjects] = useState(2);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editKey, setEditKey] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editMaxProjects, setEditMaxProjects] = useState(2);
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [editNewFeatureText, setEditNewFeatureText] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetAddForm = () => {
    setName('');
    setKey('');
    setPrice('');
    setMaxProjects(2);
    setFeatures([]);
    setNewFeatureText('');
    setErrorMsg(null);
  };

  const startEdit = (plan: Plan) => {
    const id = plan.id || plan._id || '';
    setEditingId(id);
    setEditName(plan.name);
    setEditKey(plan.key);
    setEditPrice(plan.price);
    setEditMaxProjects(plan.maxProjects || 2);
    setEditFeatures(plan.features || []);
    setEditNewFeatureText('');
    setErrorMsg(null);
  };

  const handleAddFeature = (isEdit: boolean) => {
    if (isEdit) {
      if (!editNewFeatureText.trim()) return;
      setEditFeatures([...editFeatures, editNewFeatureText.trim()]);
      setEditNewFeatureText('');
    } else {
      if (!newFeatureText.trim()) return;
      setFeatures([...features, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (isEdit: boolean, index: number) => {
    if (isEdit) {
      setEditFeatures(editFeatures.filter((_, i) => i !== index));
    } else {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !key.trim() || !price.trim()) {
      setErrorMsg('Name, Key, and Price are required fields.');
      return;
    }

    setSaving(true);
    const success = await onAddPlan({
      name: name.trim(),
      key: key.trim().toLowerCase(),
      price: price.trim(),
      maxProjects: Number(maxProjects) || 2,
      features,
    });
    setSaving(true); // temporary state to trigger render reload
    setSaving(false);

    if (success) {
      setIsAdding(false);
      resetAddForm();
    } else {
      setErrorMsg('Failed to create plan. Make sure the plan key is unique.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setErrorMsg(null);

    if (!editName.trim() || !editKey.trim() || !editPrice.trim()) {
      setErrorMsg('Name, Key, and Price are required fields.');
      return;
    }

    setSaving(true);
    const success = await onUpdatePlan(editingId, {
      name: editName.trim(),
      key: editKey.trim().toLowerCase(),
      price: editPrice.trim(),
      maxProjects: Number(editMaxProjects) || 2,
      features: editFeatures,
    });
    setSaving(false);

    if (success) {
      setEditingId(null);
    } else {
      setErrorMsg('Failed to update plan. Ensure the plan key is unique.');
    }
  };

  const handleDelete = async (plan: Plan) => {
    const id = plan.id || plan._id || '';
    if (plan.key === 'free') {
      alert('The basic "free" plan is mandatory and cannot be deleted.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the plan "${plan.name}"? Users currently assigned this plan type will default to free limits.`)) {
      await onDeletePlan(id);
    }
  };

  return (
    <div className="space-y-6" id="admin-plans-container">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" /> Subscription Plan Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Create, modify, and delete the plans and project limits available on the platform.
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold shadow-sm transition-all cursor-pointer"
            id="admin-btn-add-plan"
          >
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add Plan Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4" id="admin-add-plan-form">
          <div className="flex items-center justify-between border-b pb-3 mb-2">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Create Custom Plan
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                resetAddForm();
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Plan Name</label>
              <input
                type="text"
                placeholder="e.g. Enterprise"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Plan Key (ID)</label>
              <input
                type="text"
                placeholder="e.g. enterprise"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Price Label</label>
              <input
                type="text"
                placeholder="e.g. $99/month"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Max Active Projects Limit</label>
              <input
                type="number"
                min="1"
                max="999"
                value={maxProjects}
                onChange={(e) => setMaxProjects(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Features Included</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Custom domain mapping"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature(false);
                  }
                }}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddFeature(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-all cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {features.map((feat, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium rounded-full"
                >
                  {feat}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(false, index)}
                    className="hover:text-indigo-900 rounded-full focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {features.length === 0 && (
                <p className="text-xs text-gray-400 italic">No features added yet. Add some items above.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                resetAddForm();
              }}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Creating...' : 'Save Plan'}
            </button>
          </div>
        </form>
      )}

      {/* Edit Plan Form */}
      {editingId && (
        <form onSubmit={handleUpdate} className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm space-y-4" id="admin-edit-plan-form">
          <div className="flex items-center justify-between border-b pb-3 mb-2">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-500" /> Edit Pricing Plan
            </h3>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Plan Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Plan Key (ID)</label>
              <input
                type="text"
                value={editKey}
                onChange={(e) => setEditKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Price Label</label>
              <input
                type="text"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Max Active Projects Limit</label>
              <input
                type="number"
                min="1"
                max="999"
                value={editMaxProjects}
                onChange={(e) => setEditMaxProjects(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Features Included</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add another feature"
                value={editNewFeatureText}
                onChange={(e) => setEditNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature(true);
                  }
                }}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddFeature(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-all cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {editFeatures.map((feat, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 text-xs font-medium rounded-full"
                >
                  {feat}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(true, index)}
                    className="hover:text-amber-900 rounded-full focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Updating...' : 'Update Plan'}
            </button>
          </div>
        </form>
      )}

      {/* Plans List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" id="admin-plans-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">Plan Name</th>
                <th className="py-3.5 px-4 font-bold">Plan Key (ID)</th>
                <th className="py-3.5 px-4 font-bold">Price Label</th>
                <th className="py-3.5 px-4 font-bold">Max Active Projects</th>
                <th className="py-3.5 px-4 font-bold">Included Features</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {plans.map((p) => {
                const planId = p.id || p._id || '';
                return (
                  <tr key={planId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-900 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        p.key === 'free' ? 'bg-gray-400' : p.key === 'pro' ? 'bg-amber-400 animate-pulse' : 'bg-indigo-500'
                      }`} />
                      {p.name}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-gray-600 bg-gray-50 rounded select-all py-1 px-2.5 inline-block my-2">
                      {p.key}
                    </td>
                    <td className="py-4 px-4 text-gray-800 font-semibold">
                      {p.price}
                    </td>
                    <td className="py-4 px-4 text-gray-950 font-bold">
                      {p.maxProjects} projects
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {p.features?.map((f, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-medium rounded">
                            {f}
                          </span>
                        ))}
                        {(!p.features || p.features.length === 0) && (
                          <span className="text-gray-400 text-xs italic">No features listed</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-indigo-600 rounded transition-all cursor-pointer"
                          title="Edit Plan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {p.key !== 'free' && (
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-red-600 rounded transition-all cursor-pointer"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-gray-400 font-medium">
                    No plan configurations found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-indigo-900">How dynamic plans affect client slots:</h4>
          <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
            When a user has a specific plan assigned, their active non-archived projects count is checked against that plan's <strong>Max Active Projects</strong> limit. You can update any user's assigned plan levels directly inside the <strong>Users Tab</strong> above.
          </p>
        </div>
      </div>
    </div>
  );
};
