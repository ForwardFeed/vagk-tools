# VAGK bashlink
A bash code generator in bash for my [(very advanced) global keybind](https://github.com/ForwardFeed/vagk) daemon for linux desktop

### Why
I made a project in rust called vagk that recogize keyboard key patterns and eject in stdout when a match specified in its own config file occurs. But to link it to actual use (for example executing a code after), i was doing my own manual bash script code, and it was annoying.

### How to use it

- Get [vagk](https://github.com/ForwardFeed/vagk) to work  
- Generate a config with the -g
- Clone this tool
- In this tool directory, generate a link to the vagk executable `ln -s path/vagk ./vagk`
- Do `./main.sh` with your config file freshly generated as first parameters
    - for example `./main.sh my_config.ron`     
- It will ask in the prompt for the name of the output file, which will be a bash executable
- Then you have executable that is way more easy to fill with commands

#### Example of what script can be easely be made
```bash
#!/bin/bash
### FUNCTIONS TO FILL

autowalk(){
    xdotool keydown w
}

holdclick(){
    xdotool mousedown 1 
}

spamclick(){
    while : do; xdotool click 1; sleep 1; done
}
### MAIN FUNCTION

read -r -a ALL_KBD <<< "autowalk holdclick spamclick"

while read -r line; do
    for KB in "${ALL_KBD[@]}"; do
        [ "$line" == "$KB" ] && eval "$KB"
    done
done < <(./vagk -c macro-config.ron)
```
ofc i use this as a commodity for ungrateful tasks during some gameplay experience 