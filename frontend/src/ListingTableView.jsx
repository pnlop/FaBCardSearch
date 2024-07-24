import React from "react";
import ListingTable from "./ListingTable";
const ListingTableView = (listings) => {
    console.log(listings);
    if (!listings) {
        return null;
    }
    console.log(listings.url);
    console.log(listings.listings.listings);
    return (
        <div className="listing-table-view">
            {listings.listings.listings.map(listing => (
            <ListingTable listing={listing} url={listings.url} />
        ))}
        </div>
    );
}
export default ListingTableView;