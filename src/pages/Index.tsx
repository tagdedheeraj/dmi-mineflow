
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();

  // Add an effect to remove any dynamically added Lovable scripts
  useEffect(() => {
    // Find and remove any dynamically added script tags related to Lovable
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.src.includes('lovable') || script.src.includes('gpteng') || script.src.includes('gptengineer') || script.src.includes('edit-with-lovable')) {
        script.parentNode?.removeChild(script);
      }
    });

    // Remove any Lovable-related elements from the DOM
    const elements = document.querySelectorAll('div, button, a');
    elements.forEach(element => {
      if (element.id?.includes('lovable') || 
          element.className?.includes('lovable') || 
          element.innerHTML?.includes('lovable') ||
          element.id?.includes('gpteng') || 
          element.className?.includes('gpteng') || 
          element.innerHTML?.includes('gpteng') ||
          element.id?.includes('edit-with') || 
          element.className?.includes('edit-with') || 
          element.innerHTML?.includes('edit-with')) {
        element.parentNode?.removeChild(element);
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
        <img 
          src="/lovable-uploads/0dad5230-9381-4a8d-a415-7ba365276bdd.png" 
          alt="DMI Logo" 
          className="w-24 h-24 mx-auto mb-6"
        />
        
        <h1 className="text-3xl font-bold mb-2">Welcome to DMI</h1>
        <p className="text-gray-600 mb-8">The premier cryptocurrency mining platform</p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/signin')} 
            className="w-full bg-dmi hover:bg-dmi/90"
          >
            Sign In
          </Button>
          
          <Button 
            onClick={() => navigate('/signup')} 
            variant="outline" 
            className="w-full"
          >
            Create Account
          </Button>
          
          <div className="pt-4 border-t border-gray-200">
            <Button 
              onClick={() => navigate('/download')}
              variant="outline"
              className="w-full text-dmi border-dmi hover:bg-dmi/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Download DMI App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
