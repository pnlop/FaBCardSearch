import React from "react";
import ListingTable from "./ListingTable";
import { Anchor } from "@mantine/core";

const ListingTableView = (listings) => {
    if (!listings) {
        return null;
    }
    console.log("list: " + JSON.stringify(listings));
    let myUrl = listings.listings.url;
    console.log(myUrl);
    console.log(JSON.parse(listings.listings.listings));
    return (
        <div className="listing-table-view">
            <Anchor href={myUrl}>{myUrl}</Anchor>
            {JSON.parse(listings.listings.listings).map(listing => (
            <ListingTable listing={listing} url={myUrl} />
        ))}
        </div>
    );
}
export default ListingTableView;