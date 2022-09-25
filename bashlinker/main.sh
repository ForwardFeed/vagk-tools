#!/bin/bash

### MAIN VARIABLE

#All_keybinds
ALL_KBD=
#Config File
CFG_F=
#Output File 
OUT_F=




### SAFE CHECKS

if [ ! -f "vagk" ]
then
	echo "Couldn't find a file, supposedly a executable called vagk"
	echo "Take note that, it is required to have the vagk executable
Or i suggest a link which is idiomatically better, in the active director
"
fi

CFG_F=$1
if [ -z "$CFG_F" ] 
then 
	echo "config file not set, using macro-config.ron as default
"
	CFG_F="macro-config.ron"
fi

if [ ! -f "$CFG_F" ]
then
	echo "couldn't find "$CFG_F" : exiting..."
	exit
fi

### FUNCTIONS

# parse all keybinds found in the config file
# $1 => None
ParseConfig(){
	ALL_KBD=($(grep -Po "name: \"\K[^\"]+" "$CFG_F"))

}

# check if ParseConfig function worked well, else exit
CheckParsedConfig(){
	if [ "${#ALL_KBD[@]}" -eq 0 ]
	then
		echo "config empty of keybind, exiting"
		exit
	fi
}

#insert text into the output file
ITF(){
	[ -z "$1" ] || [ -z "$OUT_F" ] && return
	echo "$@" >> "$OUT_F"
}

# create the file that wrap the vagk config
CreateBaseFile(){
	while : ; do
		read -p "What's the name of the output file?: " user_input
		[ -z "$user_input" ] || OUT_F="$user_input" && break
	done
	echo "#!/bin/bash" > "$OUT_F"
	chmod u+x "$OUT_F"
}

# Generate all function that are linked to the program
# For each keybind in the program, there will be a function associated
GenAllFunc(){
	ITF "### FUNCTIONS TO FILL"
	for KB in "${ALL_KBD[@]}"; do
	ITF "
"$KB"(){
echo "$KB"
}"
	done
}

# generate the code that will link each name of func to funcs

GenMainFunc(){
	ITF "### MAIN FUNCTION"
	ITF "
read -r -a ALL_KBD <<< \""${ALL_KBD[@]}"\"

while read -r line; do
	for KB in \"\${ALL_KBD[@]}\"; do
		[ \"\$line\" == \"\$KB\" ] && eval \"\$KB\"
	done
done < <(./vagk)
"
}

### MAIN

ParseConfig
CheckParsedConfig
CreateBaseFile
GenAllFunc
GenMainFunc
