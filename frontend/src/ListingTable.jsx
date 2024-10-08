// src/ListingTable.js
import { Anchor, Card, Table, Text } from "@mantine/core";
import React from "react";
import "./ListingTable.css";
//turn listing table into dynamic table generator per store, iterate over stores/listings in wrapper component
const ListingTable = ({listing, url}) => {
  if (!listing || !listing.variants[0].available) {
    return (
      <Card>
        <Text size="lg">No Results found</Text>
      </Card>
    );
  }
  console.log("listing: " + JSON.stringify(listing));
  console.log("URL: "+JSON.stringify(url));
  const rows = listing.variants.map((variant) => {
      if (!variant.available) {
        return null;
      }
      return (
        <Table.Tr key={variant.title} hidden={!variant.available}>
          <Table.Td>{listing.title}</Table.Td>
          <Table.Td>
            {variant.price}
          </Table.Td>
          <Table.Td>{variant.title}</Table.Td>
        </Table.Tr>
      );
    }
  );

  return (
    <Card>
      <Anchor href={url} target="_blank" rel="noreferrer">Go to store</Anchor>
      <Table className="listing-table">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Card</Table.Th>
            <Table.Th>Price</Table.Th>
            <Table.Th>Condition</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Card>
  );
};

export default ListingTable;
