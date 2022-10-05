var LastNodeClicked; // to help the side edit panel to know which was was it
var SideCanvas
var EventPath


function RegisterButtons() {

  let open_button = document.getElementById("open")
  open_button.addEventListener("change", function(event){
    let file = event.target.files[0]
    OpenFile(file)
  })

  let add_button = document.getElementById("add")
  add_button.addEventListener("click", function(){
    AddKeybindDefault()
  })
  let delete_button = document.getElementById("delete")
  delete_button.addEventListener("click", function(){
    DeleteKeybind()
  })
  let clone_button = document.getElementById("clone")
  clone_button.addEventListener("click", function(){
    CloneKeybind()
  })
  let save_button = document.getElementById("save")
  save_button.addEventListener("click", function(){
    let json
    try {
      json=ContentToJson()
      SaveJson(json)
    } catch (e) {
      console.error("Error in content, couldn't save");
    }finally{

    }

  })
  let check_button = document.getElementById("check")
  check_button.addEventListener("click", function(){
    let json
    try {
      json=ContentToJson()
    } catch (e) {
      console.error(e);
    }
    CheckShowError(Check(json))
  })

  let new_button = document.getElementById("new")
  new_button.addEventListener("click", function(){
    WarningClickNew()
  })

  let search_button = document.getElementById("search")
  search_button.addEventListener("click", function(){
    Search()
  })

  let change_event_path = document.getElementById("button-event-path")
  change_event_path.addEventListener("click", function(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/event_path", [true,,])
    xhr.send();
    xhr.onload = function() {
      if (xhr.status != 200) { // analyze HTTP status of the response
        //error
      } else { // show the result
        json = JSON.parse(xhr.response)
        let inputBar = document.getElementById("event-path")
        if (json.validity){
          inputBar.innerHTML = json.event_path
        }else {
          inputBar.innerHTML = "couldn't find automatically the path"
        }
      }
    };
    xhr.onerror = function() {
      console.error("Server didn't answered");
    };
  })
}

function RegisterSideFocus(node) {
  node.addEventListener("click", function(event){
    let nodeclicked = event.target
    for (let j=0; j<5;j++) {//5 max iteration or else something is wrong but i choose to consider it unlikely
      if (nodeclicked.className == "keybind"){
        LastNodeClicked=nodeclicked
        break
      }
      nodeclicked=nodeclicked.parentNode
    }
    SideCanvas.innerHTML= node.innerHTML;
    let selects = SideCanvas.getElementsByClassName("select-keytype")
    for (let j=0; j<selects.length; j++){
      selects[j].addEventListener("change", function(event){
        ApplyRightSelect(event.target, event.target.value)
        let newKeyType = event.target.value
        let keyTypeNodes = event.target.parentNode.parentNode.getElementsByClassName("key-state")[0]
        ChangeKeyTypeVisibility(keyTypeNodes, newKeyType)
        event.preventDefault()
      })
    }
    let button_SKB = SideCanvas.getElementsByClassName("add-subkeybind")[0]
    button_SKB.addEventListener("click", function(event){
      SideCanvas.getElementsByClassName("sub_keybinds")[0].appendChild(AddSubKeybindDefault())
      event.preventDefault()
    })
    MakeItEditable(SideCanvas)
    event.preventDefault();
  })

  SideCanvas.addEventListener("click", function(event) {
    LastNodeClicked.innerHTML=SideCanvas.innerHTML;
    MakeItEditable(LastNodeClicked, "false")
  })
}

function RegisterKeyTypeChange(node) {
  let keytypes = node.getElementsByClassName("select-keytype")
  for(let i=0; i<keytypes.length; i++){
    keytypes[i].addEventListener("change", function(event){
      ApplyRightSelect(event.target, event.target.value)
      let newKeyType = event.target.value
      let keyTypeNodes = event.target.parentNode.parentNode.getElementsByClassName("key-state")[0]
      ChangeKeyTypeVisibility(keyTypeNodes, newKeyType)
      event.preventDefault();
    })
  }
}

function ChangeKeyTypeVisibility(keyTypeNodes, newKeyType) {
  if (keyTypeNodes == null || newKeyType == null) {
    return
  }

  let longpress = keyTypeNodes.getElementsByClassName("longpress")
  let spampress = keyTypeNodes.getElementsByClassName("spampress")

  if(newKeyType == "Simple key down" || newKeyType == "Simple key release"){
    for (let j=0; j< longpress.length; j++){
      longpress[j].hidden = true;
    }
    for (let j=0; j< spampress.length; j++){
      spampress[j].hidden = true;
    }
  }else if (newKeyType == "Long press") {
    for (let j=0; j< longpress.length; j++){
      longpress[j].hidden = false;
    }
    for (let j=0; j< spampress.length; j++){
      spampress[j].hidden = true;
    }
  }else if(newKeyType == "Spam press"){
    for (let j=0; j< longpress.length; j++){
      longpress[j].hidden = true;
    }
    for (let j=0; j< spampress.length; j++){
      spampress[j].hidden = false;
    }
  }
}

// param, search in the node for buttons getKey
function RegisterGetKey(node) {
  let buttons = node.getElementsByClassName("get-key")
  for(let i=0; i< buttons.length; i++){
    buttons[i].addEventListener("click", function(){
      let xhr = new XMLHttpRequest();
      xhr.open("GET", "/last_key", [true,,])
      xhr.send();
      buttons[i].innerHTML = "PRESS KEY"
      xhr.onload = function() {
        buttons[i].innerHTML = "CHANGE"
        if (xhr.status != 200) { // analyze HTTP status of the response
          //error
        } else { // show the result
          let json = JSON.parse(xhr.response)
          let field = buttons[i].parentNode.getElementsByClassName("skb-keycode")[0]
          if (json.validity) {
            if (json.keycode != 0) {
              field.innerHTML = json.keycode
            }
            else{
              field.innerHTML = ""
            }
          }else{
            PopErrorDiv(buttons[i].parentNode, "Couldn't find a keyboard")
          }

        };
        xhr.onerror = function() {
          console.error("Server didn't answered");
        };
      }

    })
  }
}
function MakeItEditable(node, flag) {
  if (flag == undefined) {
    flag=true
  }
  let fields=node.getElementsByClassName("field")
  for(let i=0; i<fields.length; i++){
    let field = fields[i].getElementsByClassName("field-content")
    for (let j = 0; j < field.length; j++) {
      field[j].setAttribute("contenteditable", flag)
    }
  }
  let selector=node.getElementsByClassName("select-keytype")
  for(let i=0; i<selector.length; i++){
    if(flag == true){
      selector[i].removeAttribute("disabled")
    }else{
      selector[i].setAttribute("disabled", "")
    }
  }
  let buttons=node.getElementsByClassName("hide-button")
  for (let i = 0; i < buttons.length; i++) {
    if(flag == true){
      buttons[i].removeAttribute("hidden")
    }else{
      buttons[i].setAttribute("hidden", "")
    }
  }
  let errorDiv = node.getElementsByClassName("error-notif")
  for (let i = 0; i < errorDiv.length; i++) {
    if(flag == true){
      errorDiv[i].removeAttribute("hidden")
    }else{
      errorDiv[i].setAttribute("hidden", "")
    }
  }
  RegisterGetKey(node)
}


//will search in the node
//option is one of the option html text
function RightSelect(node, option) {
  if(option == null){
    return
  }

  if (node == null) {
    return
  }
  else if(node.className != "select-keytype"){
    let selectnode = node.getElementsByClassName("select-keytype")
    for(let i=0; i<selectnode.length ;i++){
      ApplyRightSelect(selectnode[i], option)
    }
  }else{
    ApplyRightSelect(node, option)
  }
}

function ApplyRightSelect(node, option) {
  let options = node.getElementsByTagName("option")
  for(let i=0; i< options.length; i++){
    options[i].removeAttribute("selected")
    if(options[i].innerHTML == option){
      options[i].setAttribute("selected", "")
    }
  }
}

function ShowKeytypeSelection(node){
  let keytypes = node.getElementsByClassName("select-keytype")
  for(let i=0; i<keytypes.length; i++){
    let newKeyType = keytypes[i].value
    let keyTypeNodes = keytypes[i].parentNode.parentNode.getElementsByClassName("key-state")
    for(let k=0; k<keyTypeNodes.length; k++){
      let longpress = keyTypeNodes[k].getElementsByClassName("longpress")
      let spampress = keyTypeNodes[k].getElementsByClassName("spampress")

      if(newKeyType == "Simple key down" || newKeyType == "Simple key release"){
        for (let j=0; j< longpress.length; j++){
          longpress[j].hidden = true;
        }
        for (let j=0; j< spampress.length; j++){
          spampress[j].hidden = true;
        }
      }else if (newKeyType == "Long press") {
        for (let j=0; j< longpress.length; j++){
          longpress[j].hidden = false;
        }
        for (let j=0; j< spampress.length; j++){
          spampress[j].hidden = true;
        }
      }else if(newKeyType == "Spam press"){
        for (let j=0; j< longpress.length; j++){
          longpress[j].hidden = true;
        }
        for (let j=0; j< spampress.length; j++){
          spampress[j].hidden = false;
        }
      }
    }
  }
}

function AddKeybind(keybind){
  let x = document.createElement("div")
  x.setAttribute('class', 'keybind')
  x.innerHTML='<div class="field">\
    <label for="aligned-name">Keybind name:</label>\
    <span class="field-content kb-name" contenteditable=true>'+keybind["name"]+'</span>\
  </div>\
  <div class="field">\
    <label class="field-name">Timer threshold:</label>\
     <span class="field-content kb-timer" contenteditable=false>'+keybind["timer_threshold"]+'</span>\
  </div>\
  <button class="pure-button hide-button add-subkeybind">ADD SUB KEYBIND</button>'
  x.appendChild(AddSubKeybind(keybind["sub_keybinds"]))
  let canvas = document.getElementById("keybinds")
  ShowKeytypeSelection(x)
  RegisterKeyTypeChange(x)
  RegisterSideFocus(x)
  MakeItEditable(x, false)
  canvas.appendChild(x)

}

function AddSubKeybind(sub_keybinds) {
  let div_skbs = document.createElement("div")
  div_skbs.setAttribute('class', 'sub_keybinds')
  let toSelect=""
  for(let j=0; j<sub_keybinds.length; j++){
    let sub = sub_keybinds[j]
    toSelect = sub["keybind_type"]
    if(toSelect=="spampress"){
      toSelect="Spam press"
    }else if(toSelect=="longpress"){
      toSelect="Long press"
    }else if(toSelect=="simple"){
      if(sub["key_state"]["key_value"] == 1){
        toSelect="Simple key down"
      }else{
        toSelect="Simple key release"
      }
    }
    let skb = document.createElement("div")
    skb.setAttribute('class', 'sub_keybind')
    let keycode = sub["key_code"]
    let spam_press_time_span = sub["key_state"]["spam_press_time_span"]
    let repetition = sub["key_state"]["repetition"]
    let press_duration = sub["key_state"]["press_duration"]

    skb.innerHTML='<div class="field">\
      <label class="field-name">Keycode:</label>\
      <span class="field-content skb-keycode" contenteditable=false>'+keycode+'</span>\
      <button class="pure-button right-button hide-button get-key">CHANGE</button>\
    </div>\
    <div class="field">\
      <label class="field-name">Keybind type:</label>\
      <select class="select-keytype" disabled="true">\
        <option>Simple key down</option>\
        <option>Simple key release</option>\
        <option>Long press</option>\
        <option>Spam press</option>\
      </select>\
    </div>\
    <div class="key-state">\
      <div class="field spampress">\
        <label class="field-name">Spam press time span (in milliseconds):</label>\
         <span class="field-content ks-spamtime" contenteditable=false>'+spam_press_time_span+'</span>\
      </div>\
      <div class="field spampress">\
        <label class="field-name">Repetition:</label>\
         <span class="field-content ks-num" contenteditable=false>'+repetition+'</span>\
      </div>\
      <div class="field longpress">\
        <label class="field-name">length of key pressing (in milliseconds):</label>\
         <span class="field-content ks-longtime" contenteditable=false>'+press_duration+'</span>\
      </div>\
    </div>'
    RightSelect(skb,toSelect)
    div_skbs.appendChild(skb)
  }
  return div_skbs

}

function AddKeybindDefault(){
  let x = document.createElement("div")
  x.setAttribute('class', 'keybind')
  x.innerHTML='<div class="field">\
    <label for="aligned-name">Keybind name:</label>\
    <span class="field-content kb-name" contenteditable=false></span>\
  </div>\
  <div class="field">\
    <label class="field-name">Timer threshold:</label>\
     <span class="field-content kb-timer" contenteditable=false></span>\
  </div>\
  <button class="pure-button hide-button add-subkeybind">ADD SUB KEYBIND</button>\
  <div class="sub_keybinds">\
    <div class="sub_keybind">\
      <div class="field">\
        <label class="field-name">Keycode:</label>\
        <span class="field-content skb-keycode" contenteditable=false></span>\
        <button class="pure-button right-button hide-button get-key">CHANGE</button>\
      </div>\
      <div class="field">\
        <label class="field-name">Keybind type:</label>\
        <select disabled class="select-keytype">\
          <option selected>Simple key down</option>\
          <option>Simple key release</option>\
          <option>Long press</option>\
          <option>Spam press</option>\
        </select>\
      </div>\
      <div class="key-state">\
        <div class="field spampress">\
          <label class="field-name">Spam press time span (in milliseconds):</label>\
           <span class="field-content ks-spamtime" contenteditable=false></span>\
        </div>\
        <div class="field spampress">\
          <label class="field-name">Repetition:</label>\
           <span class="field-content ks-num" contenteditable=false></span>\
        </div>\
        <div class="field longpress">\
          <label class="field-name">length of key pressing (in milliseconds):</label>\
           <span class="field-content ks-longtime" contenteditable=false></span>\
        </div>\
      </div>\
    </div>\
  </div>'
  RightSelect(x, "Simple key down")
  ShowKeytypeSelection(x)
  RegisterKeyTypeChange(x)
  RegisterSideFocus(x)
  MakeItEditable(x, false)
  document.getElementById("keybinds").appendChild(x)
}

// return node of a subkeybind
function AddSubKeybindDefault() {
  node = document.createElement("div")
  node.setAttribute('class', 'sub_keybind')
  node.innerHTML = '<div class="field">\
    <label class="field-name">Keycode:</label>\
    <span class="field-content skb-keycode" contenteditable=false></span>\
    <button class="pure-button right-button hide-button get-key">CHANGE</button>\
  </div>\
  <div class="field">\
    <label class="field-name">Keybind type:</label>\
    <select disabled class="select-keytype">\
      <option selected>Simple key down</option>\
      <option>Simple key release</option>\
      <option>Long press</option>\
      <option>Spam press</option>\
    </select>\
  </div>\
  <div class="key-state">\
    <div class="field spampress">\
      <label class="field-name">Spam press time span (in milliseconds):</label>\
       <span class="field-content ks-spamtime" contenteditable=false></span>\
    </div>\
    <div class="field spampress">\
      <label class="field-name">Repetition:</label>\
       <span class="field-content ks-num" contenteditable=false></span>\
    </div>\
    <div class="field longpress">\
      <label class="field-name">length of key pressing (in milliseconds):</label>\
       <span class="field-content ks-longtime" contenteditable=false></span>\
    </div>\
  </div>'
  RightSelect(node, "Long press")
  ShowKeytypeSelection(node)
  RegisterKeyTypeChange(node)
  // RegisterSideFocus(node)
  RegisterGetKey(node)
  MakeItEditable(node, true)
  return node
}

function DeleteKeybind() {
  LastNodeClicked.innerHTML=""
  SideCanvas.innerHTML=""
}

function CloneKeybind() {
  if (SideCanvas.children.length == 0) {
    //empty side pannel, ignore
    return
  }
  let x = document.createElement("div")
  x.removeAttribute('class', 'editable-keybind')
  x.setAttribute('class', 'keybind')
  x.innerHTML=SideCanvas.innerHTML
  MakeItEditable(x, "false")
  RegisterKeyTypeChange(x)
  RegisterSideFocus(x)
  document.getElementById("keybinds").appendChild(x)
}

function OpenFile(file){
  let fr = new FileReader()

  fr.readAsText(file);
  fr.addEventListener('load', (event) =>{
    let json = JSON.parse(fr.result);
    ParseFile(json)
  })
  event.preventDefault()
}

function ParseFile(json){
  //Clean the canvas and SideCanvas
  SideCanvas.innerHTML=""
  document.getElementById("keybinds").innerHTML=""
  EventPath.innerHTML=json["general_parameters"].event_path
  for (let i =0; i<json["keybinds"].length;i++){
  AddKeybind(json["keybinds"][i]);
  }
}


function SaveJson(json){
  var bb = new Blob([JSON.stringify(json, 0, 2)], { type: 'text/json' });
  var a = document.createElement('a');
  a.download = 'macro-config.json';
  a.href = window.URL.createObjectURL(bb);
  a.click();
}

//return json object of the content in the canvas
function ContentToJson(){
  let json = {}
  json["general_parameters"] = {}
  json["general_parameters"]["event_path"] = document.getElementById("event-path").innerHTML
  let keybinds = document.getElementById("keybinds").getElementsByClassName("keybind")
  json["keybinds"] = []
  for (let i = 0; i < keybinds.length ; i++){
    json["keybinds"][i] = {}
    json["keybinds"][i]["name"]= document.getElementById("keybinds").getElementsByClassName("kb-name")[i].innerHTML
    json["keybinds"][i]["timer_threshold"]=Number(document.getElementById("keybinds").getElementsByClassName("kb-timer")[i].innerHTML)

    json["keybinds"][i]["sub_keybinds"] = []
    let sub_keybinds = keybinds[i].getElementsByClassName("sub_keybinds")[0].getElementsByClassName("sub_keybind")
    for(let j=0; j< sub_keybinds.length; j++){
      json["keybinds"][i]["sub_keybinds"][j] = {}
      json["keybinds"][i]["sub_keybinds"][j]["key_code"] = Number(sub_keybinds[j].getElementsByClassName("skb-keycode")[0].innerHTML)
      // key States
      json["keybinds"][i]["sub_keybinds"][j]["key_state"]={}
      let keytype = sub_keybinds[j].getElementsByClassName("select-keytype")[0].value
      if(keytype=="Spam press"){
        keytype="spampress"
        json["keybinds"][i]["sub_keybinds"][j]["key_state"]["spam_press_time_span"] = Number(sub_keybinds[j].getElementsByClassName("ks-spamtime")[0].innerHTML)
        json["keybinds"][i]["sub_keybinds"][j]["key_state"]["repetition"] = Number(sub_keybinds[j].getElementsByClassName("ks-num")[0].innerHTML)
      }else if(keytype=="Long press"){
        json["keybinds"][i]["sub_keybinds"][j]["key_state"]["press_duration"] = Number(sub_keybinds[j].getElementsByClassName("ks-longtime")[0].innerHTML)
        keytype="longpress"
      }else if(keytype=="Simple key down"){
          keytype="simple"
          json["keybinds"][i]["sub_keybinds"][j]["key_state"]["key_value"] = 1
      }else if(keytype=="Simple key release"){
          keytype="simple"
          json["keybinds"][i]["sub_keybinds"][j]["key_state"]["key_value"] = 0
      }else{
        // DEFAULT !!!
        keytype="simple"
        json["keybinds"][i]["sub_keybinds"][j]["key_state"]["key_value"] = 1
      }
      json["keybinds"][i]["sub_keybinds"][j]["keybind_type"] = keytype
    }
  }
  return json
}

//return an object
// if validity = true => it's good
// if validity = false => check the errors it's bad
// desc => the quick description of the error
// kb-b => keybind number of the error
// skb-n => sub_keybind numer of the error
function Check(json) {
  let keybind = -1
  let sub_keybind = -1
  try{
    if(! json["general_parameters"]["event_path"]) throw "event_path undefined"
    if(json["general_parameters"]["event_path"] == "/dev/inputX") throw "event_path default"
    if(json["keybinds"].length < 1) throw "no keybinds"
    for(keybind = 0; keybind<json["keybinds"].length; keybind++){
      if(!json["keybinds"][keybind]["name"]) throw "keybind not named"
      if(!json["keybinds"][keybind]["timer_threshold"]) throw "keybind without time threshold"
      if(isNaN(json["keybinds"][keybind]["timer_threshold"])) throw "timer_threshold is not an int"
      if(json["keybinds"][keybind]["sub_keybinds"].length < 1) throw "no sub_keybind"
      for(sub_keybind = 0;sub_keybind<json["keybinds"][keybind]["sub_keybinds"].length; sub_keybind++){
        if(!json["keybinds"][keybind]["sub_keybinds"][sub_keybind]["key_code"]) throw "no key_code"
        if(isNaN(json["keybinds"][keybind]["sub_keybinds"][sub_keybind]["key_code"])) throw "key_code not an int"

        let keyType = json["keybinds"][keybind]["sub_keybinds"][sub_keybind]["keybind_type"]
        let keyState = json["keybinds"][keybind]["sub_keybinds"][sub_keybind]["key_state"]
        if(! keyType ) throw "keybind type not found"
        if(! keyState ) throw "keybind type not found"
        if( keyType == "simple"){
          if(! keyState["key_value"]) throw "key value missing"
        }else if (keyType == "longpress"){
          if(! keyState["press_duration"] ) throw "press duration value missing"
          if(isNaN(keyState["press_duration"])) throw "press duration value not valid"
        }else if (keyType == "spampress"){
          if(! keyState["repetition"]) throw "repetition value missing"
          if(isNaN(keyState["repetition"])) throw "repetition value not valid"
          if(! keyState["spam_press_time_span"]) throw "press timespan value missing"
          if(isNaN(keyState["spam_press_time_span"])) throw "press timespan value not valid"
        }else throw "keybind type not recognized"

      }
    }
  }
  catch(err){
    return {"validity" : false, "desc" : err, "kb-n": keybind, "skb-n": sub_keybind }
  }
  return {"validity" : true}
}

// param err is the same time that the function Check return whens it detected an error
function CheckShowError(err) {
  if(err["validity"]){
    //show it's correct
    actualizeValidity(true)
    return //no problems detected
  }
  //show it's error
  actualizeValidity(false)

  //some variables i might need
  let allKB = document.getElementById("keybinds").getElementsByClassName("keybind")

  //specifics errors
  if (err["desc"] == "event_path undefined"){
    let div = document.getElementById("event-path").parentNode
    PopErrorDiv(div, "Must be filled")
  }
  else if (err["desc"] == "event_path default"){
    let div = document.getElementById("event-path").parentNode
    PopErrorDiv(div, "It's the default value")
  }
  else if (err["desc"] == "no keybinds"){
    let div = document.getElementById("keybinds")
    PopErrorDiv(div, "no keybinds found")
  }
  else if (err["desc"] == "") {
    //u wot m8?
    console.log("u wot m8");
  }
  else if (err["skb-n"] == -1){
    PopErrorDiv(  allKB[err["kb-n"]].parentNode, err["desc"])
  }
  else{
    let allSKB = allKB[err["kb-n"]].getElementsByClassName("sub_keybind")
    console.log(err);
    PopErrorDiv(  allSKB[err["skb-n"]].parentNode, err["desc"])
  }
}

function actualizeValidity(flag) {
  //remove all divs with the "error-notif" class
  let notifs = document.getElementsByClassName("error-notif")
  for (let i = 0; i < notifs.length; i++) {
    notifs[i].parentNode.removeChild(notifs[i])
  }
  //colorize the button check
  let button = document.getElementById("check")
  if (flag) {
    button.style.background = "green"
  }else{
    button.style.background = "red"
  }
}

// 1rst param => node to apply
// 2nd param => error message to show
function PopErrorDiv(node, msg) {
  //check before to no reapply an already made message
  let alreadyMade = node.getElementsByClassName("error-notif")
  for (let i = 0; i < alreadyMade.length; i++) {
    if (alreadyMade[i].innerHTML==msg) {
      return//no duplicate
    }
  }

  let errorDiv = document.createElement("div")
  errorDiv.className = "error-notif"
  errorDiv.innerHTML = msg
  node.insertBefore(errorDiv, node.firstChild)
}

function WarningClickNew() {
  let div = document.getElementById("new")
  let yes = document.createElement("div")
  yes.innerHTML = '<button class="pure-button" action="YesNew">YES</button>'
  yes.addEventListener("click", function(event){
    YesNew()
    event.stopPropagation()
  })

  let no = document.createElement("div")
  no.innerHTML = '<button class="pure-button"> NO, it was a misslick</button>'
  no.addEventListener("click", function(event){
    NoNew()
    event.stopPropagation()
  })

  div.innerHTML = '<p> ARE YOU SURE ?</p>'

  div.appendChild(yes)
  div.appendChild(no)
}

function YesNew() {
  document.getElementById("new").innerHTML = '<p>NEW</p>'
  document.getElementById("keybinds").innerHTML = ''
  document.getElementById("side-canvas").innerHTML = ''
}

function NoNew() {
  document.getElementById("new").innerHTML = '<p>NEW</p>'
}

function Search() {
  let div = document.getElementById("search")
  //if the input text is there close it
  if (div.getElementsByClassName("search-input").length > 0){
    div.innerHTML= '<p>SEARCH</p>'
    return
  }
  div.innerHTML= ''
  let searchbar = document.createElement("input")
  searchbar.setAttribute("type", "text")
  searchbar.setAttribute("class", "search-input")
  searchbar.addEventListener("click", function(event){
    event.stopPropagation()
  })
  searchbar.addEventListener("input", function(event) {
    if (! TypeInSearchBar(event.target.value)){
      event.target.value= event.target.value.slice(0, -1)
    }
  })
  div.appendChild(searchbar)
}

function TypeInSearchBar(value) {
  let nameFields = document.getElementById("keybinds").getElementsByClassName("kb-name")
  let split = value.split('')
  let textRegex = ""
  for (let i = 0; i < split.length; i++) {
    if(split[i].match(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi)){
      return false //bad input erase it
    }else if (textRegex.match(split[i])) {
      continue // no need to add a duplicate to the regex
    }
    textRegex += "("+split[i]+")+"
  }
  const searchRegex = new RegExp(textRegex);
  for (let i = 0; i < nameFields.length; i++) {
    if(searchRegex.exec(nameFields[i].innerHTML.toLowerCase())){
      nameFields[i].parentNode.parentNode.removeAttribute("hidden")
    }
    else {
      nameFields[i].parentNode.parentNode.setAttribute("hidden", "")
    }
  }
  return true
}


//Onload setup
document.addEventListener("DOMContentLoaded", () => {
  SideCanvas = document.getElementById("side-canvas")
  EventPath = document.getElementById("event-path")
  RegisterButtons()
});
