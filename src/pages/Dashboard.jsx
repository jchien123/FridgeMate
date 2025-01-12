import { EditIcon, ViewIcon } from '@chakra-ui/icons';
import { Box, Button, Card, CardBody, CardFooter, CardHeader, Container, Divider, Flex, Heading, HStack, SimpleGrid, Text } from '@chakra-ui/react';
import { useLoaderData } from 'react-router-dom';
// import { color } from 'framer-motion';


export default function Dashboard() {

    const tasks = useLoaderData()

  // const boxStyles = {
  //   p: "10px", 
  //   bg: "purple.400", 
  //   color: "white",
  //   m: "10px",
  //   textAlign: "center",
  //   filter: "blur(2px)",
  //   ':hover' : {
  //     color: "black",
  //     bg: 'blue.200',
  //   }
  // }

  return (

    <SimpleGrid spacing = {10} minChildWidth= "300px">

      { tasks && tasks.map(task => (
       <Card key = {task.id} borderTop = "8px" borderColor={"purple.400"} bg = "white">
          <CardHeader>
            <Flex>
              <Box w = "50px" h = "50px">
                <Text>AV</Text>
              </Box>
              <Box>
                <Heading as = "h3" size = "sm"> {task.title} </Heading>
                <Text> by {task.author} </Text>
              </Box>
            </Flex>
          </CardHeader>

          <CardBody color = "gray">
            <Text> {task.description}</Text>
          </CardBody>

          <Divider borderColor={'gray.200'}/>

          <CardFooter>
            <HStack>
              <Button variant = "outline" leftIcon={<ViewIcon />}>
                Watch
              </Button>

              <Button variant = "outline" leftIcon = {<EditIcon />}>
                Comment
              </Button>
            </HStack>
          </CardFooter>
        </Card>
      ))}

    </SimpleGrid>

    // <Container as = "section" maxWidth="md">
    //   <Heading my = "30px" p = "10px"> 
    //     Chakra UI Components 
    //   </Heading>

    //   <Text marginLeft = "30px" color = "green.600" fontWeight="bold"> 
    //     something something something
    //   </Text>

    //   <Box my = "30px" p = "10px" bg = "blue.100">
    //     <Text color = "black  ">
    //       This is a box.
    //     </Text>
    //   </Box>

    //   <Box sx = {boxStyles}> 
    //     Hello, World!
    //   </Box>

    // </Container>

  )
}

export const tasksLoader = async () => {
  const res = await fetch('http://localhost:3000/tasks');

  return res.json();
}