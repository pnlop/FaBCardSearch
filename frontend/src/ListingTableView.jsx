import React from "react";
import ListingTable from "./ListingTable";
const ListingTableView = (listings) => {
    console.log("THIS IS LISTINGS" + listings);
    return (
        <div className="listing-table-view">
            {Object.values(listings.listings).map(listing => (
            <ListingTable listing={listing}/>
        ))}
        </div>
    );
}
export default ListingTableView;