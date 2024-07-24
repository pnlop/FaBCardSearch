import React from "react";
import ListingTable from "./ListingTable";
const ListingTableView = (listings) => {
    return (
        <div className="listing-table-view">
            console.log(listings);
            {Object.values(listings.listings).map(listing => (
            <ListingTable listing={listing} url={listings.url}/>
        ))}
        </div>
    );
}
export default ListingTableView;