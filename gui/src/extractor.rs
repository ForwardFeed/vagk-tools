use std::fs::File;
use std::io::Read;
use crate::input_event::InputEvent;

fn open_event_file(event_file: String) -> File {
    let file = File::open(event_file.clone());
    match file {
        Ok(file) => return file,
        Err(e) => panic!("Error while opening {} : {}",event_file, e),
    };
}

// a special KeyboardEventReader for the generate config needs
pub struct ConfigKeyboardEventReader {
    event_file: String
}

impl ConfigKeyboardEventReader {
    pub fn new(event_file: String)-> ConfigKeyboardEventReader {
        ConfigKeyboardEventReader {
            event_file,
        }
    }

    pub fn last_keycode_pressed(&mut self) -> u16{
        let mut buffer: [u8; 24] = [0; 24];
        let mut file = open_event_file(self.event_file.clone());
        loop {
            loop {
                match file.read(&mut buffer[..]).unwrap() {
                    24 => { break; }
                    _ => {}
                }
            }
            match InputEvent::from_byte(&buffer) {
                Ok(x) => {
                    if x.key_value !=1{
                        continue
                    }
                    return x.key_code;
                },
                Err(()) => continue
            }
        }
    }
}