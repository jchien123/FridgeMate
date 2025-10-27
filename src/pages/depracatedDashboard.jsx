import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, Button, Card, CardBody, CardFooter, CardHeader, Container, Divider, Flex, Heading, HStack, SimpleGrid, Text, Center} from '@chakra-ui/react';
import { useLoaderData } from 'react-router-dom';
// import { color } from 'framer-motion';

export default function Dashboard2() {
  const tasks = useLoaderData();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    expirationDate: ''
  });
  const toast = useToast();

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setFormData({
      name: task.title || '',
      quantity: task.quantity || 1,
      expirationDate: task.expirationDate || ''
    });
    onOpen();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Update the task via API
      const response = await fetch(`http://localhost:3000/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedTask,
          title: formData.name,
          quantity: formData.quantity,
          expirationDate: formData.expirationDate
        }),
      });

      if (response.ok) {
        toast({
          title: 'Task updated',
          description: 'Your task has been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        // You might want to refetch data or update the UI here
        window.location.reload(); // Simple refresh - you could implement better state management
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <SimpleGrid spacing={10} minChildWidth={300}>
      {tasks && tasks.map(task => (
        <Card key={task.id} borderTop="8px" borderColor="purple.400" bg="white">

          <CardHeader color="gray.700">
            <Flex gap={5}>
              <Box w="50px" h="50px">
                <Text>AV</Text>
              </Box>
              <Box>
                <Heading as="h3" size="sm">{task.title}</Heading>
                <Text>by {task.author}</Text>
              </Box>
            </Flex>
          </CardHeader>

          <CardBody color="gray.500">
            <Text>{task.description}</Text>
          </CardBody>

          <Divider borderColor="gray.200" />

          <CardFooter justify="center" width="100%">
            <HStack spacing={50}>
              <Button variant="outline" leftIcon={<EditIcon />}>Edit</Button>
              <Button variant="outline" leftIcon={<DeleteIcon />}>Delete</Button>
            </HStack>
          </CardFooter>

        </Card>
      ))}
    </SimpleGrid>
  )
}

export const tasksLoader = async () => {
  const res = await fetch('http://localhost:3000/tasks')

  return res.json()

}
