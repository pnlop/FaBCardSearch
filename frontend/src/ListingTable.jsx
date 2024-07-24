// src/ListingTable.js
import { Anchor, Card, Table } from "@mantine/core";
import React from "react";
import "./ListingTable.css";
//turn listing table into dynamic table generator per store, iterate over stores/listings in wrapper component
const ListingTable = (listing, url) => {
  let cardName;
  if (!listing) {
    return null;
  }
  console.log("listing "+JSON.stringify(listing));
  console.log("url "+JSON.stringify(url));
  console.log("listing variants "+listing.variants);
  const rows = listing.variants.map((sublisting) => {
    console.log("sublisting "+sublisting);
      if (!sublisting.available) {
        return null;
      }
      cardName = listing.title;
      return (
        <Table.Tr key={sublisting.title} hidden={!sublisting.available}>
          <Table.Td>{sublisting.title}</Table.Td>
          <Table.Td>
            {(sublisting.price / 100).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </Table.Td>
          <Table.Td>{sublisting.title}</Table.Td>
        </Table.Tr>
      );
    
  });
  return (
    <Card>
      <Anchor href={url} size="xl">
        {new URL(url).hostname}
      </Anchor>
      <Table className="listing-table">
        <h1>{cardName}</h1>
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
