'use client';

import { useState } from 'react';

interface Analysis {
  overallScore: number;
  redFlags: Array<{
    type: string;
    severity: string;
    evidence: string;
    explanation: string;
  }>;
  greenFlags: string[];
  advice: string;
  verdict: string;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [industry, setIndustry] = useState('designer');
  const [experience, setExperience] = useState('experienced');
  const [projectType, setProjectType] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState('');
  
  // ADD THESE NEW LINES:
  const [accessCode, setAccessCode] = useState('');
  const [codeValidated, setCodeValidated] = useState(false);
  const [codeMessage, setCodeMessage] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const projectTypes = {
    designer: ['Logo Design', 'Website Design', 'Brand Identity', 'Print Design', 'Social Media Graphics'],
    developer: ['Website', 'Web App', 'Mobile App', 'E-commerce', 'Custom Integration'],
    photographer: ['Wedding', 'Portrait', 'Commercial', 'Event', 'Product Photography'],
    consultant: ['Strategy', 'Process Improvement', 'Marketing', 'Operations', 'Training'],
    copywriter: ['Website Copy', 'Blog Content', 'Email Campaigns', 'Social Media', 'Sales Pages'],
    other: ['Custom Project']
  };

  const analyzeMessage = async () => {
  if (!message.trim()) return;
  
  setLoading(true);
  setError('');
  
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: message.trim(),
        industry,
        experience,
        projectType,
        validated: codeValidated // ADD THIS LINE
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Analysis failed');
    }
    
    const result = await response.json();
    setAnalysis(result);
  } catch (err) {
    console.error('Analysis error:', err);
    setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
  } finally {
  setLoading(false);
  setAnalysisLoading(false);  // Add this line
}
};

  // ADD THESE NEW FUNCTIONS:
  const validateCode = async () => {
    if (!accessCode.trim()) return;
    
    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode })
      });
      
      const result = await response.json();
      
      if (result.valid) {
        setCodeValidated(true);
        setCodeMessage(result.message);
     if (result.discount === 100) {
         setAnalysisLoading(true);  // Add this line
          setTimeout(() => {
      analyzeMessage();
    }, 500);
  }
      } else {
        setCodeMessage(result.message);
      }
    } catch (error) {
      setCodeMessage('Error validating code. Please try again.');
    }
  };

  const handleAnalyzeClick = () => {
    if (!message.trim()) return;
    setShowCodeInput(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🚩 RedFlagChecker.app
            </h1>
            <p className="text-xl text-gray-600">
              Don&apos;t work with nightmare clients. Check first.
            </p>
          </div>
        </div>
      </div>

      {/* Beta Testing Banner */}
      <div className="bg-green-500 text-white py-3">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold">
            🎉 FREE Beta Testing - First 250 Users Only!
          </p>
          <p className="text-sm opacity-90">
            Help us improve RedFlagChecker by testing with real client messages
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Analyze Your Client Message
          </h2>
          
          {/* Industry and Experience Settings */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Industry
              </label>
              <select
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value);
                  setProjectType(''); // Reset project type when industry changes
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="designer">Graphic Designer</option>
                <option value="developer">Web Developer</option>
                <option value="photographer">Photographer</option>
                <option value="consultant">Consultant</option>
                <option value="copywriter">Copywriter</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="beginner">New (0-2 years)</option>
                <option value="experienced">Experienced (3-7 years)</option>
                <option value="expert">Expert (8+ years)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select project type</option>
                {projectTypes[industry as keyof typeof projectTypes]?.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <label className="block text-lg font-medium text-gray-700 mb-4">
            Paste the client message here:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Hi, I need a logo designed. I have a very small budget but this could lead to more work. I need it ASAP and I&apos;ll know what I like when I see it..."
          />
          
          <div className="flex justify-center mt-6">
            {!showCodeInput ? (
              <button
                onClick={handleAnalyzeClick}
                disabled={!message.trim() || loading}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Analyze Client Message - $1 🚩
              </button>
            ) : !codeValidated ? (
              <div className="bg-blue-50 p-6 rounded-lg max-w-md mx-auto">
                <h3 className="text-lg font-bold text-blue-900 mb-3">Enter Access Code</h3>
                <p className="text-blue-800 mb-4">
                  Have a beta testing code? Enter it below for free access.
                </p>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    placeholder="Enter your access code"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <button
  onClick={validateCode}
  disabled={!accessCode.trim()}
  className="w-full font-bold py-4 px-6 rounded-lg text-lg shadow-lg border-2"
  style={{
    backgroundColor: accessCode.trim() ? '#1D4ED8' : '#E5E7EB',
    color: accessCode.trim() ? 'white' : '#9CA3AF',
    borderColor: accessCode.trim() ? '#1D4ED8' : '#D1D5DB',
    cursor: accessCode.trim() ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s'
  }}
>
  {accessCode.trim() ? 'Validate Code ✓' : 'Enter code above'}
</button>
                  
                  {codeMessage && (
                    <p className={`text-sm ${codeMessage.includes('unlocked') || codeMessage.includes('applied') ? 'text-green-700' : 'text-red-700'}`}>
                      {codeMessage}
                    </p>
                  )}
                  
                  <div className="text-center mt-4 pt-4 border-t border-gray-200">
  <p className="text-sm text-gray-600 mb-3">
    Don&apos;t have a code?
  </p>
  <a 
    href="mailto:hello@obsidian.cx?subject=Beta Access Request&body=Hi! I'd like to try RedFlagChecker.app. Could I get a beta access code?%0D%0A%0D%0AMy industry: %0D%0AExperience level: %0D%0A%0D%0AThanks!"
    className="text-blue-600 hover:text-blue-800 font-semibold underline hover:no-underline transition-all"
  >
    Request Beta Access
  </a>
  <p className="text-xs text-gray-500 mt-2">
    We'll send you a code within 24 hours
  </p>
</div>
                </div>
                
                <button
                  onClick={() => setShowCodeInput(false)}
                  className="mt-4 text-gray-500 hover:text-gray-700 underline text-sm"
                >
                  ← Back to edit message
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-green-800 font-semibold">{codeMessage}</p>
                </div>
                
                {analysisLoading || loading ? (
                  <div className="flex flex-col items-center space-y-4 py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                    <div className="text-center">
                      <p className="text-blue-600 font-semibold text-lg">Analyzing your message...</p>
                      <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={analyzeMessage}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
                  >
                    Analyze Now - FREE!
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                FREE Beta Testing
              </span>
              <span className="ml-2">Available for first 250 users only</span>
            </p>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Results Section - keep your existing results display code here */}
        {analysis && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold mb-2">
                {analysis.overallScore}/10
              </div>
              <div className={`text-xl font-semibold ${
                analysis.overallScore >= 7 ? 'text-red-600' : 
                analysis.overallScore >= 4 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {analysis.verdict}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Analysis for {industry} • {experience} level • {projectType}
              </p>
            </div>

            {/* Red Flags */}
            {analysis.redFlags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-red-600 mb-4">🚩 Red Flags Detected:</h3>
                <div className="space-y-3">
                  {analysis.redFlags.map((flag, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4">
                      <div className="font-semibold text-gray-900">
                        {flag.type} - {flag.severity} Risk
                      </div>
                      <div className="text-gray-600 italic">"{flag.evidence}"</div>
                      <div className="text-gray-700">{flag.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Green Flags */}
            {analysis.greenFlags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-green-600 mb-4">✅ Green Flags:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.greenFlags.map((flag, index) => (
                    <li key={index} className="text-gray-700">{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Advice */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-900 mb-3">💡 Industry-Specific Advice:</h3>
              <p className="text-blue-800 leading-relaxed">{analysis.advice}</p>
            </div>
          </div>
        )}
        
        {/* Keep your existing example messages section */}

      </div>

      
    </main>
  );
}
