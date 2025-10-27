import { AddIcon, AtSignIcon, CalendarIcon } from "@chakra-ui/icons";
import { IconContext } from "react-icons";
import { CiReceipt } from "react-icons/ci";
import { List, ListIcon, ListItem } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";


export default function Sidebar() {
    return (
        <List color = "white" fontSize = "1.2em" spacing = {4}> 
            <ListItem>
                <NavLink to = "/dashboard"> 
                    <ListIcon as = {CalendarIcon} color = "white"/>
                    Dashboard
                </NavLink>
            </ListItem>
            <ListItem>
                <NavLink to = "/create"> 
                    <ListIcon as = {AddIcon} color = "white"/>
                    New Product
                </NavLink>
            </ListItem>
            <ListItem>
                <NavLink to = "/receipt"> 
                    <ListIcon as = {CiReceipt} color = "white" boxSize = "1.5em" ml= "-1" mr = "1" />
                    Receipt Upload
                </NavLink>
            </ListItem>
            {/* <ListItem>
                <NavLink to = "/profile"> 
                    <ListIcon as = {AtSignIcon} color = "white"/>
                    Profile
                </NavLink>
            </ListItem> */}
        </List>
    )
}