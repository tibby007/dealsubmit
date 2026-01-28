import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DealSubmit Pro</h1>
              <p className="text-xs text-gray-600">Commercial Capital Connect</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 font-medium text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Streamlined Deal Submissions
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Submit Equipment Finance Deals{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Faster
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            The broker portal built for speed and efficiency. Submit deals, track status,
            manage documents, and communicate with our team—all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Create Broker Account
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 font-semibold text-lg transition-all border-2 border-gray-200 hover:border-gray-300"
            >
              Sign In
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Broker registration requires admin approval • No credit card required
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Close Deals
          </h2>
          <p className="text-lg text-gray-600">
            Purpose-built tools for equipment finance brokers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">8-Step Wizard</h3>
            <p className="text-gray-600">
              Guided deal submission with validation at each step. Never miss a required field again.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Status</h3>
            <p className="text-gray-600">
              Track your deals through the entire pipeline. Get instant notifications on status changes.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Messaging</h3>
            <p className="text-gray-600">
              Communicate with our team directly on each deal. No more email threads.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Management</h3>
            <p className="text-gray-600">
              Upload, manage, and track all deal documents in one secure location.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Encrypted</h3>
            <p className="text-gray-600">
              AES-256 encryption for SSNs. Bank-level security for all sensitive information.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Notifications</h3>
            <p className="text-gray-600">
              Stay informed with automatic updates on deal status, messages, and document requests.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join Commercial Capital Connect's broker network and start submitting deals today.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Create Your Broker Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DS</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">DealSubmit Pro</p>
                <p className="text-xs text-gray-600">by Commercial Capital Connect</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="/login" className="hover:text-gray-900">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-gray-900">
                Register
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Commercial Capital Connect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
