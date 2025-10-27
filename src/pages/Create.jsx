import { 
  Box, 
  FormControl, 
  Input, 
  FormHelperText, 
  FormLabel, 
  Select, 
  Checkbox, 
  Button, 
  NumberInput, 
  NumberInputField, 
  NumberInputStepper, 
  NumberIncrementStepper, 
  NumberDecrementStepper,
  Textarea,
  useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@clerk/clerk-react';

// Debug logging flag - set to false for production
const DEBUG_MODE = true;

const debugLog = (action, data) => {
  if (DEBUG_MODE) {
    console.log(`🔍 [${new Date().toISOString()}] ${action}:`, data);
  }
};

export default function Create() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    category: 'No Category',
    isRefrigerated: false,
    expiration: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    debugLog('Form field updated', { field, value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    debugLog('Create form submission started', formData);

    try {
      const createRequest = {
        name: formData.name,
        quantity: formData.quantity,
        category: formData.category === 'No Category' ? null : formData.category,
        isRefrigerated: Boolean(formData.isRefrigerated),
        expiration: formData.expiration || null,
        notes: formData.notes || null
      };

      const token = await getToken({ template: 'Test' });

      debugLog('Sending create request', createRequest);

      const response = await fetch('http://localhost:8080/api/food', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createRequest),
      });

      debugLog('Response status', response.status);
      debugLog('Response ok', response.ok);

      if (response.ok) {
        // Check if response has content before trying to parse JSON
        const contentType = response.headers.get('content-type');
        let newItem = null;
        
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text.trim()) {
            newItem = JSON.parse(text);
          }
        }
        
        debugLog('Create successful', newItem);
        
        toast({
          title: 'Food item created',
          description: `${formData.name} has been added to your inventory.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Navigate back to home page
        navigate('/');
      } else {
        // Handle error response
        let errorMessage = 'Failed to create food item';
        try {
          const errorText = await response.text();
          if (errorText.trim()) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          }
        } catch (parseError) {
          debugLog('Error parsing error response', parseError);
        }
        
        debugLog('Create failed - server error', { status: response.status, message: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error) {
      debugLog('Create failed - network error', { error: error.message });
      toast({
        title: 'Error',
        description: error.message || 'Failed to create food item. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh">
      <Box p={6}>
        <Box maxW="480px" mx="auto">
          <form onSubmit={handleSubmit}>
            <FormControl isRequired mb="40px">
              <FormLabel>Product Name:</FormLabel>
              <Input 
                type="text" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter name of the food"
                bg="white"
              />
              <FormHelperText>
                Enter Name of the Food
              </FormHelperText>
            </FormControl>

            <FormControl isRequired mb="40px">
              <FormLabel>Quantity</FormLabel>
              <NumberInput 
                value={formData.quantity}
                min={1}
                max={100} 
                step={1}
                precision={0}
                allowMouseWheel
                onChange={(valueString, valueNumber) => handleInputChange('quantity', valueNumber)}
              >
                <NumberInputField bg="white" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>Minimum value is 1</FormHelperText>
            </FormControl>

            <FormControl mb="40px">
              <FormLabel>Product Category:</FormLabel>
              <Select 
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                bg="white"
              > 
                <option value="No Category">No Category</option>
                <option value="Fruit">Fruit</option>
                <option value="Vegetable">Vegetable</option>
                <option value="Dairy">Dairy</option>
                <option value="Meat">Meat</option>
                <option value="Grain">Grain</option>
                {/* <option value="Other">Other</option> */}
              </Select>
              <FormHelperText>Defaults to "No Category" if not specified</FormHelperText>
            </FormControl>

            <FormControl display="flex" alignItems="center" mb="40px">
              <Checkbox
                isChecked={formData.isRefrigerated}
                onChange={(e) => handleInputChange('isRefrigerated', e.target.checked)}
                size="lg"
              />
              <FormLabel mb="0px" ml="10px">Refrigerated?</FormLabel>
            </FormControl>

            <FormControl mb="40px">
              <FormLabel>Expiration Date:</FormLabel>
              <Input 
                placeholder='Select Date' 
                size='md' 
                type='date'
                value={formData.expiration}
                onChange={(e) => handleInputChange('expiration', e.target.value)}
                bg="white"
              />
            </FormControl>

            <FormControl mb="40px">
              <FormLabel>Notes:</FormLabel>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Optional notes about this food item (brand, meal planning, etc.)"
                resize="vertical"
                minH="100px"
                bg="white"
              />
              <FormHelperText>
                Add any additional information about this food item
              </FormHelperText>
            </FormControl>

            <Button 
              type="submit" 
              colorScheme="purple" 
              size="lg" 
              width="full"
              isLoading={isLoading}
              loadingText="Adding Item..."
            >
              Add Item
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

export const createAction = async ({ request }) => {
  // This action is no longer needed since we're handling submission in the component
  // But keeping it for compatibility with existing router setup
  debugLog('Legacy createAction called - this should not happen with new implementation', {});
  return null;
};
