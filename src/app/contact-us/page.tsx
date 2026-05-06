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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Contact Us</h1>
        <p className="text-slate-300 mb-8">
          Have a question or need help? Send us a message and we&apos;ll get back to you as soon as possible.
        </p>

        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={user.email.split('@')[0]} // Pre-fill with username part
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={user.email}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="What&apos;s this about?"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-vertical"
              placeholder="Tell us how we can help you..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Send Message
          </button>
        </form>
      </div>
    </StudentShell>
  );
}