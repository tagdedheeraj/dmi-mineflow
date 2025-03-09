import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import AppUpdateNotification from '@/components/AppUpdateNotification';
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
  ExternalLink,
  IdCard,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  setupPinAuth, 
  enableBiometric, 
  getAuthPreferences 
} from '@/lib/secureStorage';
import { useToast } from '@/hooks/use-toast';
import { updateAppSettings } from '@/lib/firestore';
import { useAppVersionCheck } from '@/hooks/useAppVersionCheck';

const Profile: React.FC = () => {
  const { user, signOut, isAdmin, appSettings } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState<string>("");
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [newVersion, setNewVersion] = useState<string>("");
  const [newUpdateUrl, setNewUpdateUrl] = useState<string>("");
  const [isEditingAppSettings, setIsEditingAppSettings] = useState(false);
  const { toast } = useToast();
  const { needsUpdate, updateUrl, isUpdated, markAsUpdated } = useAppVersionCheck();

  useEffect(() => {
    const prefs = getAuthPreferences();
    setBiometricEnabled(!!prefs.biometricEnabled);
  }, []);

  useEffect(() => {
    if (appSettings) {
      setNewVersion(appSettings.version);
      setNewUpdateUrl(appSettings.updateUrl);
    }
  }, [appSettings]);

  if (!user) {
    navigate('/signin');
    return null;
  }

  const handlePinSetup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^\d{4}$/.test(pin)) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN.",
        variant: "destructive"
      });
      return;
    }
    
    setupPinAuth(pin);
    
    toast({
      title: "PIN Set Successfully",
      description: "Your PIN has been configured. You will need to enter it when opening the app.",
    });
    
    setPin("");
  };

  const handleBiometricToggle = (enabled: boolean) => {
    if (enabled && !window.PublicKeyCredential) {
      toast({
        title: "Not Supported",
        description: "Biometric authentication is not supported on this device.",
        variant: "destructive"
      });
      setBiometricEnabled(false);
      return;
    }
    
    enableBiometric(enabled);
    setBiometricEnabled(enabled);
    
    toast({
      title: enabled ? "Biometric Enabled" : "Biometric Disabled",
      description: enabled 
        ? "You can now use biometric authentication to access the app." 
        : "Biometric authentication has been disabled.",
    });
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:dmi@dminetwork.us";
  };

  const handleUpdate = () => {
    window.open(updateUrl || appSettings.updateUrl, '_blank');
    markAsUpdated();
  };

  const handleSaveAppSettings = async () => {
    if (isAdmin) {
      const success = await updateAppSettings(newVersion, newUpdateUrl);
      if (success) {
        toast({
          title: "Settings Updated",
          description: "App version and update URL have been updated successfully.",
        });
        setIsEditingAppSettings(false);
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update app settings.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header />
      
      <ChangePasswordModal 
        open={changePasswordModalOpen}
        onOpenChange={setChangePasswordModalOpen}
      />
      
      <main className="pt-24 px-4 max-w-screen-md mx-auto">
        <Button 
          variant="ghost"
          className="mb-6 flex items-center text-gray-600"
          onClick={() => navigate('/mining')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Mining
        </Button>
        
        {(needsUpdate || isUpdated) && <AppUpdateNotification />}
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="kyc">KYC</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
          
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
                
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-600">
                      <Download className="h-4 w-4 mr-2" />
                      <span className="text-sm">App Version</span>
                    </div>
                    {isAdmin && !isEditingAppSettings && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsEditingAppSettings(true)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {isAdmin && isEditingAppSettings ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="app-version">App Version</Label>
                        <Input
                          id="app-version"
                          value={newVersion}
                          onChange={(e) => setNewVersion(e.target.value)}
                          placeholder="1.0.0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="update-url">Update URL</Label>
                        <Input
                          id="update-url"
                          value={newUpdateUrl}
                          onChange={(e) => setNewUpdateUrl(e.target.value)}
                          placeholder="https://dminetwork.us"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveAppSettings}>
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditingAppSettings(false);
                            setNewVersion(appSettings.version);
                            setNewUpdateUrl(appSettings.updateUrl);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-900 font-medium mb-2">
                        {appSettings.version}
                        {needsUpdate && (
                          <span className="ml-2 text-amber-500 text-xs font-normal">
                            (Update Required)
                          </span>
                        )}
                        {isUpdated && (
                          <span className="ml-2 text-green-500 text-xs font-normal">
                            (Updated)
                          </span>
                        )}
                      </p>
                      <Button 
                        className={`w-full ${needsUpdate ? 'bg-amber-500 hover:bg-amber-600' : 
                                              isUpdated ? 'bg-green-500 hover:bg-green-600' : ''}`}
                        onClick={handleUpdate}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {needsUpdate ? 'Update Required' : isUpdated ? 'Updated' : 'Update Now'}
                      </Button>
                    </>
                  )}
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
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setChangePasswordModalOpen(true)}
                  >
                    <Lock className="mr-2 h-4 w-4" />
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
          
          <TabsContent value="security">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 mr-2 text-dmi" />
                  <h2 className="text-xl font-semibold">Security Settings</h2>
                </div>
                <p className="text-gray-600">Manage your security preferences and account protection.</p>
              </div>
              
              <div className="border-t border-gray-100 pt-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 mr-3 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-600">Change your account password</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setChangePasswordModalOpen(true)}
                  className="w-full"
                >
                  Change Password
                </Button>
              </div>
              
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
                    onCheckedChange={handleBiometricToggle}
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
          
          <TabsContent value="kyc">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <IdCard className="h-5 w-5 mr-2 text-dmi" />
                  <h2 className="text-xl font-semibold">KYC Verification</h2>
                </div>
                <p className="text-gray-600">Complete identity verification to access additional features.</p>
              </div>
              
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-lg">
                <div className="bg-blue-50 rounded-full p-3 mb-4">
                  <IdCard className="h-8 w-8 text-dmi" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Not Available</h3>
                <p className="text-gray-600 max-w-md">
                  Thanks for your interest in DMI KYC verification. Slots are not available at this time. 
                  Stay tuned! You will receive an invitation as soon as one becomes available.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="support">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <HelpCircle className="h-5 w-5 mr-2 text-dmi" />
                  <h2 className="text-xl font-semibold">Help & Support</h2>
                </div>
                <p className="text-gray-600">Get assistance and learn more about DMI Network.</p>
              </div>
              
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
                    href="https://dminetwork.us" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">White Paper</span>
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  </a>
                  
                  <a 
                    href="https://dminetwork.us" 
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
