mod config_loader;
mod key_matching;
mod manager;
mod main_loop;
mod extractor;
mod input_event;
mod generate;
mod modify;

extern crate clap;
extern crate core;


use std::process::exit;
use clap::{Arg, App};
use crate::generate::Generate;
use crate::modify::Modify;

fn main() {
    let matches = App::new("vagk")
        .version("1.0.0")
        .author("ForwardFeed")
        .about("CLI crafting tool for VAGK configuration file")
        // .arg(Arg::with_name("input_file")
        //     .short("i")
        //     .long("input")
        //     .value_name("FILE")
        //     .help("input a file to be")
        //     .takes_value(true))
        .arg(Arg::with_name("output_file")
            .short("o")
            .long("output")
            .value_name("FILE")
            .help("Sets a custom config file, if not specified: macro-config.json")
            .takes_value(true))
        .arg(Arg::with_name("generate")
            .short("g")
            .long("generate")
            .help("Generate a custom config file")
            .takes_value(false))
        // .arg(Arg::with_name("modify")
        //     .short("m")
        //     .long("modify")
        //     .help("Modify an existing config file")
        //     .takes_value(false))
        .arg(Arg::with_name("test_file")
            .short("t")
            .long("test")
            .help("Test if a config file is valid, if not specified: macro-config.json")
            .value_name("FILE")
            .takes_value(true))
        .get_matches();

    //Check if the user has entered conflicting flags
    // if matches.is_present("generate") && matches.is_present("modify"){
    //     println!("conflict in arguments, you can't have both --generate and --modify flags");
    //     std::process::exit(2);
    // }

    if matches.is_present("test_file") && matches.is_present("generate"){
        println!("conflict in arguments, you can't have both --generate and --test flags");
        std::process::exit(2);
    }

    //acting in functions of flags
    let input_file = if matches.is_present("input_file") {
        extractor::open_event_file(matches.value_of("input_file").unwrap_or("macro-config.json").to_string())
    }else if matches.is_present("test_file") {
        extractor::open_event_file(matches.value_of("test_file").unwrap_or("macro-config.json").to_string())
    }
    else{
        extractor::open_event_file("macro-config.json".to_string())
    };


    if matches.is_present("generate")  {//check if we're in a generate mode
        Generate::new().start();
    }
    // else if matches.is_present("modify") {
    //     let config_file = matches.value_of("config").unwrap_or("macro-config.json");
    //     let file = extractor::open_event_file(config_file.to_string());
    //     let config = config_loader::new(file);
    //     Modify::new(config).print_config()
    // }

    else if matches.is_present("test_file"){
        config_loader::new(input_file);
        exit(0);
    }
    else{// if no flags
        Generate::new().start();
    }


}

