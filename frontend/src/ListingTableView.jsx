import React from "react";
import ListingTable from "./ListingTable";
const ListingTableView = (listings) => {
    console.log(listings);
    if (!listings) {
        return null;
    }
    console.log(listings.listings);
    console.log(listings.listings.listings);
    return (
        <div className="listing-table-view">
            {listings.listings.listings.map(listing => (
            <ListingTable listing={listing} url={"https://negativezonecomics.com/"} />
        ))}
        </div>
    );
}
export default ListingTableView;