
import React, { useState, useRef } from 'react';
import { Shield, FileText, User, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ImageUpload from './ImageUpload';

interface KYCFormProps {
  isLoading: boolean;
  onSubmit: (formData: any) => Promise<boolean>;
}

const KYCForm: React.FC<KYCFormProps> = ({ isLoading, onSubmit }) => {
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
    
    // Submit the form data
    await onSubmit({
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
              <ImageUpload
                id="frontImage"
                label="Front of ID/Passport"
                image={frontImage}
                imagePreview={frontImagePreview}
                onImageChange={(e) => handleImageChange(e, setFrontImage, setFrontImagePreview)}
                onClearImage={() => clearImage(setFrontImage, setFrontImagePreview, frontImageRef)}
              />
              
              <ImageUpload
                id="backImage"
                label="Back of ID/Passport"
                image={backImage}
                imagePreview={backImagePreview}
                onImageChange={(e) => handleImageChange(e, setBackImage, setBackImagePreview)}
                onClearImage={() => clearImage(setBackImage, setBackImagePreview, backImageRef)}
              />
            </div>
            
            <ImageUpload
              id="selfieImage"
              label="Selfie with ID"
              description="Please take a photo of yourself holding your ID/Passport"
              image={selfieImage}
              imagePreview={selfieImagePreview}
              onImageChange={(e) => handleImageChange(e, setSelfieImage, setSelfieImagePreview)}
              onClearImage={() => clearImage(setSelfieImage, setSelfieImagePreview, selfieImageRef)}
            />
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

export default KYCForm;
