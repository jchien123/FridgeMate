import { Box, FormControl, Input, FormHelperText, FormLabel, Select, Checkbox, Button} from "@chakra-ui/react";
import { title } from "framer-motion/client";
import { Form, redirect } from "react-router-dom";

export default function Create() {
  return (
    <Box maxW="480px">
      <Form method = "post" action = "/create">
        <FormControl isRequired mb = "40px">
          <FormLabel>Product Name: </FormLabel>
          <Input type="text" name = "title" />
          <FormHelperText>
            Enter Name of the Food
          </FormHelperText>
        </FormControl>

        <FormControl mb = "40px" isRequired>
          <FormLabel>Product Category: </FormLabel>
          <Select 
            placeholder= "Select Category"
            name = "category"> 
            <option value = "Fruit"> Fruit </option>
            <option value = "Vegetable"> Vegetable </option>
            <option value = "Dairy"> Dairy </option>
            <option value = "Meat"> Meat </option>
            <option value = "Grain"> Grain </option>
            <option value = "Other"> Other </option>
          </Select>
          
        </FormControl>

        <FormControl display = "flex" alignItems= "center" mb = "40px" isRequired>
          <Checkbox
            name = "isPerishable"
            size = "lg"
            />
          <FormLabel mb = "0px" ml= "10px"> Perishable?</FormLabel>
        </FormControl>

        <FormControl mb = "40px">
          <FormLabel> Expiration Date: </FormLabel>
          <Input placeholder='Select Date' size='md' type='date' />
        </FormControl>

        <Button type = "submit">Add Item  </Button>

      </Form>
    </Box>
  )
}

export const createAction = async ({request}) => {
  const data = await request.formData()

  const task = {
    title: data.get('title'),
    category: data.get('category'),
    isPerishable: data.get('isPerishable') === ''
  }

  console.log(task)

  return redirect('/')
}
