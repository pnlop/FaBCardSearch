// src/ListingTable.js
import React from 'react';

const ListingTable = (listings) => {
    console.log(listings);
    return (
        <div>
            <table>
                <thead>
                <tr>
                    <th>Card</th>
                    <th>Price</th>
                    <th>Condition</th>
                    <th>Available</th>
                </tr>
                </thead>
                <tbody>
                {listings.listings.map((listing) => (listing.map((sublisting) => (
                    <tr hidden={!sublisting.available}>
                        <td>{sublisting.name}</td>
                        <td>{sublisting.price / 100}</td>
                        <td>{sublisting.title}</td>
                        <td>{sublisting.available.toString()}</td>
                    </tr>
                ))))
            }
                </tbody>
            </table>
            
        </div>
    );
};

export default ListingTable;