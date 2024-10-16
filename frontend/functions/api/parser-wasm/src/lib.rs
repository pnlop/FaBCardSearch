extern crate reqwest;
extern crate sonic_rs;
extern crate fake_useragent;
extern crate wasm_bindgen;


use fake_useragent::UserAgents;
use reqwest::blocking::Client;
use reqwest::header::USER_AGENT;
use reqwest::Method;
use sonic_rs::{Deserialize, Serialize};
use std::env;
use std::io::{self, Error, Write};
use wasm_bindgen::prelude::*;

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}



#[derive(Serialize, Deserialize)]
struct Variant {
    title: String,
    available: bool,
    price: String,
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

#[wasm_bindgen]
fn parse(shopify: &str, argsproduct: &str, argscollection: &str, argscollectionabr: &str, argscolor: &str) -> String {
    // all args must be lowercase
    let user_agent = UserAgents::new();
    let client = Client::builder().build().unwrap();
    let mut products: Vec<Product> = Vec::new();
    let mut page = 1;
    let title_lower = argsproduct.to_lowercase();
    let mut collections: Vec<Collection> = Vec::new();
    loop {
        let collection: CollectionResponse = client
            .request(
                Method::GET,
                "".to_owned() + shopify + "collections.json?limit=250&page=" + &page.to_string(),
            )
            .header(USER_AGENT, user_agent.random())
            .send()
            .expect("Failed to send request")
            .json::<CollectionResponse>()
            .expect("Failed to parse json");
        if collection.collections.len() == 0 {
            break;
        }
        page += 1;
        collections.extend(collection.collections);
    }
    collections.retain(|x| {
        (x.title.to_lowercase().contains(argscollection) || x.title.to_lowercase().contains(argscollectionabr))
            && x.title.to_lowercase().contains("singles")
        });
    page = 1;
    loop {
        let json_string: ProductResponse = if collections.len() == 0 { 
            client.request(
                    Method::GET,
                    "".to_owned()
                        + shopify
                        + "products.json?limit=250&page="
                        + &page.to_string(),
                )
                .header(USER_AGENT, user_agent.random())
                .send()
                .expect("Failed to send request")
                .json::<ProductResponse>()
                .expect("Failed to parse json")
        } else { 
            client.request(
                    Method::GET,
                    "".to_owned()
                        + shopify
                        + "collections/"
                        + collections[0].handle.as_str()
                        + "/products.json?limit=250&page="
                        + &page.to_string(),
                )
                .header(USER_AGENT, user_agent.random())
                .send()
                .expect("Failed to send request")
                .json::<ProductResponse>()
                .expect("Failed to parse json")
        };
        if json_string.products.len() == 0 {
            break;
        }
        page += 1;
        products.extend(json_string.products);
    }
    if argscollectionabr == "fab" && argscolor != "NIL" {
        products.retain(|x| {
            x.title.to_lowercase().contains(&title_lower)
                && (x.title.to_lowercase().contains(argscolor)
                    || no_color(&x.title.to_lowercase()))
        });
    } else {
        products
            .retain(|x| x.title.to_lowercase().contains(&title_lower));
    }
    return &sonic_rs::to_vec(&products)?.into();
}

fn no_color(title: &str) -> bool {
    const COLORS: [&str; 3] = ["yellow", "red", "blue"];
    for color in COLORS {
        if title.contains(color) {
            return false;
        }
    }
    return true;
}

