import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  Smartphone, 
  ChartLine, 
  FileUp, 
  Clock, 
  Users, 
  Download, 
  Bell,
  CheckCircle,
  Plus,
  UserRound,
  GraduationCap,
  FileText,
  Activity
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserRound className="text-sky-500 h-8 w-8" />
                <span className="text-xl font-bold text-slate-50">EndorseMe</span>
                <span className="text-sm text-slate-400">.com.au</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-300 hover:text-slate-50 transition-colors">Features</a>
              <a href="#pathways" className="text-slate-300 hover:text-slate-50 transition-colors">Pathways</a>
              <a href="#pricing" className="text-slate-300 hover:text-slate-50 transition-colors">Pricing</a>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-sky-600 hover:bg-sky-500 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Streamline Your 
                  <span className="text-sky-400"> Nurse Practitioner</span> 
                  Endorsement Journey
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed">
                  The comprehensive platform designed for Australian nurses navigating AHPRA/NMBA endorsement requirements. Track your progress, manage documentation, and ensure readiness for submission.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all"
                >
                  Start Your Journey
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-slate-600 hover:border-slate-500 text-slate-300 hover:text-slate-50 px-8 py-4 text-lg font-semibold"
                >
                  View Demo
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>AHPRA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-emerald-500" />
                  <span>Mobile Ready</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                  <div>
                    <h3 className="text-lg font-bold">Welcome back, Sarah</h3>
                    <p className="text-slate-400 text-sm">Your NP journey progress</p>
                  </div>
                  <Badge className="bg-emerald-600 text-white">78% Complete</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">Practice Hours</span>
                        <Clock className="h-4 w-4 text-sky-500" />
                      </div>
                      <div className="text-xl font-bold">3,890</div>
                      <div className="text-xs text-slate-400">of 5,000 required</div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                        <div className="bg-sky-500 h-2 rounded-full" style={{width: "78%"}}></div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-900 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">CPD Points</span>
                        <GraduationCap className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="text-xl font-bold">45</div>
                      <div className="text-xs text-slate-400">this period</div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{width: "100%"}}></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center">
                    <Activity className="h-4 w-4 text-sky-500 mr-2" />
                    Next Steps
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-2 bg-slate-900 rounded">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Upload Academic Transcripts</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-slate-900 rounded">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm">Supervisor Verification</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-400">5,000+</div>
              <div className="text-slate-300 mt-2">Required Practice Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-400">3 Years</div>
              <div className="text-slate-300 mt-2">Advanced Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-400">2</div>
              <div className="text-slate-300 mt-2">Endorsement Pathways</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-400">95%</div>
              <div className="text-slate-300 mt-2">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Endorsement Management</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Everything you need to navigate the complex AHPRA/NMBA endorsement process with confidence and efficiency.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-sky-600 rounded-lg flex items-center justify-center mb-4">
                  <ChartLine className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
                <p className="text-slate-300">
                  Real-time dashboard showing your progress against AHPRA requirements with automated readiness assessments.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <FileUp className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Document Management</h3>
                <p className="text-slate-300">
                  Secure upload, storage, and organisation of all required documentation with version control and audit trails.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">CPD Logging</h3>
                <p className="text-slate-300">
                  Comprehensive continuing professional development tracking with automated categorisation and compliance checking.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Supervisor Integration</h3>
                <p className="text-slate-300">
                  Collaborative workspace for supervisors to verify hours and provide attestations directly within the platform.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <Download className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Export & Submission</h3>
                <p className="text-slate-300">
                  Generate AHPRA-ready submission packages with all required documentation formatted to specification.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Notifications</h3>
                <p className="text-slate-300">
                  Intelligent reminders for deadlines, missing requirements, and upcoming renewal obligations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pathways Section */}
      <section id="pathways" className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Endorsement Pathways</h2>
            <p className="text-xl text-slate-300">
              Tailored guidance for every journey to Nurse Practitioner endorsement
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <h3 className="text-2xl font-bold">Pathway A - NMBA-Approved Program</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-emerald-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Complete NMBA-approved Master's program</div>
                      <div className="text-slate-400 text-sm">Leading to nurse practitioner endorsement</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-emerald-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">5,000 hours advanced clinical practice</div>
                      <div className="text-slate-400 text-sm">Within the past 6 years</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-emerald-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Statement of service documentation</div>
                      <div className="text-slate-400 text-sm">From each employer during practice period</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">B</span>
                  </div>
                  <h3 className="text-2xl font-bold">Pathway B - Equivalent Program</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-emerald-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Substantially equivalent program</div>
                      <div className="text-slate-400 text-sm">As determined by NMBA assessment</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-emerald-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">International qualifications</div>
                      <div className="text-slate-400 text-sm">Primarily for overseas-trained nurses</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-emerald-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Additional documentation</div>
                      <div className="text-slate-400 text-sm">Certificate of good standing and translations</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-300">
              Invest in your professional future with flexible subscription options
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Candidate</h3>
                  <p className="text-slate-400 mb-4">For aspiring nurse practitioners</p>
                  <div className="text-4xl font-bold">$19</div>
                  <div className="text-slate-400">/month</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Progress tracking dashboard",
                    "CPD logging and management",
                    "Practice hours tracking",
                    "Document storage (5GB)",
                    "Email support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-slate-700 hover:bg-slate-600"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-2 border-sky-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-sky-500 text-white">Most Popular</Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Professional</h3>
                  <p className="text-slate-400 mb-4">For serious candidates</p>
                  <div className="text-4xl font-bold">$39</div>
                  <div className="text-slate-400">/month</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Candidate",
                    "Supervisor collaboration tools",
                    "AHPRA-ready export packages",
                    "Document storage (25GB)",
                    "Priority support",
                    "Smart notifications"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-sky-600 hover:bg-sky-500"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Choose Professional
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <p className="text-slate-400 mb-4">For healthcare organisations</p>
                  <div className="text-4xl font-bold">$99</div>
                  <div className="text-slate-400">/month</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Professional",
                    "Multi-user management",
                    "Custom reporting",
                    "Unlimited storage",
                    "Dedicated support",
                    "SSO integration"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-slate-700 hover:bg-slate-600"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sky-600 to-sky-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Streamline Your NP Journey?
          </h2>
          <p className="text-xl text-sky-100 mb-8">
            Join hundreds of Australian nurses who are taking control of their endorsement process with EndorseMe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-sky-600 hover:bg-sky-50 px-8 py-4 text-lg font-semibold"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-sky-600 px-8 py-4 text-lg font-semibold"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-sky-200 text-sm mt-4">
            14-day free trial • No credit card required • AHPRA compliant
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <UserRound className="text-sky-500 h-8 w-8" />
                <span className="text-xl font-bold text-slate-50">EndorseMe</span>
              </div>
              <p className="text-slate-400">
                Streamlining the Australian Nurse Practitioner endorsement journey with intelligent tracking and management tools.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-50 mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-slate-300">Features</a></li>
                <li><a href="#pricing" className="hover:text-slate-300">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-300">Security</a></li>
                <li><a href="#" className="hover:text-slate-300">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-50 mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-slate-300">AHPRA Guidelines</a></li>
                <li><a href="#" className="hover:text-slate-300">Help Centre</a></li>
                <li><a href="#" className="hover:text-slate-300">Blog</a></li>
                <li><a href="#" className="hover:text-slate-300">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-50 mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-slate-300">About</a></li>
                <li><a href="#" className="hover:text-slate-300">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-300">Terms</a></li>
                <li><a href="#" className="hover:text-slate-300">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400">
              © 2025 EndorseMe.com.au. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
