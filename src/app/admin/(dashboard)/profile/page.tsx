"use client";

import { useState } from "react";
import { User, Mail, Shield, Key, Bell, Save } from "lucide-react";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    seo: true,
    errors: true,
    weekly: false,
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">Profile</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Manage your account settings.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          {/* Profile info */}
          <div className="admin-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--a-text-1)]">
              <User className="size-5 text-[var(--a-text-3)]" />
              Profile Information
            </h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--a-text-2)] mb-1.5">Display Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-elevated)] px-4 py-2.5 text-sm text-[var(--a-text-1)] placeholder:text-[var(--a-text-4)] focus:outline-none focus:ring-2 focus:ring-[var(--a-accent)]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--a-text-2)] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--a-text-4)]" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@motionix.com"
                    className="w-full rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-elevated)] py-2.5 pl-10 pr-4 text-sm text-[var(--a-text-1)] placeholder:text-[var(--a-text-4)] focus:outline-none focus:ring-2 focus:ring-[var(--a-accent)]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--a-text-2)] mb-1.5">Role</label>
                <div className="flex items-center gap-2 rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-elevated)] px-4 py-2.5">
                  <Shield className="size-4 text-[var(--a-accent)]" />
                  <span className="text-sm text-[var(--a-text-2)]">Administrator</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="admin-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--a-text-1)]">
              <Key className="size-5 text-[var(--a-text-3)]" />
              Security
            </h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--a-text-2)] mb-1.5">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-elevated)] px-4 py-2.5 text-sm text-[var(--a-text-1)] placeholder:text-[var(--a-text-4)] focus:outline-none focus:ring-2 focus:ring-[var(--a-accent)]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--a-text-2)] mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-elevated)] px-4 py-2.5 text-sm text-[var(--a-text-1)] placeholder:text-[var(--a-text-4)] focus:outline-none focus:ring-2 focus:ring-[var(--a-accent)]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--a-text-2)] mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-elevated)] px-4 py-2.5 text-sm text-[var(--a-text-1)] placeholder:text-[var(--a-text-4)] focus:outline-none focus:ring-2 focus:ring-[var(--a-accent)]/30"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification preferences */}
          <div className="admin-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--a-text-1)]">
              <Bell className="size-5 text-[var(--a-text-3)]" />
              Notifications
            </h2>
            <div className="mt-6 space-y-4">
              {[
                { key: "email" as const, label: "Email notifications", desc: "Receive email alerts" },
                { key: "seo" as const, label: "SEO alerts", desc: "Ranking changes and issues" },
                { key: "errors" as const, label: "Error alerts", desc: "404s and sync failures" },
                { key: "weekly" as const, label: "Weekly digest", desc: "Summary every Monday" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--a-text-1)]">{item.label}</p>
                    <p className="text-[11px] text-[var(--a-text-4)]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      notifications[item.key] ? "bg-[var(--a-accent)]" : "bg-[var(--a-bg-elevated)]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${
                        notifications[item.key] ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="admin-btn admin-focus flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--a-accent)] py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Save className="size-4" />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
