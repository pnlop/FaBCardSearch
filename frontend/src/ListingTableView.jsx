import React from "react";
import ListingTable from "./ListingTable";
const ListingTableView = (listings) => {
    console.log(listings);
    return (
        <div className="listing-table-view">
            {Object.values(listings.listings).map(listing => (
            <ListingTable listing={listing} url={listings.url}/>
        ))}
        </div>
    );
}
export default ListingTableView;