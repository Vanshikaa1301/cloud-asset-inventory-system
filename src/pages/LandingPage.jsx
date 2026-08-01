import { Link } from 'react-router-dom';
import { Cloud, Shield, BarChart3, Search, Bell, ArrowRight, Check, Zap, Globe, Lock } from 'lucide-react';

const features = [
  { icon: Search, title: 'Asset Discovery', desc: 'Automatically discover and catalog all cloud resources across AWS, Azure, and GCP.' },
  { icon: BarChart3, title: 'Cost Analytics', desc: 'Track spending, identify waste, and optimize cloud costs with real-time dashboards.' },
  { icon: Shield, title: 'Security Compliance', desc: 'Monitor security posture, detect misconfigurations, and ensure compliance.' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Get notified about critical changes, threats, and anomalies in real time.' },
  { icon: Globe, title: 'Multi-Cloud', desc: 'Manage resources across multiple cloud providers from a single dashboard.' },
  { icon: Lock, title: 'IAM Governance', desc: 'Track roles, policies, and permissions across all your cloud accounts.' },
];

const stats = [
  { value: '500+', label: 'Cloud Assets Managed' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '3', label: 'Cloud Providers' },
  { value: '24/7', label: 'Monitoring' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-7 h-7 text-primary-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">Cloud Asset Inventory</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-900" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-200 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-200 rounded-full blur-3xl" />
        </div>
        <div className="relative px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> Enterprise Cloud Management
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              One dashboard for all your
              <span className="text-primary-500"> cloud assets</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Discover, track, monitor, and manage cloud resources across AWS, Azure, and GCP. Built for teams that need visibility and control.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Sign in to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-500">{s.value}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Everything you need</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">A complete cloud inventory platform for modern teams</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Built for enterprise teams</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Whether you manage 10 or 10,000 cloud resources, Cloud Asset Inventory gives you the visibility and control you need to stay secure and compliant.
              </p>
              <div className="space-y-4">
                {['Real-time asset discovery and monitoring', 'Automated compliance checks and reporting', 'Multi-account and multi-region support', 'Role-based access control and audit logs'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="space-y-3">
                {[
                  { name: 'production-web-server', type: 'EC2', status: 'Healthy', color: 'bg-green-500' },
                  { name: 'analytics-data-bucket', type: 'S3', status: 'Healthy', color: 'bg-green-500' },
                  { name: 'customer-database', type: 'RDS', status: 'Healthy', color: 'bg-green-500' },
                  { name: 'public-marketing-assets', type: 'S3', status: 'Warning', color: 'bg-yellow-500' },
                  { name: 'unused-security-group', type: 'SG', status: 'Critical', color: 'bg-red-500' },
                ].map((a) => (
                  <div key={a.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${a.color}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{a.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{a.type}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${a.status === 'Healthy' ? 'text-green-600' : a.status === 'Warning' ? 'text-yellow-600' : 'text-red-600'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Start managing your cloud assets in minutes. No credit card required.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Cloud Asset Inventory</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 Cloud Asset Inventory System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
