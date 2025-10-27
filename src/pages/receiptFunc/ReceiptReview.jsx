import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Textarea,
  Badge,
  IconButton,
  useToast,
  Divider,
  Flex,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { FiTrash2, FiCheck, FiAlertCircle } from 'react-icons/fi';

const ReceiptReview = ({ items, onSave, onCancel }) => {
  const [editedItems, setEditedItems] = useState(items);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const categories = [
    'Fruit',
    'Vegetable',
    'Dairy',
    'Meat',
    'Grain',
    'Beverage',
    'Snack',
    'Condiment',
    'Other',
  ];

  const handleItemChange = (index, field, value) => {
    const updated = [...editedItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditedItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = editedItems.filter((_, i) => i !== index);
    setEditedItems(updated);
    toast({
      title: 'Item removed',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSaveAll = async () => {
    if (editedItems.length === 0) {
      toast({
        title: 'No items to save',
        description: 'Please add at least one item',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate items
    const invalidItems = editedItems.filter(
      (item) => !item.name || !item.category || !item.expiration
    );

    if (invalidItems.length > 0) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in name, category, and expiration date for all items',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      // Prepare items for API (remove confidence and needsReview fields)
      const itemsToSave = editedItems.map(({ confidence, needsReview, ...item }) => ({
        ...item,
        quantity: parseInt(item.quantity) || 1,
      }));

      await onSave(itemsToSave);

      toast({
        title: 'Items saved successfully!',
        description: `${itemsToSave.length} items added to your inventory`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Failed to save items',
        description: error.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const itemsNeedingReview = editedItems.filter((item) => item.needsReview).length;

  return (
    <Box maxW="1000px" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Review Items
          </Heading>
          <Text color="gray.600">
            Review and edit the extracted items before saving to your inventory
          </Text>
        </Box>

        {/* Alert for items needing review */}
        {itemsNeedingReview > 0 && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              {itemsNeedingReview} {itemsNeedingReview === 1 ? 'item needs' : 'items need'}{' '}
              your attention (marked with a yellow badge)
            </AlertDescription>
          </Alert>
        )}

        {/* Items List */}
        <VStack spacing={4} align="stretch">
          {editedItems.map((item, index) => (
            <Box
              key={index}
              p={4}
              border="1px solid"
              borderColor={item.needsReview ? 'yellow.300' : 'gray.200'}
              borderRadius="lg"
              bg={item.needsReview ? 'yellow.50' : 'white'}
              position="relative"
            >
              {/* Item Header */}
              <Flex justify="space-between" align="start" mb={3}>
                <HStack spacing={2}>
                  <Text fontWeight="bold" fontSize="lg">
                    Item {index + 1}
                  </Text>
                  {item.needsReview && (
                    <Badge colorScheme="yellow" display="flex" alignItems="center" gap={1}>
                      <FiAlertCircle size={12} />
                      Needs Review
                    </Badge>
                  )}
                  {item.confidence && (
                    <Badge colorScheme={item.confidence > 0.8 ? 'green' : 'orange'}>
                      {Math.round(item.confidence * 100)}% confident
                    </Badge>
                  )}
                </HStack>
                <IconButton
                  icon={<FiTrash2 />}
                  colorScheme="red"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  aria-label="Remove item"
                />
              </Flex>

              {/* Item Fields */}
              <VStack spacing={3} align="stretch">
                <HStack spacing={3}>
                  <Box flex={2}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      Name *
                    </Text>
                    <Input
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="Item name"
                      isInvalid={!item.name}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      Quantity *
                    </Text>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      min={1}
                      isInvalid={!item.quantity || item.quantity < 1}
                    />
                  </Box>
                </HStack>

                <HStack spacing={3}>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      Category *
                    </Text>
                    <Select
                      value={item.category}
                      onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                      isInvalid={!item.category}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Select>
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      Expiration Date *
                    </Text>
                    <Input
                      type="date"
                      value={item.expiration}
                      onChange={(e) => handleItemChange(index, 'expiration', e.target.value)}
                      isInvalid={!item.expiration}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      Refrigeration
                    </Text>
                    <Select
                      value={item.refrigeration || ''}
                      onChange={(e) => handleItemChange(index, 'refrigeration', e.target.value || null)}
                    >
                      <option value="">Unknown</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Select>
                  </Box>
                </HStack>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Notes
                  </Text>
                  <Textarea
                    value={item.notes || ''}
                    onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                    placeholder="Additional notes (brand, size, etc.)"
                    rows={2}
                  />
                </Box>
              </VStack>
            </Box>
          ))}
        </VStack>

        {editedItems.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">No items to review</Text>
          </Box>
        )}

        <Divider />

        {/* Action Buttons */}
        <HStack spacing={3} justify="flex-end">
          <Button variant="outline" size="lg" onClick={onCancel} isDisabled={isSaving}>
            Cancel
          </Button>
          <Button
            leftIcon={<FiCheck />}
            colorScheme="blue"
            size="lg"
            onClick={handleSaveAll}
            isLoading={isSaving}
            loadingText="Saving..."
            isDisabled={editedItems.length === 0}
          >
            Save All Items ({editedItems.length})
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ReceiptReview;