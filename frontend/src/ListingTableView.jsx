import React from "react";
import ListingTable from "./ListingTable";
const ListingTableView = (listings) => {
    console.log(listings);
    if (!listings) {
        return null;
    }
    return (
        <div className="listing-table-view">
            {listings.listings.map(listing => (
            <ListingTable listing={listing} url={listings.listings.url}/>
        ))}
        </div>
    );
}
export default ListingTableView;