import { Flex, Box, Heading, Button, Text, Spacer, HStack } from "@chakra-ui/react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";

export default function Navbar() {
  const { user } = useUser();

  return (
    <Flex as="nav" p="10px" mb="40px" alignItems="center" gap="10px">
      <Heading as="h1">FridgeMate</Heading>
      <Spacer />
      
      <SignedOut>
        <HStack spacing="20px">
          <SignInButton mode="modal">
            <Button colorScheme="purple">Sign In</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button colorScheme="purple" variant="outline">Sign Up</Button>
          </SignUpButton>
        </HStack>
      </SignedOut>

      <SignedIn>
        <HStack spacing="20px">
          <Box bg="gray.200" p="10px" borderRadius="md">
            {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
          </Box>
          <Text>{user?.emailAddresses[0]?.emailAddress}</Text>
          <UserButton afterSignOutUrl="/" />
        </HStack>
      </SignedIn>
    </Flex>
  );
}


// import { Flex, Box, Heading, Button, Text, Spacer, HStack } from "@chakra-ui/react";
// import React from "react";

// export default function Navbar() {
//     return (
//         <Flex as = "nav" p = "10px" mb = "40px" alignItems="center" gap = "10px">
//             <Heading as = "h1"> FridgeMate </Heading>
//             <Spacer />

//             <HStack spacing = "20px">
//                 <Box bg = "gray.200" p = "10px"> M </Box>
//                 <Text> mario@nintendo.com </Text>
//                 <Button colorScheme = "purple"> Logout </Button>
//             </HStack>
            
//         </Flex> 
           
//         // <Flex bg = "gray.200" justify = "space-between" wrap = "wrap" gap = "2">
//         //     <Box w = "150px" h = "50px" flexGrow = "1" bg = "red">1</Box>
//         //     <Box w = "150px" h = "50px" flexGrow = "1" bg = "blue">2</Box>
//         //     <Box w = "150px" h = "50px" flexGrow = "1" bg = "green">3</Box>
//         //     <Box w = "150px" h = "50px" flexGrow = "1" bg = "yellow">4</Box>
//         // </Flex>
//     )
// }
