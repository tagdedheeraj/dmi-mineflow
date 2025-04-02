
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User } from 'lucide-react';

interface PersonalInfoSectionProps {
  fullName: string;
  setFullName: (value: string) => void;
  documentType: 'government_id' | 'passport';
  setDocumentType: (value: 'government_id' | 'passport') => void;
  idNumber: string;
  setIdNumber: (value: string) => void;
  documentExpiryDate: string;
  setDocumentExpiryDate: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  fullName,
  setFullName,
  documentType,
  setDocumentType,
  idNumber,
  setIdNumber,
  documentExpiryDate,
  setDocumentExpiryDate,
  address,
  setAddress
}) => {
  return (
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
  );
};

export default PersonalInfoSection;
