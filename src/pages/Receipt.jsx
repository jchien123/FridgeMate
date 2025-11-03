import React, { useState } from 'react';
import {
  Box,
  Container,
  useToast,
} from '@chakra-ui/react';
import ReceiptUpload from './receiptFunc/ReceiptUpload';
import ReceiptReview from './receiptFunc/ReceiptReview';

// Debug logging flag - set to false for production
const DEBUG_MODE = true;

const debugLog = (action, data) => {
  if (DEBUG_MODE) {
    console.log(`🔍 [${new Date().toISOString()}] ${action}:`, data);
  }
};

const ReceiptPage = () => {
  const [extractedItems, setExtractedItems] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload' or 'review'
  const toast = useToast();

  const handleItemsExtracted = (items) => {
    setExtractedItems(items);
    setCurrentStep('review');
  };

  const handleSaveItems = async (items) => {
    try {

      // Get auth token 
      const token = await window.Clerk.session.getToken({ template: 'Test' });
      
      // Prepare items for bulk upload
      const bulkUploadData = {
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          category: item.category,
          refrigeration: item.refrigeration,
          expiration: item.expiration, // Already in YYYY-MM-DD format
          notes: item.notes,
        }))
      };

      debugLog('Sending bulk upload request', bulkUploadData);

      // Call bulk upload endpoint
      const response = await fetch('https://monetary-narwhal-fridgemate-b19bb297.koyeb.app/api/food/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bulkUploadData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save items');
      }

      const result = await response.json();
      
      console.log('Bulk upload result:', result);

      // Reset to upload step
      setCurrentStep('upload');
      setExtractedItems(null);

      // You might want to redirect to the inventory page or refresh the list
      // navigate('/inventory'); // if using react-router

    } catch (error) {
      console.error('Error saving items:', error);
      throw error; // Re-throw to be handled by ReceiptReview component
    }
  };

  const handleCancel = () => {
    setCurrentStep('upload');
    setExtractedItems(null);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        {currentStep === 'upload' ? (
          <ReceiptUpload onItemsExtracted={handleItemsExtracted} />
        ) : (
          <ReceiptReview
            items={extractedItems}
            onSave={handleSaveItems}
            onCancel={handleCancel}
          />
        )}
      </Box>
    </Container>
  );
};

export default ReceiptPage;