import React from "react";
import ListingTable from "./ListingTable";
import { Text } from "@mantine/core";

const ListingTableView = (listings) => {
    if (!listings) {
        return null;
    }
    console.log("list: " + JSON.stringify(listings));
    let myUrl = JSON.stringify(listings.listings.url);
    console.log(myUrl);
    console.log(JSON.parse(listings.listings.listings));
    return (
        <div className="listing-table-view">
            <Text size="xl" fw={700}>{listings.listings.shopName}</Text>
            {JSON.parse(listings.listings.listings).map(listing => (
            <ListingTable listing={listing} url={myUrl} />
        ))}
        </div>
    );
}
export default ListingTableView;