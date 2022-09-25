
use regex::Regex;
use std::io::ErrorKind;
use std::fs::File;
use std::io::{self, prelude::*, BufReader};

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
