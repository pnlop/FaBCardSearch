import { Container,Flex, Group, Anchor, Image, Text} from '@mantine/core';
import React from "react";

const links = [
    { link: '#', label: 'Contact' },
    { link: '#', label: 'Privacy' },
    { link: '#', label: 'Blog' },
    { link: '#', label: 'Careers' },
  ];

const Footer = () => {
    const items = links.map((link) => (
        <Anchor
          c="dimmed"
          key={link.label}
          href={link.link}
          onClick={(event) => event.preventDefault()}
          size="sm"
        >
          {link.label}
        </Anchor>
      ));
    
      return (
        <div style={{borderTop: "0.025rem solid lightgray"}}>
          <Flex p={"xs"} justify={"center"} align={"center"} direction='row' gap={"15%"}>
            <Image fit="contain" w={48} h={48}
                  src={ "/favicon.svg" }/>
            <Text w={"50%"} align="center" c={"dimmed"}>Card Shark is in no way affiliated with Legend Story Studios® or Wizards of the Coast®. All images and information associated with cards or stores on this site belong to their respective copyright holders. All rights reserved.</Text>
            <Anchor href='https://ko-fi.com/H2H110V42M' target='_blank'><Image h={36}  src='https://storage.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Support Me on Ko-fi' /></Anchor>
          </Flex>
        </div>
      );
};

export default Footer;