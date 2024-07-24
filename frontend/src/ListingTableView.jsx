import React from "react";
import ListingTable from "./ListingTable";
const ListingTableView = (listings) => {
    console.log(listings);
    if (!listings) {
        return null;
    }
    let myUrl = "google.com";
    return (
        <div className="listing-table-view">
            {listings.listings.listings.map(listing => (
            <ListingTable listing={listing} url={myUrl} />
        ))}
        </div>
    );
}
export default ListingTableView;