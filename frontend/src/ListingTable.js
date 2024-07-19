// src/ListingTable.js
import { Anchor, Card, Table } from "@mantine/core";
import React from "react";
import "./ListingTable.css";
//turn listing table into dynamic table generator per store, iterate over stores/listings in wrapper component
const ListingTable = (listing) => {
  console.log(listing);
  //listing: {url: string, listings: []}

  console.log(listing);
  if (!listing) {
    return null;
  }
  const rows = listing.listing.listings.map((listing) =>
    listing.map((sublisting) => {
      if (!sublisting.available) {
        return null;
      }
      return (
        <Table.Tr key={sublisting.name} hidden={!sublisting.available}>
          <Table.Td>{sublisting.name}</Table.Td>
          <Table.Td>
            {(sublisting.price / 100).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </Table.Td>
          <Table.Td>{sublisting.title}</Table.Td>
        </Table.Tr>
      );
    })
  );
  return (
    <Card>
      <Anchor href={listing?.listing.url} size="xl">
        {new URL(listing?.listing.url).hostname}
      </Anchor>
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
