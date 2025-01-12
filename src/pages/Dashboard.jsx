import { Box, Container, Heading, SimpleGrid, Text } from '@chakra-ui/react';
// import { color } from 'framer-motion';


export default function Dashboard() {

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

    <SimpleGrid columns = {3} spacing = {10} minChildWidth= "250px">
      <Box bg = "white" h = "200px" border = "1px solid"> 
        <Text color = {{base: "pink", md: 'blue', lg: 'green'}}> Hello, World! </Text>
      </Box>
      <Box bg = "white" h = "200px" border = "1px solid"> </Box>
      <Box bg = "white" h = "200px" border = "1px solid"> </Box>
      <Box bg = "white" h = "200px" border = "1px solid"> </Box>

      <Box bg = "white" h = "200px" border = "1px solid"> </Box>
      <Box bg = "white" h = "200px" border = "1px solid"> </Box>
      <Box bg = "white" h = "200px" border = "1px solid"> </Box>
      <Box bg = "white" h = "200px" border = "1px solid"> </Box>

      <Box bg = "white" h = "200px" border = "1px solid"> </Box>
      <Box bg = "white" h = "200px" border = "1px solid"> </Box>
      <Box bg = "white" h = "200px" border = "1px solid"> </Box>
      <Box bg = "white" h = "200px" border = "1px solid"> </Box>
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
