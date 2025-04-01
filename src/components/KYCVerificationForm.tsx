
import React, { useState, useRef } from 'react';
import { useKYC } from '@/hooks/useKYC';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Shield, 
  Upload, 
  Camera, 
  X, 
  CheckCircle, 
  Clock,
  User,
  Calendar,
  FileText,
  MapPin
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const KYCVerificationForm: React.FC = () => {
  const { isLoading, kycStatus, submitKYC } = useKYC();
  
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [documentType, setDocumentType] = useState<'government_id' | 'passport'>('government_id');
  const [documentExpiryDate, setDocumentExpiryDate] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null);
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null);
  const [selfieImagePreview, setSelfieImagePreview] = useState<string | null>(null);
  
  const frontImageRef = useRef<HTMLInputElement>(null);
  const backImageRef = useRef<HTMLInputElement>(null);
  const selfieImageRef = useRef<HTMLInputElement>(null);
  
  // Handle image selection
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Clear an image
  const clearImage = (
    setImage: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    setImage(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!fullName || !idNumber || !address || !documentExpiryDate || !frontImage || !backImage || !selfieImage) {
      alert('Please fill all fields and upload all required images');
      return;
    }
    
    // Upload images to Firebase Storage in a real implementation
    // For now, we'll simulate by using the image previews as URLs
    
    await submitKYC({
      fullName,
      idNumber,
      address,
      documentType,
      documentExpiryDate,
      frontImageUrl: frontImagePreview || '',
      backImageUrl: backImagePreview || '',
      selfieImageUrl: selfieImagePreview || '',
    });
  };
  
  // Render based on KYC status
  if (kycStatus) {
    if (kycStatus.status === 'pending') {
      return (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              KYC Verification Pending
            </CardTitle>
            <CardDescription>
              Your KYC verification is being reviewed by our team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-yellow-50 border-yellow-200">
              <Clock className="h-4 w-4 text-yellow-500" />
              <AlertTitle>Verification In Progress</AlertTitle>
              <AlertDescription>
                Your KYC verification request has been submitted and is currently under review. 
                This process typically takes 1-2 business days. We'll notify you once the verification is complete.
              </AlertDescription>
            </Alert>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Personal Information</h4>
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <div>
                    <Label className="text-xs text-gray-500">Full Name</Label>
                    <div className="font-medium">{kycStatus.fullName}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Document Type</Label>
                    <div className="font-medium">
                      {kycStatus.documentType === 'government_id' ? 'Government ID' : 'Passport'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Document Number</Label>
                    <div className="font-medium">{kycStatus.idNumber}</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Submission Date</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="font-medium">
                    {kycStatus.submittedAt && kycStatus.submittedAt.toDate
                      ? kycStatus.submittedAt.toDate().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Processing'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (kycStatus.status === 'approved') {
      return (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              KYC Verification Approved
            </CardTitle>
            <CardDescription>
              Your identity has been successfully verified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Verification Successful</AlertTitle>
              <AlertDescription>
                Your KYC verification has been approved. You now have full access to all features of the platform.
              </AlertDescription>
            </Alert>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Verified Information</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="font-medium">{kycStatus.fullName}</div>
                <div className="text-sm text-gray-500">Verified on {
                  kycStatus.reviewedAt && kycStatus.reviewedAt.toDate
                    ? kycStatus.reviewedAt.toDate().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'
                }</div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (kycStatus.status === 'rejected') {
      return (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <X className="h-5 w-5" />
              KYC Verification Rejected
            </CardTitle>
            <CardDescription>
              Your verification was not approved. Please review the details below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-red-50 border-red-200">
              <X className="h-4 w-4 text-red-500" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>
                {kycStatus.rejectionReason || 'Your KYC verification was not approved. Please submit a new verification request with the correct information.'}
              </AlertDescription>
            </Alert>
            
            <div className="mt-8">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full md:w-auto"
              >
                Submit New Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
  }
  
  // KYC form for new submissions
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          KYC Verification
        </CardTitle>
        <CardDescription>
          Complete the form below to verify your identity. This is required to access all features.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name (as on ID)</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full legal name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label>Document Type</Label>
                <RadioGroup
                  value={documentType}
                  onValueChange={(value) => setDocumentType(value as 'government_id' | 'passport')}
                  className="flex space-x-4 mt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="government_id" id="government_id" />
                    <Label htmlFor="government_id" className="cursor-pointer">Government ID</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="passport" id="passport" />
                    <Label htmlFor="passport" className="cursor-pointer">Passport</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="idNumber">ID/Passport Number</Label>
                <Input
                  id="idNumber"
                  placeholder="Enter your ID or passport number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="expiryDate">Document Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={documentExpiryDate}
                  onChange={(e) => setDocumentExpiryDate(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your current residential address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Upload
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frontImage">Front of ID/Passport</Label>
                <div className="mt-1">
                  {!frontImagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                      <input
                        ref={frontImageRef}
                        id="frontImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, setFrontImage, setFrontImagePreview)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-32 flex flex-col items-center justify-center"
                        onClick={() => frontImageRef.current?.click()}
                      >
                        <Upload className="h-6 w-6 mb-2" />
                        <span>Upload Front Image</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={frontImagePreview}
                        alt="Front ID"
                        className="w-full h-32 object-contain border rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => clearImage(setFrontImage, setFrontImagePreview, frontImageRef)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="backImage">Back of ID/Passport</Label>
                <div className="mt-1">
                  {!backImagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                      <input
                        ref={backImageRef}
                        id="backImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, setBackImage, setBackImagePreview)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-32 flex flex-col items-center justify-center"
                        onClick={() => backImageRef.current?.click()}
                      >
                        <Upload className="h-6 w-6 mb-2" />
                        <span>Upload Back Image</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={backImagePreview}
                        alt="Back ID"
                        className="w-full h-32 object-contain border rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => clearImage(setBackImage, setBackImagePreview, backImageRef)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="selfieImage">Selfie with ID</Label>
              <p className="text-sm text-gray-500 mb-2">
                Please take a photo of yourself holding your ID/Passport
              </p>
              <div className="mt-1">
                {!selfieImagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                    <input
                      ref={selfieImageRef}
                      id="selfieImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, setSelfieImage, setSelfieImagePreview)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-32 flex flex-col items-center justify-center"
                      onClick={() => selfieImageRef.current?.click()}
                    >
                      <Camera className="h-6 w-6 mb-2" />
                      <span>Upload Selfie</span>
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={selfieImagePreview}
                      alt="Selfie with ID"
                      className="w-full h-48 object-contain border rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => clearImage(setSelfieImage, setSelfieImagePreview, selfieImageRef)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Privacy Notice</AlertTitle>
            <AlertDescription>
              Your personal information and documents will be securely stored and used solely for verification purposes. 
              We comply with all applicable data protection regulations.
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Submit Verification'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default KYCVerificationForm;
