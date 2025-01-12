import { AddIcon, AtSignIcon, CalendarIcon } from "@chakra-ui/icons";
import { List, ListIcon, ListItem } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
    return (
        <List color = "white" font-size = "1.2em" spacing = {4}> 
            <ListItem>
                <NavLink to = "/"> 
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
                <NavLink to = "/profile"> 
                    <ListIcon as = {AtSignIcon} color = "white"/>
                    Profile
                </NavLink>
            </ListItem>
        </List>
    )
}