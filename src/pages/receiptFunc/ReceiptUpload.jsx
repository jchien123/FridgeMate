import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  Image,
  Text,
  useToast,
  Spinner,
  Icon,
  Center,
  Progress,
} from '@chakra-ui/react';
import { FiUpload, FiCamera } from 'react-icons/fi';
import { useAuth } from '@clerk/clerk-react';
import heic2any from 'heic2any';

const ReceiptUpload = ({ onItemsExtracted }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const convertHeicToJpeg = async (file) => {
    try {
      // Check if it's HEIC
      const isHeic = file.type === 'image/heic' || 
                     file.type === 'image/heif' || 
                     file.name.toLowerCase().endsWith('.heic') ||
                     file.name.toLowerCase().endsWith('.heif');
      
      if (!isHeic) {
        return file; // Not HEIC, return as-is
      }
  
      console.log('Converting HEIC to JPEG...');
      
      // Convert HEIC to JPEG
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      });
  
      // Create a new File object from the Blob
      const convertedFile = new File(
        [convertedBlob], 
        file.name.replace(/\.heic$/i, '.jpg'),
        { type: 'image/jpeg' }
      );
  
      console.log('HEIC converted successfully');
      return convertedFile;
      
    } catch (error) {
      console.error('Error converting HEIC:', error);
      throw new Error('Failed to convert HEIC image. Please try a different format.');
    }
  };
  
  // Update your handleFileSelect function
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && 
          !file.name.toLowerCase().endsWith('.heic') &&
          !file.name.toLowerCase().endsWith('.heif')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
  
      try {
        // Convert HEIC if needed
        const processedFile = await convertHeicToJpeg(file);
        
        // Validate file size AFTER conversion
        if (processedFile.size > 10 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: 'Please select an image smaller than 10MB',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }
  
        setSelectedFile(processedFile);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(processedFile);
        
      } catch (error) {
        toast({
          title: 'Error processing image',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a receipt image first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {

      const token = await getToken({ template: 'Test' });

      if (!token) {
        throw new Error('Please make sure you are signed in!');
      }


      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate progress (
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch('http://localhost:8080/api/receipts/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process receipt');
      }

      toast({
        title: 'Receipt processed!',
        description: `Found ${data.items.length} items`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Pass extracted items to parent component
      onItemsExtracted(data.items);

      // Reset
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to process receipt. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={6}>
      <VStack spacing={6}>
        <Text fontSize="2xl" fontWeight="bold">
          AI Receipt Upload 
        </Text>
        <Text color="gray.600" textAlign="center">
          Take a photo or upload an image of your grocery receipt
        </Text>

        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Upload Area */}
        {!previewUrl ? (
          <Center
            w="100%"
            h="300px"
            border="2px dashed"
            borderColor="gray.300"
            borderRadius="lg"
            cursor="pointer"
            onClick={() => fileInputRef.current?.click()}
            _hover={{ borderColor: 'blue.400', bg: 'gray.50' }}
            transition="all 0.2s"
          >
            <VStack spacing={4}>
              <Icon as={FiCamera} boxSize={12} color="gray.400" />
              <Text color="gray.500" fontWeight="medium">
                Click to select receipt image
              </Text>
              <Text fontSize="sm" color="gray.400">
                JPEG, PNG (max 10MB)
              </Text>
            </VStack>
          </Center>
        ) : (
          <Box w="100%" position="relative">
            <Image
              src={previewUrl}
              alt="Receipt preview"
              maxH="400px"
              mx="auto"
              borderRadius="lg"
              objectFit="contain"
            />
            {isProcessing && (
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="blackAlpha.700"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <VStack spacing={4}>
                  <Spinner size="xl" color="white" thickness="4px" />
                  <Text color="white" fontWeight="medium">
                    Processing receipt...
                  </Text>
                </VStack>
              </Box>
            )}
          </Box>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <Box w="100%">
            <Progress value={uploadProgress} colorScheme="blue" size="sm" borderRadius="full" />
          </Box>
        )}

        {/* Action Buttons */}
        <VStack spacing={3} w="100%">
          {previewUrl && !isProcessing && (
            <>
              <Button
                leftIcon={<FiUpload />}
                colorScheme="blue"
                size="lg"
                w="100%"
                onClick={handleUpload}
              >
                Process Receipt
              </Button>
              <Button
                variant="outline"
                size="lg"
                w="100%"
                onClick={handleReset}
              >
                Choose Different Image
              </Button>
            </>
          )}
        </VStack>

        {/* Instructions */}
        <Box w="100%" p={4} bg="blue.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Tips for best results:
          </Text>
          <VStack align="start" spacing={1} fontSize="sm" color="gray.700">
            <Text>• Ensure the receipt is well-lit and in focus</Text>
            <Text>• Capture the entire receipt in the frame</Text>
            <Text>• Avoid shadows and glare</Text>
            <Text>• Hold your camera steady</Text>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
            NOTE: Pictures are not saved by this application but may be used by Google Gemini. 
          </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};


export default ReceiptUpload;