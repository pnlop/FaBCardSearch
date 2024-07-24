// src/ListingTable.js
import { Anchor, Card, Table } from "@mantine/core";
import React from "react";
import "./ListingTable.css";
//turn listing table into dynamic table generator per store, iterate over stores/listings in wrapper component
const ListingTable = (listing, url) => {
  if (!listing) {
    return null;
  }
  const rows = listing.listing.variants.map((variant) => {
      if (!variant.available) {
        return null;
      }
      return (
        <Table.Tr key={variant.name} hidden={!variant.available}>
          <Table.Td>{listing.listing.title}</Table.Td>
          <Table.Td>
            {(variant.price / 100).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </Table.Td>
          <Table.Td>{variant.title}</Table.Td>
        </Table.Tr>
      );
    }
  );

  return (
    <Card>
      <Anchor href={url} size="xl">
        {url}
      </Anchor>
      <Table className="listing-table">
        <h1></h1>
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
