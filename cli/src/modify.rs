use std::fs::File;
use std::io;
use crate::config_loader::Config;
use crate::generate::retrieve_from_io;

pub struct Modify{
    config: Config
}

impl Modify {
    pub fn new(config: Config) -> Modify{
        Modify{
            config
        }
    }
    pub fn print_config(&self){
        println!("\x1b[34mKeyboard event {}\x1b[0m",self.config.general_parameters.event_path);
        for keybind in &self.config.keybinds{
            println!("\x1b[32mKeybind Name  {}\x1b[0m",keybind.name);
            println!("\x1b[32mKeybind Time Threshold  {}\x1b[0m",keybind.timer_threshold);
            let mut invert = false; // to alternate colors
            for sub_keybind in &keybind.sub_keybinds{
                let color= match invert{
                    true =>  {
                        "\x1b[0;36m" //purple
                    },
                    false =>{
                        "\x1b[0;35m" //cyan
                    }
                };
                println!("      {}key_code :{}\x1b[0m",color, sub_keybind.key_code);
                println!("      {}key_state :{}\x1b[0m",color, sub_keybind.keybind_type);
                println!("      {}mkey_state :{:?}\x1b[0m",color, sub_keybind.key_state);
                invert = !invert;
            }
        }
    }
    pub fn change_event_path(&mut self){
        loop{
            let x= retrieve_from_io("What's the path of the keyboard event?");

        }

    }
    pub fn add_keybind(&mut self){

    }
    pub fn remove_keybind(){

    }
    pub fn change_name(){

    }
    pub fn change_timer_threshold(){

    }
    pub fn change_sub_keybinds(){

    }
    pub fn change_lngprss_duration(){

    }
    pub fn change_spam_p_timespan(){

    }
    pub fn change_spam_p_repetition(){

    }
}

fn open_event_file(event_file: String) -> Result<File, io::Error> {
    let file = File::open(event_file.clone());
    match file {
        Ok(file) => return Ok(file),
        Err(e) => return Err(e),
    };
}
