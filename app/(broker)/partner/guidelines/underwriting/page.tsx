export default function UnderwritingGuidelinesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Underwriting Guidelines</h2>
        <p className="text-gray-600 mt-1">
          Understanding our criteria helps you submit deals that get funded faster.
        </p>
      </div>

      {/* Quick Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-500">Min. Time in Business</div>
            <div className="text-2xl font-bold text-gray-900">2+ Years</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-500">Min. Annual Revenue</div>
            <div className="text-2xl font-bold text-gray-900">$250K+</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-500">Funding Range</div>
            <div className="text-2xl font-bold text-gray-900">$25K - $5M</div>
          </div>
        </div>
      </div>

      {/* Equipment Types */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment We Finance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Preferred Equipment
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Construction equipment (excavators, loaders, cranes)</li>
              <li>• Transportation (trucks, trailers, fleet vehicles)</li>
              <li>• Medical/dental equipment</li>
              <li>• Manufacturing machinery</li>
              <li>• Restaurant equipment</li>
              <li>• Technology and IT infrastructure</li>
              <li>• Agricultural equipment</li>
              <li>• Printing and packaging equipment</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-700 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Equipment We Don&apos;t Finance
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Real estate or land</li>
              <li>• Inventory or working capital</li>
              <li>• Fixtures permanently attached to buildings</li>
              <li>• Single-purpose equipment with no resale value</li>
              <li>• Equipment over 10 years old (case-by-case)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Credit Requirements */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Requirements</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-gray-900">A/B Credit (680+ FICO)</h4>
            <p className="text-sm text-gray-600 mt-1">
              Best rates and terms. Minimal documentation required. Quick approvals within 24-48 hours.
            </p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-medium text-gray-900">C Credit (620-679 FICO)</h4>
            <p className="text-sm text-gray-600 mt-1">
              Competitive rates available. May require additional documentation. Strong business financials can offset personal credit.
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-gray-900">D Credit (580-619 FICO)</h4>
            <p className="text-sm text-gray-600 mt-1">
              Higher rates but still possible. Requires strong business performance and may need larger down payment.
            </p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-gray-900">Below 580 FICO</h4>
            <p className="text-sm text-gray-600 mt-1">
              Considered case-by-case. Typically requires substantial down payment (20%+) and strong collateral position.
            </p>
          </div>
        </div>
      </div>

      {/* Deal Structure */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Structure Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Equipment Finance Agreement (EFA)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Customer owns equipment at end of term</li>
              <li>• $1 buyout at maturity</li>
              <li>• Terms: 24-84 months</li>
              <li>• Best for: Long-term equipment needs</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Fair Market Value Lease (FMV)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Lower monthly payments</li>
              <li>• Option to purchase, renew, or return</li>
              <li>• Terms: 24-60 months</li>
              <li>• Best for: Technology, equipment that depreciates quickly</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Sale-Leaseback</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Unlock capital from existing equipment</li>
              <li>• Equipment must be owned free and clear</li>
              <li>• Up to 80% of fair market value</li>
              <li>• Best for: Working capital needs</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Working Capital (Equipment-Secured)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use equipment as collateral for cash</li>
              <li>• Flexible use of funds</li>
              <li>• Terms: 12-36 months</li>
              <li>• Best for: Growth, inventory, payroll</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Red Flags */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Common Deal Killers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-800">
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Active bankruptcy or recent discharge (&lt;2 years)
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Outstanding tax liens (federal or state)
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Criminal history involving fraud or financial crimes
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Declining revenue trend (3+ consecutive years)
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              NSF/overdraft history in last 90 days
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Startup with no revenue history
            </li>
          </ul>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Have Questions?</h3>
        <p className="text-gray-600 mb-4">
          Not sure if a deal fits? Reach out before submitting - we&apos;re happy to pre-qualify.
        </p>
        <a
          href="mailto:deals@commcapconnect.com"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Contact Us
        </a>
      </div>
    </div>
  )
}
