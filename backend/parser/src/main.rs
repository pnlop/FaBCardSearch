use fake_useragent::UserAgents;
use reqwest::blocking::Client;
use reqwest::header::USER_AGENT;
use reqwest::Method;
use sonic_rs::{Deserialize, Serialize};
use std::env;
use std::io::{self, Error, Write};

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

fn main() -> Result<(), Error> {
    // all args must be lowercase
    // args[1] = shopify url, args[2] = product name, args[3] = collection name, args[4] = collection name (abbreviated), args[5] = card color (optional)
    let args: Vec<String> = env::args().collect();
    let user_agent = UserAgents::new();
    let client = Client::builder().build().unwrap();
    let mut products: Vec<Product> = Vec::new();
    let mut page = 1;
    let title_lower = &args[2].to_lowercase();
    let mut collections: Vec<Collection> = Vec::new();
    loop {
        let collection: CollectionResponse = client
            .request(
                Method::GET,
                "".to_owned() + &args[1] + "collections.json?limit=250&page=" + &page.to_string(),
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
        (x.title.to_lowercase().contains(&args[3]) || x.title.to_lowercase().contains(&args[4]))
            && x.title.to_lowercase().contains("singles")
        });
    page = 1;
    loop {
        let json_string: ProductResponse = if collections.len() == 0 { 
            client.request(
                    Method::GET,
                    "".to_owned()
                        + &args[1]
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
                        + &args[1]
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
    if &args[4] == "fab" && args.len() > 5 {
        products.retain(|x| {
            x.title.to_lowercase().contains(title_lower)
                && (x.title.to_lowercase().contains(&args[5])
                    || no_color(&x.title.to_lowercase()))
        });
    } else {
        products
            .retain(|x| x.title.to_lowercase().contains(title_lower));
    }
    return io::stdout().write_all(&sonic_rs::to_vec(&products)?);
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
