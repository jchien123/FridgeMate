import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { 
  Box, 
  Button, 
  Card, 
  CardBody, 
  CardFooter, 
  CardHeader, 
  Divider, 
  Flex, 
  Heading, 
  HStack, 
  SimpleGrid, 
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  useToast,
  Badge,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Textarea
} from '@chakra-ui/react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

// Debug logging flag - set to false for production
const DEBUG_MODE = true;

const debugLog = (action, data) => {
  if (DEBUG_MODE) {
    console.log(`🔍 [${new Date().toISOString()}] ${action}:`, data);
  }
};

export default function Dashboard() {
  const [items, setItems] = useState(useLoaderData());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const { getToken, isLoaded, isSignedIn } = useAuth();


  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [filterStorage, setFilterStorage] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    category: '',
    isRefrigerated: true,
    expiration: '',
    notes: ''
  });
  const toast = useToast();

  useEffect(() => {
    async function loadInitialItems() {
      if (!isLoaded || !isSignedIn) {
        return;
      }
      
      debugLog('Loading initial items with auth', {});
      setIsLoading(true);
      
      try {
        const token = await getToken({ template: 'Test' });
        debugLog('Token retrieved for initial load', { tokenExists: !!token });
        
        const res = await fetch('https://monetary-narwhal-fridgemate-b19bb297.koyeb.app/api/food', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!Array.isArray(data)) {
          debugLog('API returned non-array data', { data, type: typeof data });
          setItems([]);
        } else {
          debugLog('Initial items loaded successfully', { count: data.length });
          setItems(data);
        }
      } catch (error) {
        debugLog('Failed to load initial items', { error: error.message });
        // toast({
        //   title: 'Error',
        //   description: 'Failed to load items. Please refresh the page.',
        //   status: 'error',
        //   duration: 5000,
        //   isClosable: true,
        // });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadInitialItems();
  }, [isLoaded, isSignedIn, getToken, toast]);

  // Function to refresh items from API
  const refreshItems = async () => {
    debugLog('Refreshing items from API', {});
    try {

      const token = await getToken({ template: 'Test' });

      const res = await fetch('https://monetary-narwhal-fridgemate-b19bb297.koyeb.app/api/food', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        debugLog('API returned non-array data during refresh', { data, type: typeof data });
        setItems([]);
        return;
      }
      
      debugLog('Items refreshed successfully', { count: data.length });
      setItems(data);
    } catch (error) {
      debugLog('Failed to refresh items', { error: error.message });
      toast({
        title: 'Error',
        description: 'Failed to refresh items. Please refresh the page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditClick = (item) => {
    debugLog('Edit button clicked', { itemId: item.id, itemName: item.name });
    setSelectedItem(item);
    setFormData({
      name: item.name || '',
      quantity: item.quantity || 1,
      category: item.category || '',
      isRefrigerated: item.isRefrigerated || false,
      expiration: item.expiration || '',
      notes: item.notes || ''
    });
    onOpen();
  };

  const handleDeleteClick = (item) => {
    debugLog('Delete button clicked', { itemId: item.id, itemName: item.name });
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmDelete = async () => {
    debugLog('Delete confirmation started', { itemId: itemToDelete.id });
    try {

      const token = await getToken({ template: 'Test' });

      const response = await fetch(`https://monetary-narwhal-fridgemate-b19bb297.koyeb.app/api/food/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        debugLog('Delete successful', { itemId: itemToDelete.id });
        
        // Close the dialog first
        onDeleteClose();
        
        // Show success toast
        toast({
          title: 'Item deleted',
          description: 'Your food item has been deleted successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh items from API instead of page refresh
        await refreshItems();
        
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      debugLog('Delete failed', { error: error.message, itemId: itemToDelete.id });
      toast({
        title: 'Error',
        description: 'Failed to delete food item. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSave = async () => {
    debugLog('Save started', { itemId: selectedItem.id, formData });
    try {
      // Create update request object that matches your Spring Boot UpdateFoodRequest
      const updateRequest = {
        name: formData.name,
        quantity: formData.quantity,
        category: formData.category,
        isRefrigerated: formData.isRefrigerated,
        expiration: formData.expiration,
        notes: formData.notes
      };

      debugLog('Sending update request', updateRequest);

      const token = await getToken({ template: 'Test' });

      const response = await fetch(`https://monetary-narwhal-fridgemate-b19bb297.koyeb.app/api/food/${selectedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateRequest),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        debugLog('Update successful', updatedItem);
        
        // Close the modal first
        onClose();
        
        // Show success toast
        toast({
          title: 'Item updated',
          description: 'Your food item has been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh items from API instead of page refresh
        await refreshItems();
        
      } else {
        const errorData = await response.json();
        debugLog('Update failed - server error', errorData);
        throw new Error(errorData.error || 'Failed to update item');
      }
    } catch (error) {
      debugLog('Update failed - network error', { error: error.message });
      toast({
        title: 'Error',
        description: error.message || 'Failed to update food item. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getExpirationColor = (daysLeft, hasExpiration) => {
    if (!hasExpiration) return 'gray';
    if (daysLeft < 0) return 'red';
    if (daysLeft <= 3) return 'orange';
    if (daysLeft <= 7) return 'yellow';
    return 'green';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Dairy': '🐄',
      'Fruit': '🍌🍉🍎🍑🥝🫐',
      'Grain': '🌾',
      'Meat': '🥩',
      'Vegetable': '🥬🥒🥕🍅'
    };
    return icons[category] || '🍽️';
  };

  const getExpirationDisplay = (item) => {
    // Check if item exists first
    if (!item) {
      return { text: 'Invalid item', hasExpiration: false };
    }
    
    // Check if expiration date exists and is not empty
    if (!item.expiration || item.expiration.trim() === '') {
      return { text: 'No expiration set', hasExpiration: false };
    }
    
    // Check if daysLeft exists and is a valid number
    if (item.daysLeft === null || 
        item.daysLeft === undefined || 
        typeof item.daysLeft !== 'number' || 
        isNaN(item.daysLeft)) {
      return { text: 'Invalid expiration date', hasExpiration: false };
    }
    
    if (item.daysLeft < 0) {
      return { text: `Expired ${Math.abs(item.daysLeft)} days ago`, hasExpiration: true };
    } else if (item.daysLeft === 0) {
      return { text: 'Expires today', hasExpiration: true };
    } else {
      return { text: `${item.daysLeft} days left`, hasExpiration: true };
    }
  };

  // Filtering and sorting logic
  const filteredAndSortedItems = useMemo(() => {
    // Ensure items is always an array
    if (!items || !Array.isArray(items)) {
      debugLog('Items is not an array', { items, type: typeof items });
      return [];
    }

    let filtered = [...items]; // Create a copy to avoid mutating original

    // Apply storage filter with proper null handling
    if (filterStorage !== 'all') {
      const isRefrigerated = filterStorage === 'refrigerated';
      filtered = filtered.filter(item => {
        if (!item) return false;
        
        // Handle null/undefined isRefrigerated values
        const itemisRefrigerated = item.isRefrigerated === true || item.isRefrigerated === 'true';
        
        debugLog('Storage filter check', { 
          itemName: item.name,
          itemisRefrigerated: item.isRefrigerated,
          normalizedisRefrigerated: itemisRefrigerated,
          filteringFor: isRefrigerated,
          matches: itemisRefrigerated === isRefrigerated
        });
        
        return itemisRefrigerated === isRefrigerated;
      });
    }

    // Apply category filter with proper null handling
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => {
        if (!item) return false;
        
        // Normalize category values - treat null, undefined, and empty string as the same
        const itemCategory = item.category || '';
        const normalizedFilterCategory = filterCategory || '';
        
        debugLog('Category filter check', { 
          itemName: item.name,
          itemCategory: item.category,
          normalizedItemCategory: itemCategory,
          filterCategory: filterCategory,
          normalizedFilterCategory: normalizedFilterCategory,
          matches: itemCategory === normalizedFilterCategory
        });
        
        return itemCategory === normalizedFilterCategory;
      });
    }

    // Apply sorting with improved logic for missing expiration dates
    const sorted = [...filtered].sort((a, b) => {
      // Helper function to check if item has valid expiration
      const hasValidExpiration = (item) => {
        return item && 
               item.expiration && 
               item.expiration.trim() !== '' && 
               item.daysLeft !== null &&
               item.daysLeft !== undefined &&
               typeof item.daysLeft === 'number' && 
               !isNaN(item.daysLeft);
      };

      // Ensure both items exist
      if (!a || !b) return 0;
      if (!a && b) return 1;
      if (a && !b) return -1;

      const aHasExpiration = hasValidExpiration(a);
      const bHasExpiration = hasValidExpiration(b);

      if (sortBy === 'default') {
        // Priority order: items with valid expiration dates first, then items without
        if (aHasExpiration && !bHasExpiration) return -1;
        if (!aHasExpiration && bHasExpiration) return 1;
        
        // If both have expiration dates, sort by expiration logic
        if (aHasExpiration && bHasExpiration) {
          // Future items first (ascending by daysLeft), then expired items (descending by daysLeft)
          if (a.daysLeft >= 0 && b.daysLeft >= 0) {
            return a.daysLeft - b.daysLeft;
          } else if (a.daysLeft < 0 && b.daysLeft < 0) {
            return b.daysLeft - a.daysLeft; // Most recently expired first
          } else {
            return b.daysLeft - a.daysLeft; // Future items before expired
          }
        }
        
        // If neither has expiration, sort by name (with safety check)
        const aName = a.name || '';
        const bName = b.name || '';
        return aName.localeCompare(bName);
        
      } else if (sortBy === 'oldest_expired') {
        // Items with expiration dates first, sorted by oldest expired first
        if (aHasExpiration && !bHasExpiration) return -1;
        if (!aHasExpiration && bHasExpiration) return 1;
        
        if (aHasExpiration && bHasExpiration) {
          return a.daysLeft - b.daysLeft; // Oldest expired first
        }
        
        // If neither has expiration, sort by name (with safety check)
        const aName = a.name || '';
        const bName = b.name || '';
        return aName.localeCompare(bName);
        
      } else if (sortBy === 'name') {
        const aName = a.name || '';
        const bName = b.name || '';
        return aName.localeCompare(bName);
      }
      
      return 0;
    });

    return sorted;
  }, [items, sortBy, filterStorage, filterCategory]);

  const categories = ['Fruit', 'Vegetable', 'Dairy', 'Meat', 'Grain'];

  return (
    <Box bg="white" minH="100vh" position="relative">
      <Box p={6} pt={8}>
        {/* Controls */}
        <Box mb={6} p={4} bg="gray.50" borderRadius="md">
          <HStack spacing={4} wrap="wrap">
            <FormControl maxW="200px">
              <FormLabel fontSize="sm">Sort by</FormLabel>
              <Select size="sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Default (Expiring first)</option>
                <option value="oldest_expired">Oldest expired first</option>
                <option value="name">Name (A-Z)</option>
              </Select>
            </FormControl>

            <FormControl maxW="200px">
              <FormLabel fontSize="sm">Storage</FormLabel>
              <Select size="sm" value={filterStorage} onChange={(e) => setFilterStorage(e.target.value)}>
                <option value="all">All</option>
                <option value="refrigerated">Refrigerated only</option>
                <option value="pantry">Pantry only</option>
              </Select>
            </FormControl>

            <FormControl maxW="200px">
              <FormLabel fontSize="sm">Category</FormLabel>
              <Select size="sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </FormControl>
          </HStack>
        </Box>

        <SimpleGrid spacing={10} minChildWidth={300} templateColumns="repeat(auto-fill, minmax(300px, 1fr))">
          {filteredAndSortedItems.map(item => {
            const expirationInfo = getExpirationDisplay(item);
            return (
              <Card key={item.id} borderTop="8px" borderColor="purple.400" bg="white" maxW="400px">
                <CardHeader color="gray.700">
                  <Flex gap={5} justify="space-between">
                    <Flex gap={5} flex="1">
                      <Box>
                        <Heading as="h3" size="sm">{item.name}</Heading>
                        <Text fontSize="sm" color="gray.500">{item.category || 'No Category'}</Text>
                        <HStack mt={1}>
                          <Badge colorScheme={item.isRefrigerated ? 'blue' : 'gray'} size="sm">
                            {item.isRefrigerated ? '❄️ Refrigerated' : '🏠 Pantry'}
                          </Badge>
                        </HStack>
                      </Box>
                    </Flex>
                    <Box display="flex" alignItems="center" justifyContent="center" fontSize="2xl">
                      <Text>{getCategoryIcon(item.category)}</Text>
                    </Box>
                  </Flex>
                </CardHeader>
                <CardBody color="gray.500">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="semibold" color="black">Quantity: {item.quantity}</Text>
                    <Badge colorScheme={getExpirationColor(item.daysLeft, expirationInfo.hasExpiration)}>
                      {expirationInfo.text}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="black" mb={2}>
                    Expires: {item.expiration && item.expiration.trim() !== '' ? item.expiration : 'Not set'}
                  </Text>
                  {item.notes && (
                    <Box mt={2}>
                      <Text fontSize="xs" fontWeight="semibold" color="gray.600">Notes:</Text>
                      <Text fontSize="sm" color="gray.600" fontStyle="italic">
                        {item.notes.length > 100 ? `${item.notes.substring(0, 100)}...` : item.notes}
                      </Text>
                    </Box>
                  )}
                </CardBody>
                <Divider borderColor="gray.200" />
                <CardFooter justify="center" width="100%">
                  <HStack spacing={50}>
                    <Button 
                      variant="outline" 
                      leftIcon={<EditIcon />}
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </Button>
                    <Button variant="outline" leftIcon={<DeleteIcon />} onClick={() => handleDeleteClick(item)}>Delete</Button>
                  </HStack>
                </CardFooter>
              </Card>
            );
          })}
        </SimpleGrid>

        {filteredAndSortedItems.length === 0 && (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.500">Click the New Product button to get started! </Text>
          </Box>
        )}

        {/* Floating Add Button */}
        <Box position="fixed" bottom={6} right={6} zIndex={1000}>
          <IconButton
            aria-label="Add new food item"
            icon={<AddIcon />}
            size="lg"
            colorScheme="purple"
            variant="solid"
            borderRadius="full"
            boxSize="60px"
            fontSize="24px"
            onClick={() => {
              debugLog('Floating add button clicked', {});
              navigate('/create');
            }}
            boxShadow="lg"
            _hover={{
              transform: 'scale(1.1)',
              boxShadow: 'xl'
            }}
          />
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Food Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Food item name"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Quantity</FormLabel>
              <NumberInput 
                value={formData.quantity}
                min={1} 
                step={1}
                precision={0}
                onChange={(valueString, valueNumber) => 
                  handleInputChange('quantity', valueNumber)
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Category</FormLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">No Category</option>
                <option value="Fruit">Fruit</option>
                <option value="Vegetable">Vegetable</option>
                <option value="Dairy">Dairy</option>
                <option value="Meat">Meat</option>
                <option value="Grain">Grain</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Storage</FormLabel>
              <Select
                value={formData.isRefrigerated ? 'true' : 'false'}
                onChange={(e) => handleInputChange('isRefrigerated', e.target.value === 'true')}
              >
                <option value="true">❄️ Refrigerated</option>
                <option value="false">🏠 Pantry</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Notes</FormLabel>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Optional notes about this food item..."
                resize="vertical"
                minH="80px"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Expiration Date</FormLabel>
              <Input
                type="date"
                value={formData.expiration}
                onChange={(e) => handleInputChange('expiration', e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Save Changes
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Item
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export const itemsLoader = async () => {
  //const { getToken } = useAuth();

  debugLog('Loading items from API', {});
  return [];
  // try {
    
  //   const token = await getToken({ template: 'Test' });
  //   debugLog('Token retrieved for initial load', { tokenExists: !!token });
    
  //   const res = await fetch('http://localhost:8080/api/food', {
  //     headers: {
  //       'Authorization': `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     },
  //   });

  //   redirect('/dashboard')
    
  //   if (!res.ok) {
  //     throw new Error(`HTTP error! status: ${res.status}`);
  //   }
    
  //   const data = await res.json();

  //   if (!Array.isArray(data)) {
  //     debugLog('API returned non-array data', { data, type: typeof data });
  //     return [];
  //   }
    
  //   debugLog('Items loaded successfully', { count: data.length });
  //   return data;
  // } catch (error) {
  //   debugLog('Failed to load items', { error: error.message });
  //   // Return empty array instead of throwing to prevent app crash
  //   return [];
  // }
};