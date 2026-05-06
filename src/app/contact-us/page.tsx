import { StudentShell } from "@/components/student-shell";
import { requireAuth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function ContactUsPage() {
  const user = await requireAuth();

  return (
    <StudentShell
      userName={user.email}
      userRole={user.role}
      navItems={[
        { href: "/problems", label: "Problems" },
        { href: "/submissions", label: "Submissions" },
        { href: "/mock-test", label: "Mock Test" },
        { href: "/contact-us", label: "Contact Us", active: true },
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-slate-300">
            Get in touch with our development team
          </p>
        </div>

        {/* Project Lead - 1 Box */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sarthak Verma</h3>
            <p className="text-slate-300 mb-2">+91 9113798592</p>
            <p className="text-sm text-slate-400">CORE</p>
          </div>
        </div>

        {/* Team Members - 5 Boxes */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Core Team</h2>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Team Member</h3>
              <p className="text-xs text-slate-300 mb-1">+1 (555) 111-1111</p>
              <p className="text-xs text-slate-400">Developer</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Team Member</h3>
              <p className="text-xs text-slate-300 mb-1">+1 (555) 222-2222</p>
              <p className="text-xs text-slate-400">Developer</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Team Member</h3>
              <p className="text-xs text-slate-300 mb-1">+1 (555) 333-3333</p>
              <p className="text-xs text-slate-400">Developer</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Team Member</h3>
              <p className="text-xs text-slate-300 mb-1">+1 (555) 444-4444</p>
              <p className="text-xs text-slate-400">Developer</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Team Member</h3>
              <p className="text-xs text-slate-300 mb-1">+1 (555) 555-5555</p>
              <p className="text-xs text-slate-400">Developer</p>
            </div>
          </div>
        </div>

        {/* Team Members - 8 Boxes */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Extended Team</h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div key={num} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-white mb-0.5">Member {num}</h3>
                <p className="text-xs text-slate-400">Developer</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-4">About Our Team</h2>
            <p className="text-slate-300 leading-relaxed">
              We are a dedicated team of developers passionate about creating quality educational platforms.
              If you have any questions, feedback, or need technical support, feel free to reach out to any of our team members above.
            </p>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}