import React from "react";
import ListingTable from "./ListingTable";
import { Anchor } from "@mantine/core";

const ListingTableView = (listings) => {
    if (!listings) {
        return null;
    }
    let myUrl = listings.listings.url;
    let url2 = new URL(myUrl);
    return (
        <div className="listing-table-view">
            <Anchor href={myUrl}>{url2.hostname}</Anchor>
            {listings.listings.listings.map(listing => (
            <ListingTable listing={listing} url={myUrl} />
        ))}
        </div>
    );
}
export default ListingTableView;