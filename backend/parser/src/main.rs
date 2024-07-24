use reqwest::blocking::Client;
use sonic_rs::{Deserialize, Serialize};
use std::env;
use std::io::{self, Error, Write};

#[derive(Serialize, Deserialize)]
struct Variant {
    title: String,
    available: bool,
}

#[derive(Serialize, Deserialize)]
struct Product {
    title: String,
    variants: Vec<Variant>,
}

#[derive(Serialize, Deserialize)]
struct ProductResponse {
    products: Vec<Product>,
}

#[derive(Serialize, Deserialize)]
struct Collection {
    title: String,
    handle: String,
}

#[derive(Serialize, Deserialize)]
struct CollectionResponse {
    collections: Vec<Collection>,
}

fn main() -> Result<(), Error> {
    // args[1] = shopify url, args[2] = product name, args[3] = collection name, args[4] = collection name (abbreviated), args[5] = card color (optional)
    let args: Vec<String> = env::args().collect();
    let client = Client::builder().user_agent("Mozilla/5.0").build().unwrap();
    let mut products: Vec<Product> = Vec::new();
    let mut page = 1;
    let mut collections: CollectionResponse = client
        .get("".to_owned() + &args[1] + "collections.json?limit=250")
        .send()
        .expect("Failed to send request")
        .json::<CollectionResponse>()
        .expect("Failed to parse json");
    collections.collections.retain(|x| {
        (x.title.to_lowercase().contains(&args[3].to_lowercase())
            || x.title.to_lowercase().contains(&args[4].to_lowercase()))
            && x.title.to_lowercase().contains("singles")
    });
    loop {
        let mut json_string: ProductResponse = client
            .get(
                "".to_owned()
                    + &args[1]
                    + "collections/"
                    + collections.collections[0].handle.as_str()
                    + "/products.json?limit=250&page="
                    + &page.to_string(),
            )
            .send()
            .expect("Failed to send request")
            .json::<ProductResponse>()
            .expect("Failed to parse json");
        if json_string.products.len() == 0 {
            break;
        }
        page += 1;
        json_string.products.retain(|x| {
            x.title.to_lowercase().contains(&args[2].to_lowercase())
                && x.title.to_lowercase().contains(&args[5].to_lowercase())
        });
        products.extend(json_string.products);
    }
    return io::stdout().write_all(&sonic_rs::to_vec(&products)?);
}
