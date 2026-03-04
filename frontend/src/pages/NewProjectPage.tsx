import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Plus, Trash2, Sparkles } from 'lucide-react';
import type { ProfileNeed, SkillLevel } from '../types';
import { mockPeople } from '../mocks/data';

interface FormData {
  name: string;
  description: string;
  client: string;
  startDate: string;
  endDate: string;
  profileNeeds: ProfileNeed[];
}

const EMPTY_NEED: ProfileNeed = {
  role: '',
  requiredSkills: [],
  workloadPercent: 50,
  minLevel: 'mid',
};

const ALL_ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'UX Designer', 'Data Engineer'];
const ALL_SKILLS = ['React', 'TypeScript', 'Python', 'FastAPI', 'TailwindCSS', 'Docker', 'Kubernetes', 'Figma', 'SQL', 'Spark', 'CI/CD', 'PostgreSQL'];

interface SuggestedMatch {
  personName: string;
  personRole: string;
  matchScore: number;
  initials: string;
}

function computeMatches(needs: ProfileNeed[]): SuggestedMatch[] {
  return needs.flatMap(need => {
    return mockPeople
      .filter(p => p.role === need.role || p.skills.some(s => need.requiredSkills.includes(s.name)))
      .filter(p => p.availabilityPercent >= need.workloadPercent)
      .map(p => {
        const skillMatches = p.skills.filter(s => need.requiredSkills.includes(s.name)).length;
        const score = Math.min(100, Math.round((skillMatches / Math.max(need.requiredSkills.length, 1)) * 80 + (p.availabilityPercent / 100) * 20));
        return { personName: p.name, personRole: p.role, matchScore: score, initials: p.avatarInitials };
      });
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
}

export function NewProjectPage() {
  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    client: '',
    startDate: '',
    endDate: '',
    profileNeeds: [{ ...EMPTY_NEED }],
  });
  const [isShowingMatches, setIsShowingMatches] = useState(false);
  const [matches, setMatches] = useState<SuggestedMatch[]>([]);

  function addNeed() {
    setForm(f => ({ ...f, profileNeeds: [...f.profileNeeds, { ...EMPTY_NEED }] }));
  }

  function removeNeed(index: number) {
    setForm(f => ({ ...f, profileNeeds: f.profileNeeds.filter((_, i) => i !== index) }));
  }

  function updateNeed(index: number, patch: Partial<ProfileNeed>) {
    setForm(f => ({
      ...f,
      profileNeeds: f.profileNeeds.map((n, i) => (i === index ? { ...n, ...patch } : n)),
    }));
  }

  function toggleSkill(index: number, skill: string) {
    const current = form.profileNeeds[index].requiredSkills;
    const updated = current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill];
    updateNeed(index, { requiredSkills: updated });
  }

  function handleFindMatches() {
    const computed = computeMatches(form.profileNeeds);
    setMatches(computed);
    setIsShowingMatches(true);
  }

  const isFormValid = form.name && form.client && form.startDate && form.endDate && form.profileNeeds.some(n => n.role);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Proyectos
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Nuevo proyecto</h1>

      <div className="space-y-6">
        {/* General info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Información general</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej. Portal de Clientes v2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Describe el proyecto..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <input
                type="text"
                value={form.client}
                onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nombre del cliente"
              />
            </div>
            <div />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Profile needs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Perfiles necesarios</h2>

          {form.profileNeeds.map((need, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4 space-y-3 relative">
              {form.profileNeeds.length > 1 && (
                <button
                  onClick={() => removeNeed(index)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                  <select
                    value={need.role}
                    onChange={e => updateNeed(index, { role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecciona un rol</option>
                    {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nivel mínimo</label>
                  <select
                    value={need.minLevel}
                    onChange={e => updateNeed(index, { minLevel: e.target.value as SkillLevel })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Carga estimada: <span className="text-indigo-600 font-bold">{need.workloadPercent}%</span> por semana
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={10}
                  value={need.workloadPercent}
                  onChange={e => updateNeed(index, { workloadPercent: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Skills requeridas</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SKILLS.map(skill => {
                    const isSelected = need.requiredSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(index, skill)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addNeed}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <Plus className="w-4 h-4" /> Añadir otro perfil
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleFindMatches}
            disabled={!isFormValid}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" /> Buscar matches
          </button>
          <button
            disabled={!isFormValid}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Crear proyecto
          </button>
        </div>

        {/* Suggested Matches */}
        {isShowingMatches && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Matches sugeridos
            </h2>
            {matches.length === 0 ? (
              <p className="text-sm text-amber-700">No se encontraron personas disponibles con los perfiles indicados.</p>
            ) : (
              <div className="space-y-2">
                {matches.map((match, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-amber-100">
                    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold">
                      {match.initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{match.personName}</p>
                      <p className="text-xs text-gray-500">{match.personRole}</p>
                    </div>
                    <span className={`text-sm font-bold ${match.matchScore >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {match.matchScore}% match
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
