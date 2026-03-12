"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

interface Child {
  id: string;
  name: string;
  age: string;
  city: string;
  country: string;
  curriculum: string;
  learning_style: string;
  interests: string[];
  notes: string;
  color_index: number;
}

const AVATAR_COLORS = [
  { bg: "#2D5016", text: "#F5E6C8" },
  { bg: "#8B4513", text: "#F5E6C8" },
  { bg: "#1B4D6E", text: "#F5E6C8" },
  { bg: "#6B3A7D", text: "#F5E6C8" },
  { bg: "#2E4A1E", text: "#F5E6C8" },
  { bg: "#7D3A1E", text: "#F5E6C8" },
];

const INTERESTS = [
  "Dinosaurs","Space","Animals","Math","History",
  "Art","Music","Nature","Sports","Technology","Cooking","Languages",
];

const LEARNING_STYLES = [
  { id: "visual",      label: "Visual",      icon: "🎨" },
  { id: "kinesthetic", label: "Kinesthetic", icon: "🏃" },
  { id: "auditory",    label: "Auditory",    icon: "🎵" },
  { id: "reading",     label: "Reading",     icon: "📚" },
];

const CURRICULA = [
  { id: "charlotte-mason", label: "Charlotte Mason" },
  { id: "classical",       label: "Classical" },
  { id: "unschooling",     label: "Unschooling" },
  { id: "montessori",      label: "Montessori" },
  { id: "eclectic",        label: "Eclectic" },
];

const AGE_GROUPS = ["4–6 years", "7–9 years", "10–12 years", "13–15 years", "16–18 years"];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function ChildDetail({ child, onSelect, onDelete }: {
  child: Child;
  onSelect: (c: Child) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const color = AVATAR_COLORS[child.color_index % AVATAR_COLORS.length];
  const ls = LEARNING_STYLES.find(l => l.id === child.learning_style);

  return (
    <div>
      <div style={{ background: color.bg, borderRadius: "16px 16px 0 0",
        padding: "24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 10, right: 20, fontSize: 50, opacity: .1 }}>🗺️</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%",
            background: "rgba(255,255,255,.15)", color: color.text,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 20, border: "2px solid rgba(255,255,255,.3)" }}>
            {getInitials(child.name)}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: color.text }}>{child.name}</div>
            <div style={{ color: "rgba(245,230,200,.7)", fontSize: 13, marginTop: 2 }}>
              {child.age} · {child.city}, {child.country} · {ls?.icon} {ls?.label}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#FDFAF5", border: "2px solid #D4C5A0",
        borderTop: "none", borderRadius: "0 0 16px 16px", padding: 22 }}>

        {child.interests.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#8B7355", marginBottom: 8 }}>Interests</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {child.interests.map(i => (
                <span key={i} style={{ padding: "4px 12px", borderRadius: 20,
                  background: "#F0E8D0", color: "#8B6914", fontSize: 12,
                  border: "1px solid #D4C5A0" }}>{i}</span>
              ))}
            </div>
          </div>
        )}

        {child.notes && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#8B7355", marginBottom: 8 }}>Notes</div>
            <p style={{ margin: 0, color: "#6B5A3E", fontSize: 13, fontStyle: "italic" }}>
              "{child.notes}"
            </p>
          </div>
        )}

        <button onClick={() => onSelect(child)}
          style={{ width: "100%", padding: 14, background: "#2D5016",
            color: "#F5E6C8", border: "none", borderRadius: 10, cursor: "pointer",
            fontSize: 16, fontWeight: 700, marginBottom: 10,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          🗺️ Generate this week's lesson plan
        </button>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            style={{ width: "100%", padding: 8, background: "transparent",
              color: "#B85C38", border: "1px solid #E8C4B0", borderRadius: 8,
              cursor: "pointer", fontSize: 13 }}>
            Remove {child.name}
          </button>
        ) : (
          <div style={{ background: "#FFF5F0", border: "1px solid #E8C4B0",
            borderRadius: 8, padding: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ flex: 1, fontSize: 13, color: "#B85C38" }}>Are you sure?</span>
            <button onClick={() => onDelete(child.id)}
              style={{ padding: "6px 14px", background: "#B85C38", color: "#fff",
                border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
              Yes, remove
            </button>
            <button onClick={() => setConfirmDelete(false)}
              style={{ padding: "6px 14px", background: "transparent", color: "#6B5A3E",
                border: "1px solid #D4C5A0", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChildrenPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [editingChild, setEditing] = useState<Child | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Child>>({});

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        // Map DB column names to interface names
        const mapped = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          age: c.age_group ?? c.age ?? "",
          city: c.city ?? "",
          country: c.country ?? "",
          curriculum: c.curriculum ?? "",
          learning_style: c.learn_style ?? c.learning_style ?? "",
          interests: c.subjects ?? c.interests ?? [],
          notes: c.notes ?? "",
          color_index: c.color_index ?? 0,
        }))
        setChildren(mapped)
        setActiveId(mapped[0].id)
      }
      setLoading(false)
    }
    load()
  }, [])

  const activeChild = children.find(c => c.id === activeId) ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setForm({ name: "", age: "7–9 years", city: "", country: "", curriculum: "eclectic",
      learning_style: "visual", interests: [], notes: "", color_index: children.length });
    setEditing(null);
    setMode("add");
  };

  const openEdit = (child: Child) => {
    setForm({ ...child });
    setEditing(child);
    setMode("edit");
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !userId) return;

    if (editingChild) {
      const { error } = await supabase
        .from('children')
        .update({
          name: form.name,
          age_group: form.age,
          city: form.city,
          country: form.country,
          curriculum: form.curriculum,
          learn_style: form.learning_style,
          subjects: form.interests,
          notes: form.notes,
        })
        .eq('id', editingChild.id)

      if (!error) {
        const updated = children.map(c => c.id === editingChild.id ? { ...c, ...form } as Child : c)
        setChildren(updated)
        showToast(`${form.name} updated ✓`)
        setMode("view")
      } else {
        console.error('Update error:', error)
        showToast('Error updating child')
      }
    } else {
      const newChild = {
        user_id: userId,
        name: form.name ?? "",
        age_group: form.age ?? "7–9 years",
        city: form.city ?? "",
        country: form.country ?? "",
        curriculum: form.curriculum ?? "eclectic",
        learn_style: form.learning_style ?? "visual",
        subjects: form.interests ?? [],
        notes: form.notes ?? "",
        color_index: children.length,
      }

      const { data, error } = await supabase
        .from('children')
        .insert(newChild)
        .select()

      if (!error && data && data.length > 0) {
        const saved = data[0]
        const mapped: Child = {
          id: saved.id,
          name: saved.name,
          age: saved.age_group ?? "",
          city: saved.city ?? "",
          country: saved.country ?? "",
          curriculum: saved.curriculum ?? "",
          learning_style: saved.learn_style ?? "",
          interests: saved.subjects ?? [],
          notes: saved.notes ?? "",
          color_index: saved.color_index ?? 0,
        }
        setChildren(prev => [...prev, mapped])
        setActiveId(mapped.id)
        showToast(`${mapped.name} added! 🎉`)
        setMode("view")
      } else {
        console.error('Insert error:', error)
        showToast('Error adding child')
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('children').delete().eq('id', id)
    if (!error) {
      const updated = children.filter(c => c.id !== id)
      setChildren(updated)
      setActiveId(updated[0]?.id ?? null)
      setMode("view")
      showToast("Child removed.")
    }
  };

  const handleSelect = (child: Child) => {
    const childData = {
      ...child,
      age_group: child.age,
      learn_style: child.learning_style,
      subjects: child.interests,
    }
    localStorage.setItem("activeChild", JSON.stringify(childData))
    localStorage.removeItem("cachedPlan")
    localStorage.removeItem("cachedPlanChild")
    router.push("/dashboard")
  };

  const toggleInterest = (interest: string) => {
    const curr = form.interests ?? [];
    setForm(f => ({
      ...f,
      interests: curr.includes(interest)
        ? curr.filter(i => i !== interest)
        : [...curr, interest],
    }));
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    border: "2px solid #D4C5A0", borderRadius: 8,
    background: "#FDFAF5", color: "#1C2B0E",
    fontSize: 15, outline: "none", boxSizing: "border-box",
    fontFamily: "Georgia, serif",
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F5EDD8", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🧭</div>
      <p style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#2D5016" }}>Loading your travelers...</p>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#F5EDD8", fontFamily: "Georgia, serif" }}>
      <style>{`* { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0; transform:translateX(-50%) translateY(8px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }
      `}</style>

      <div style={{ background: "#1C2B0E", padding: "0 24px", display: "flex",
        alignItems: "center", justifyContent: "space-between", height: 56,
        position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🧭</span>
          <span style={{ color: "#F5E6C8", fontSize: 18, fontWeight: 700 }}>Waypoint Education</span>
        </div>
        <button onClick={() => router.push("/dashboard")}
          style={{ background: "none", border: "1px solid #F5E6C8", borderRadius: 8,
            color: "#F5E6C8", cursor: "pointer", padding: "6px 14px", fontSize: 13 }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1C2B0E", margin: "0 0 4px 0" }}>
          My Travelers
        </h1>
        <p style={{ color: "#8B7355", margin: "0 0 24px 0", fontSize: 15 }}>
          {children.length} {children.length === 1 ? "child" : "children"} registered
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>

          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              {children.map(child => {
                const color = AVATAR_COLORS[child.color_index % AVATAR_COLORS.length];
                const isActive = activeId === child.id && mode === "view";
                return (
                  <div key={child.id} onClick={() => { setActiveId(child.id); setMode("view"); }}
                    style={{ cursor: "pointer", background: isActive ? "#F5E6C8" : "#FDFAF5",
                      border: `2px solid ${isActive ? "#2D5016" : "#D4C5A0"}`, borderRadius: 12,
                      padding: 14, display: "flex", alignItems: "center", gap: 12,
                      position: "relative", overflow: "hidden" }}>
                    {isActive && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#2D5016" }} />}
                    <div style={{ width: 44, height: 44, borderRadius: "50%",
                      background: color.bg, color: color.text,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                      {getInitials(child.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#1C2B0E",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {child.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#6B5A3E" }}>
                        {child.age} · {child.city || "No city"}
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); openEdit(child); }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.5 }}>
                      ✏️
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={openAdd}
              style={{ width: "100%", padding: 12, background: "transparent",
                border: "2px dashed #C8BEA6", borderRadius: 12, cursor: "pointer",
                color: "#8B7355", fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              ＋ Add child
            </button>
          </div>

          <div>
            {mode === "view" && activeChild && (
              <ChildDetail
                child={activeChild}
                onSelect={handleSelect}
                onDelete={handleDelete}
              />
            )}

            {mode === "view" && !activeChild && (
              <div style={{ background: "#FDFAF5", border: "2px dashed #D4C5A0",
                borderRadius: 16, padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#2D5016", marginBottom: 8 }}>
                  No children yet
                </div>
                <p style={{ color: "#8B7355", margin: 0 }}>Click "Add child" to get started.</p>
              </div>
            )}

            {(mode === "add" || mode === "edit") && (
              <div style={{ background: "#FDFAF5", border: "2px solid #D4C5A0",
                borderRadius: 16, padding: 24, position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4,
                  background: "linear-gradient(90deg,#2D5016,#8B6914,#2D5016)",
                  borderRadius: "16px 16px 0 0" }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1C2B0E", margin: "0 0 20px 0" }}>
                  {editingChild ? `Edit ${editingChild.name}` : "Add child"}
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                      textTransform: "uppercase", color: "#8B7355", marginBottom: 6 }}>Name</label>
                    <input value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Child's name" style={inp} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                      textTransform: "uppercase", color: "#8B7355", marginBottom: 6 }}>Age group</label>
                    <select value={form.age ?? "7–9 years"} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                      style={{ ...inp }}>
                      {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                      textTransform: "uppercase", color: "#8B7355", marginBottom: 6 }}>City</label>
                    <input value={form.city ?? ""} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="e.g. Bangkok" style={inp} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                      textTransform: "uppercase", color: "#8B7355", marginBottom: 6 }}>Country</label>
                    <input value={form.country ?? ""} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                      placeholder="e.g. Thailand" style={inp} />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                    textTransform: "uppercase", color: "#8B7355", marginBottom: 6 }}>Teaching philosophy</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {CURRICULA.map(c => (
                      <button key={c.id} onClick={() => setForm(f => ({ ...f, curriculum: c.id }))}
                        style={{ padding: "7px 14px", borderRadius: 8,
                          border: `2px solid ${form.curriculum === c.id ? "#2D5016" : "#D4C5A0"}`,
                          background: form.curriculum === c.id ? "#2D5016" : "transparent",
                          color: form.curriculum === c.id ? "#F5E6C8" : "#6B5A3E",
                          cursor: "pointer", fontSize: 13 }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                    textTransform: "uppercase", color: "#8B7355", marginBottom: 6 }}>Learning style</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {LEARNING_STYLES.map(ls => (
                      <button key={ls.id} onClick={() => setForm(f => ({ ...f, learning_style: ls.id }))}
                        style={{ padding: "7px 14px", borderRadius: 8,
                          border: `2px solid ${form.learning_style === ls.id ? "#2D5016" : "#D4C5A0"}`,
                          background: form.learning_style === ls.id ? "#2D5016" : "transparent",
                          color: form.learning_style === ls.id ? "#F5E6C8" : "#6B5A3E",
                          cursor: "pointer", fontSize: 13 }}>
                        {ls.icon} {ls.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                    textTransform: "uppercase", color: "#8B7355", marginBottom: 6 }}>Interests</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {INTERESTS.map(interest => (
                      <button key={interest} onClick={() => toggleInterest(interest)}
                        style={{ padding: "5px 12px", borderRadius: 20,
                          border: `1.5px solid ${(form.interests ?? []).includes(interest) ? "#8B6914" : "#D4C5A0"}`,
                          background: (form.interests ?? []).includes(interest) ? "#F5E6C8" : "transparent",
                          color: (form.interests ?? []).includes(interest) ? "#8B6914" : "#6B5A3E",
                          cursor: "pointer", fontSize: 12 }}>
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                    textTransform: "uppercase", color: "#8B7355", marginBottom: 6 }}>Notes</label>
                  <textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Special needs, allergies, languages..." rows={3}
                    style={{ ...inp, resize: "vertical" }} />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleSave} disabled={!form.name?.trim()}
                    style={{ flex: 1, padding: 12,
                      background: form.name?.trim() ? "#2D5016" : "#C8BEA6",
                      color: "#F5E6C8", border: "none", borderRadius: 8,
                      cursor: form.name?.trim() ? "pointer" : "default",
                      fontSize: 15, fontWeight: 700 }}>
                    {editingChild ? "Save" : "Add child"}
                  </button>
                  <button onClick={() => setMode("view")}
                    style={{ padding: "12px 18px", background: "transparent",
                      color: "#6B5A3E", border: "2px solid #D4C5A0",
                      borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%",
          transform: "translateX(-50%)", background: "#1C2B0E", color: "#F5E6C8",
          padding: "12px 24px", borderRadius: 10, fontSize: 15,
          boxShadow: "0 4px 20px rgba(0,0,0,.3)", zIndex: 100,
          animation: "fadeIn 0.2s ease", border: "1px solid #2D5016" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
