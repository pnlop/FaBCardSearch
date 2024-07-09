// src/ListingTable.js
import React from 'react';

const ListingTable = (listings: { [store: string]: { products: any[] } }) => {
    return (
        <div>
            {Object.keys(listings).map((store, storeIndex) => (
                <div key={storeIndex}>
                    <h2>{store}</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Link</th>
                        </tr>
                        </thead>
                        <tbody>
                        {listings[store].products?.map((product, productIndex) => (
                            <tr key={productIndex}>
                                <td>{product.title}</td>
                                <td>{product.price}</td>
                                <td>
                                    <a href={product.url} target="_blank" rel="noopener noreferrer">
                                        View Product
                                    </a>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default ListingTable;