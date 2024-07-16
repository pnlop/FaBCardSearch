// src/ListingTable.js
import React from 'react';
import './ListingTable.css';
//turn listing table into dynamic table generator per store, iterate over stores/listings in wrapper component
const ListingTable = (listing) => {
    console.log(listing);
    //listing: {url: string, listings: []}
    return (
        <div>
            <h3><a href={listing?.listing.url}>{new URL(listing?.listing.url).hostname}</a></h3>
            <table className='listing-table'>
                <thead>
                <tr>
                    <th>Card</th>
                    <th>Price</th>
                    <th>Condition</th>
                </tr>
                </thead>
                <tbody>
                {listing?.listing.listings.map((listing) => (listing.map((sublisting) => (
                    <tr hidden={!sublisting.available}>
                        <td>{sublisting.name}</td>
                        <td>{(sublisting.price / 100).toLocaleString("en-US", {style:"currency", currency:"USD"})}</td>
                        <td>{sublisting.title}</td>
                    </tr>
                ))))
            }
                </tbody>
            </table>
            
        </div>
    );
};

export default ListingTable;