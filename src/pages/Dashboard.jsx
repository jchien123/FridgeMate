import { Box, Container, Heading, Text } from '@chakra-ui/react';
import { color } from 'framer-motion';


export default function Dashboard() {

  const boxStyles = {
    p: "10px", 
    bg: "purple.400", 
    color: "white",
    m: "10px",
    textAlign: "center",
    filter: "blur(2px)", 
    ':hover' : {
      color: "black",
      bg: 'blue.200',
    }
  }

  return (
    <Container as = "section" maxWidth="md">
      <Heading my = "30px" p = "10px"> 
        Chakra UI Components 
      </Heading>

      <Text marginLeft = "30px" color = "green.600" fontWeight="bold"> 
        something something something
      </Text>

      <Box my = "30px" p = "10px" bg = "blue.100">
        <Text color = "black  ">
          This is a box.
        </Text>
      </Box>

      <Box sx = {boxStyles}> 
        Hello, World!
      </Box>

    </Container>

  )
}
