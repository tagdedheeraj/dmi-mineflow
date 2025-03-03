
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  User, 
  Clock, 
  Settings, 
  Shield, 
  Lock, 
  Fingerprint, 
  HelpCircle, 
  Mail, 
  FileText,
  ExternalLink
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState<string>("");
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);

  if (!user) {
    navigate('/signin');
    return null;
  }

  const handlePinSetup = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would implement actual PIN setup logic
    alert("PIN set successfully!");
    setPin("");
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:dmi@dminetwork.us";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        <Button 
          variant="ghost"
          className="mb-6 flex items-center text-gray-600"
          onClick={() => navigate('/mining')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Mining
        </Button>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab Content */}
          <TabsContent value="profile">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-dmi-light/10 border-b border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-dmi/10 flex items-center justify-center mr-4">
                    <User className="h-8 w-8 text-dmi" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">Account created</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Settings className="h-4 w-4 mr-2" />
                      <span className="text-sm">Account status</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      Active
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">DMI Balance</h2>
                  <div className="bg-dmi/10 rounded-lg p-6 text-center">
                    <p className="text-3xl font-bold text-gray-900">{user.balance} DMI</p>
                    <p className="text-gray-600 mt-1">Current balance</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button className="w-full" variant="outline">
                    Update Profile
                  </Button>
                  <Button className="w-full" variant="outline">
                    Change Password
                  </Button>
                  <Button 
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-100"
                    onClick={signOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Security Tab Content */}
          <TabsContent value="security">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 mr-2 text-dmi" />
                  <h2 className="text-xl font-semibold">Security Settings</h2>
                </div>
                <p className="text-gray-600">Manage your security preferences and account protection.</p>
              </div>
              
              {/* PIN Setup */}
              <div className="border-t border-gray-100 pt-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 mr-3 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">PIN Setup</h3>
                      <p className="text-sm text-gray-600">Add a 4-digit PIN for additional security</p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handlePinSetup} className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pin">Enter 4-digit PIN</Label>
                      <Input
                        id="pin"
                        type="password"
                        maxLength={4}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        className="text-center"
                        required
                      />
                    </div>
                    <Button type="submit">Set PIN</Button>
                  </div>
                </form>
              </div>
              
              {/* Biometric */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Fingerprint className="h-5 w-5 mr-3 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Biometric Authentication</h3>
                      <p className="text-sm text-gray-600">Use fingerprint or face recognition to access your account</p>
                    </div>
                  </div>
                  <Switch
                    checked={biometricEnabled}
                    onCheckedChange={setBiometricEnabled}
                  />
                </div>
                
                {biometricEnabled && (
                  <p className="text-sm text-green-600 mt-2 ml-8">Biometric authentication is enabled</p>
                )}
                {!biometricEnabled && (
                  <p className="text-sm text-gray-500 mt-2 ml-8">Biometric authentication is disabled</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Support Tab Content */}
          <TabsContent value="support">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <HelpCircle className="h-5 w-5 mr-2 text-dmi" />
                  <h2 className="text-xl font-semibold">Help & Support</h2>
                </div>
                <p className="text-gray-600">Get assistance and learn more about DMI Network.</p>
              </div>
              
              {/* Contact Support */}
              <div className="border-t border-gray-100 pt-6 mb-6">
                <div className="flex items-center mb-4">
                  <Mail className="h-5 w-5 mr-3 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Contact Support</h3>
                    <p className="text-sm text-gray-600">Reach our support team via email</p>
                  </div>
                </div>
                <Button onClick={handleContactSupport} className="w-full">
                  Email Support
                </Button>
              </div>
              
              {/* Documentation & Resources */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 mr-3 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Documentation & Resources</h3>
                    <p className="text-sm text-gray-600">Learn more about DMI Network</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <a 
                    href="https://dminetwork.us/white-paper" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">White Paper</span>
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  </a>
                  
                  <a 
                    href="https://dminetwork.us/faqs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">FAQs</span>
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
