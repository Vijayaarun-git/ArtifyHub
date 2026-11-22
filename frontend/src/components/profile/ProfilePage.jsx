import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAuth } from '../../store/slices/authSlice';
import { showToast } from '../../store/slices/uiSlice';
import * as profileService from '../../services/profileService';

export default function ProfilePage() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: auth.username || '',
    email: auth.email || '',
    avatarUrl: auth.avatarUrl || '',
  });
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.username.trim() || !form.email.trim()) {
      dispatch(showToast('Name and email are required', 'error'));
      return;
    }

    setSaving(true);
    try {
      const response = auth.token.startsWith('demo-jwt-')
        ? { data: { ...auth, ...form, username: form.username.trim(), email: form.email.trim() } }
        : await profileService.updateProfile({
          username: form.username.trim(),
          email: form.email.trim(),
          avatarUrl: form.avatarUrl.trim() || null,
        });
      dispatch(setAuth(response.data));
      dispatch(showToast('Profile updated successfully'));
    } catch (error) {
      dispatch(showToast(
        error?.response?.data?.message || 'Unable to update your profile',
        'error'
      ));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 sm:px-10 py-8 bg-gradient-to-r from-indigo-700 to-violet-600 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-100">Account settings</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold font-display">My Profile</h1>
          <p className="mt-2 text-indigo-100">Update the details shown on your ArtifyHub account.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold overflow-hidden">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                form.username.charAt(0).toUpperCase() || '?'
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900">Profile photo</p>
              <p className="text-sm text-slate-500">Paste a public image URL below.</p>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Name</span>
            <input name="username" value={form.username} onChange={updateField} required
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email address</span>
            <input type="email" name="email" value={form.email} onChange={updateField} required
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Profile image URL <span className="font-normal text-slate-400">(optional)</span></span>
            <input type="url" name="avatarUrl" value={form.avatarUrl} onChange={updateField}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
