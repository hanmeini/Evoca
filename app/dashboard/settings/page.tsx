import { Settings, User, Bell, Shield, Paintbrush } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-24 min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-stone-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-stone-900 leading-tight">
            Settings
          </h1>
          <p className="text-sm font-bold text-stone-400 mt-1">
            Atur preferensi akun Anda.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          {[
            { label: "Profile", icon: User, active: true },
            { label: "Notifications", icon: Bell, active: false },
            { label: "Privacy & Security", icon: Shield, active: false },
            { label: "Appearance", icon: Paintbrush, active: false },
          ].map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center gap-4 p-4 rounded-3xl font-bold transition-all ${
                item.active
                  ? "bg-rose-100 text-rose-700 shadow-sm border border-rose-200"
                  : "bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 bg-white border-2 border-stone-100 rounded-[2.5rem] p-8 md:p-10 shadow-xl">
          <h2 className="font-serif text-2xl font-black text-stone-900 mb-6">
            Profile Settings
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                Display Name
              </label>
              <input
                type="text"
                defaultValue="User"
                className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-5 py-4 font-bold text-stone-900 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="user@example.com"
                disabled
                className="w-full bg-stone-100 border-2 border-stone-100 rounded-2xl px-5 py-4 font-bold text-stone-500 cursor-not-allowed"
              />
            </div>
            <div className="pt-4">
              <button className="bg-stone-900 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:-translate-y-1 transition-transform inline-flex items-center gap-2">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
