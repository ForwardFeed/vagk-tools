mod config_loader;
mod extractor;
mod input_event;
mod generate;

use rocket::fs::relative;
use std::path::Path;
use rocket::fs::NamedFile;

#[macro_use] extern crate rocket;
extern crate core;


#[get("/")]
pub async fn index_html() -> Option<NamedFile> {
    let mut path = Path::new(relative!("static")).join("index.html");
    if path.is_dir() {
        path.push("index.html");
    }

    NamedFile::open(path).await.ok()
}

#[get("/index.js")]
pub async fn index_js() -> Option<NamedFile> {
    let mut path = Path::new(relative!("static")).join("index.js");
    if path.is_dir() {
        path.push("index.js");
    }

    NamedFile::open(path).await.ok()
}

#[get("/style.css")]
pub async fn style_css() -> Option<NamedFile> {
    let mut path = Path::new(relative!("static")).join("style.css");
    if path.is_dir() {
        path.push("style.css");
    }

    NamedFile::open(path).await.ok()
}

#[get("/event_path")]
pub async fn auto_event_path() -> String{
    let auto_path = match generate::find_auto_keyboard() {
        Ok(x) => x,
        Err(..) => {
            return  "{ \"validity\": false }".to_string()
        }
    };
    format!("{{ \"validity\": true, \"event_path\" : \"{}\"}}", auto_path)
}

#[get("/last_key")]
//not async because you can make your PC lag to death if you spam the request
pub fn get_last_key() -> String{
    let auto_path = match generate::find_auto_keyboard() {
        Ok(x) => x,
        Err(..) => {
            panic!("automatically found keyboard invalid")
        }
    };
    let mut extractor = extractor::ConfigKeyboardEventReader::new(auto_path);
    format!("{{ \"validity\": true, \"keycode\" : {} }}", extractor.last_keycode_pressed())
}

#[launch]
fn rocket() -> _ {
    let rocket = rocket::build()
        .mount("/", routes![index_html])
        .mount("/", routes![index_js])
        .mount("/", routes![style_css])
        .mount("/", routes![auto_event_path])
        .mount("/", routes![get_last_key]);
	println!("http://127.0.0.1:8000");
	rocket
}
