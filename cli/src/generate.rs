use crate::{config_loader};
use crate::config_loader::{CfgKeybind, CfgSubKeybind, Config, KeyStates};
use crate::extractor::{ConfigKeyboardEventReader};

use regex::Regex;
use std::process::exit;
use std::io::{ErrorKind, stdin, stdout, Write};
use std::fs::File;
use std::time;
use serde_json::{to_string_pretty};
use std::io::{self, prelude::*, BufReader};
use std::str::FromStr;


pub struct Generate{
    keyboard_input_reader: ConfigKeyboardEventReader, // for reading user input key
    event_file_path: String,
}

impl Generate {

    pub fn new() -> Generate {

        let event_file_path = loop{
            let chosen_path = cli_find_kb(); // ask the user
            match File::open(chosen_path.clone()){ // try if we can open the file
                Ok(_) => break chosen_path,//return the path not the file
                Err(e) => println!("Error while opening the event file : {}", e)
                //loop again if it didn't work
            }
        };
        Generate{
            keyboard_input_reader: ConfigKeyboardEventReader::new(event_file_path.clone()),
            event_file_path,
        }
    }

    pub fn start(mut self){
        let mut keybinds: Vec<CfgKeybind> = vec![];

        loop {
            keybinds.push(self.create_keybind());
            match yes_no_prompt("Would you like to add another keybind to this configuration? (Y/n) :"){
                Ok(()) => continue,
                Err(()) => break
            }
        }
        let config_generated = Config{ general_parameters: config_loader::GeneralParameters{event_path : self.event_file_path.clone()}, keybinds};
        let config_as_string = match to_string_pretty(&config_generated) {
            Ok(x) => {x}
            Err(e) => {panic!("Couldn't generate configuration file, Serialization failed: {}", e)}
        };
        write_into_file(config_as_string);
        exit(0);
    }

    fn create_keybind(&mut self) -> CfgKeybind {
        loop {
            println!("Creation of a Keybind");
            let name= retrieve_from_io("What should be the name of this keybind? : ");
            let  timer_threshold: u64 =
                loop {
                    match  u64::from_str(&*retrieve_from_io("Please enter the time threshold for this keybind (in milliseconds) : ")){
                        Ok(x) => break x,
                        Err(x) => println!("Please enter a positive integer: {}",x)
                    }
                };
            let mut  sub_keybinds:Vec<CfgSubKeybind> = vec![];
            loop{
                sub_keybinds.push(self.create_sub_keybind());
                match yes_no_prompt("Would you like to continue to add other key to this keybind? (Y/n) :"){
                    Ok(()) => continue,
                    Err(()) => break
                }
            }
            return CfgKeybind{sub_keybinds ,name, timer_threshold}

        }

    }

    fn create_sub_keybind(&mut self) -> CfgSubKeybind {
        print_flush("What key should be sub-keybinded? (press the key in question in 1 sec)");
        std::thread::sleep(time::Duration::from_secs(1));
        print_flush("Now");
        let key_code = self.keyboard_input_reader.last_keycode_pressed();
        println!();
        retrieve_from_io("");
        let (keybind_type, key_state)= loop {
            match &retrieve_from_io("Please enter a keystates, or anything else to print help : ") as &str{
                "simple" => {
                    break (String::from("simple"), simple())
                },
                "longpress" =>{
                    break (String::from("longpress"), longpress())
                },
                "spampress" =>{
                    break (String::from("spampress"), spampress())
                },
                _=>{
                    print_help_keystates()
                }
            }
        };

        return CfgSubKeybind{key_code, keybind_type, key_state}
    }
}

fn simple() -> KeyStates {
    let key_value = loop {
        match retrieve_from_io("Triggers when \"(P/p)ressing\" a key (default) or when \"(R/r)elaxing a key").as_str() {
            "P" | "p" | "" => break 1,
            "R" | "r" => break 0,
            _ => continue
        }
    };
    return KeyStates::Simple { key_value }
}

fn longpress() -> KeyStates{
    let press_duration = loop {
        match  u64::from_str(&*retrieve_from_io("Set up the long press duration (in milliseconds) :")){
            Ok(x) => break x,
            Err(x) => println!("Please enter a positive integer: {}",x)
        }
    };
    return KeyStates::LongPress{press_duration }
}

fn spampress()-> KeyStates{
    let spam_press_time_span = loop {
        match  u64::from_str(&*retrieve_from_io("Set up the time span for the spam (in milliseconds) : ")){
            Ok(x) => break x,
            Err(x) => println!("Please enter a positive integer: {}",x)
        }
    };
    let repetition = loop {
        match  u16::from_str(&*retrieve_from_io("Set the number of  repetition of the key please : ")){
            Ok(x) => break x,
            Err(x) => println!("Please enter a positive integer: {}",x)
        }
    };

    return KeyStates::SpamPress {spam_press_time_span, repetition }

}

pub fn retrieve_from_io(msg: &str) -> String {
    print_flush(msg);
    let mut user_input = String::new();
    loop {
        match stdin().read_line(&mut user_input) {
            Ok(_) => {break}
            Err(e) => {println!("Error : {}", e)}
        }

    }
    user_input.pop();
    return user_input;
}

pub fn yes_no_prompt(msg: &str) -> Result<(), ()>{
    return loop {
        match &retrieve_from_io(msg) as &str {
            "N" | "n" | "no" | "No" | "NO" => { break Err(()) },
            "Y" | "y" | "yes" | "Yes" | "YES" => { break Ok(()) }
            _ => { }
        }
        print_flush("N/n/no/No/NO OR Y/y/yes/Yes/YES"  );
    }
}

pub fn print_flush(message: &str){
    print!("{}",message);
    stdout().flush().unwrap();
}

fn print_help_keystates(){
    println!("There is for now three type of keyStates
    spampress which is when you spam a key X time in the span of Y time
    longpress which is when you hold a key for X time
    simple    which is just when you simply press it")
}


pub fn write_into_file(text : String){
    let mut config_file;

    loop {
        let mut name = retrieve_from_io("Writing to file? default 'macro-config.ron' :");
        if name.is_empty() {
            name = std::string::String::from("macro-config.ron")
        }

        config_file = match File::create(name.clone()) {
            Ok(x) => x,
            Err(e) => {
                println!("Cannnot write to file {}", e);
                continue;
            }
        };
        break;
    }
    match writeln!(config_file,"{}", text ) {
        Ok(..) => {},
        Err(e) => println!("Couldn't write to file : {} outputting instead : \n {}", e,text)
    }
}

/*to find automatically the event path
**Thanks to https://stackoverflow.com/questions/2775461/linux-keyboard-event-capturing-dev-inputx
*/

pub fn find_auto_keyboard() -> Result<String, io::Error>{
    let devices = match File::open("/proc/bus/input/devices"){
        Ok(x) => x,
        Err(e) => {
            return Err(e)
        }
    };
    let reader = BufReader::new(devices);
    let regex1 = match Regex::new("Handlers.*|EV=.*"){
        Ok(x) => {x}
        Err(_) => {return Err(io::Error::new(ErrorKind::Other, "Error while compiling the regex?"))}
    };
    let regex2 = match Regex::new("EV=120013") {
        Ok(x) => {x}
        Err(_) => {return Err(io::Error::new(ErrorKind::Other, "Error while compiling the regex?"))}
    };
    let regex3 = match Regex::new("event[0-9]+") {
        Ok(x) => {x}
        Err(_) => {return Err(io::Error::new(ErrorKind::Other, "Error while compiling the regex?"))}
    };

    /* So, i needed to find a line before a certain match
   ** Since i couldn't find how to get the value of the precedent iterator, the precedent line
   ** I kept in memory the last line, maybe inefficient
    */
    let mut one_before: String = "Error".to_string();
    for line in reader.lines(){
        let line = match line {
            Ok(x) => {x}
            Err(_) => {continue}
        };
        let raw_event_file = match regex1.find(&*line) {
            Some(_) => {
                match regex2.find(&*line) {
                    Some(_) => {
                        one_before.clone()
                    },
                    None => {
                        one_before =line;
                        continue;
                    }
                }
            },
            None => {
                continue
            }
        };
        return match regex3.find(&*raw_event_file) {
            Some(x) => {
                Ok(format!("/dev/input/{}",x.as_str().to_string()))
            },
            None => {Err(io::Error::new(ErrorKind::Other, "No keyboard found"))}
        }
    }
    Err(io::Error::new(ErrorKind::Other, "No match for keybind found"))
}

pub fn cli_find_kb() -> String {
    let auto = match find_auto_keyboard(){
        Ok(x) => {
            println!("Keyboard automatically found : {}", x.clone());
            x
        }
        Err(_) => {"".to_string()}//do nothing but maybe log in the future
    };
    return match retrieve_from_io("Enter nothing to use the automatically found path \
             or enter the path of your keyboard").as_str() {
        "" => auto,
        y => y.to_string()
    }
}