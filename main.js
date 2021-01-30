//#region variables

const myDisplay = document.getElementById("myMainDisplay");
const myHolders = document.getElementsByClassName("holder");
const mySpeakerBox = document.getElementById("mySpeakerBox");
const myRotSpeedInput = document.getElementById("myRotationSpeed");
const mySpkSpeedInput = document.getElementById("mySpeakingSpeed");
const utterance = new SpeechSynthesisUtterance()

var holderIndex = -1; //index of the holder array
var elementIndex = -1; //index of the array of elements inside of the holder
var rotationSpeed = 1;  //the time it takes to go to the next selection;
var speakingSpeed = 1;     //how fast the speaker talks.
var speaking = false;   

let lastTimeStamp = 0;
let tempDisplay;
let eleArr;
let holderSelected = false;
let lastSelected;

//#endregion

//#region event listeners
utterance.addEventListener("end", () =>{
    speaking = false;
})

myRotSpeedInput.addEventListener('input', () => {
    document.getElementById("displayRotSpeed").innerText = String(myRotSpeedInput.value) + "%";
    rotationSpeed = myRotSpeedInput.value/100;
    if(checkCookie("useCookie"))
        setCookie("rotSpeed", myRotSpeedInput.value);
})

mySpkSpeedInput.addEventListener('input', () => {
    document.getElementById("displaySpkSpeed").innerText = String(mySpkSpeedInput.value) + "%";
    if(checkCookie("useCookie"))
        setCookie("spkSpeed", mySpkSpeedInput.value);
})

document.getElementById("useCookies").addEventListener('click', () => {
    if(document.getElementById("useCookies").checked)
        saveCookies();
    else
        deleteCookies();
})

document.getElementById("reset").addEventListener('input', () => {
    if(checkCookie("useCookie"))
        setCookie("reset", document.getElementById('reset').checked ? "1": "0");
})

document.getElementById("myInputBox").addEventListener('click', () => {
    window.requestAnimationFrame(onInput);
})

document.getElementById("voiceSelect").addEventListener('change', changeVoice);

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
        populateVoiceList("en");
        if(checkCookie("voiceIndex"))
        {
            let c = parseInt(getCookie("voiceIndex"));
            document.getElementById("voiceSelect").selectedIndex = c;
            changeVoice();
        }
    }
  }

//input handler
document.body.onkeyup = function(e)
{
    if(e.keyCode == 32)
    {
        window.requestAnimationFrame(onInput);
    }
}
//#endregion

//#region functions

function loadCookies()
{
    if(checkCookie("useCookie"))
    {
        document.getElementById("useCookies").checked = true;
        if(checkCookie("rotSpeed"))
        {
            let c = getCookie("rotSpeed")
            rotationSpeed = parseInt(c)/100;
            myRotSpeedInput.value = parseInt(c);
            document.getElementById("displayRotSpeed").innerText = c + "%";
        }

        if(checkCookie("spkSpeed"))
        {
            let c = getCookie("spkSpeed")
            mySpkSpeedInput.value = parseInt(c);
            document.getElementById("displaySpkSpeed").innerText = c + "%";
        }

        if(checkCookie("reset"))
        {
            let c = getCookie("reset");
            document.getElementById('reset').checked = (c == "1");
        }
    }
}

function saveCookies()
{
    setCookie("useCookie", "1");
    setCookie("rotSpeed", myRotSpeedInput.value);
    setCookie("spkSpeed", mySpkSpeedInput.value);
    setCookie("reset", document.getElementById('reset').checked ? "1": "0");
    setCookie("voiceIndex", document.getElementById("voiceSelect").selectedIndex)
}

function deleteCookies()
{
    deleteCookie("useCookie");
    deleteCookie("rotSpeed");
    deleteCookie("spkSpeed");
    deleteCookie("reset");
    deleteCookie("voiceIndex")
}

/**
 * Returns an array of html elements that can be selected by the speaker
 *
 * @param {Object} holder the html element that holds the selectable elements
 * @return {Object} returns an array of html elements that can be selected
 */
function getSelectable(holder)
{
    return holder.getElementsByClassName("element");
}

function populateVoiceList(langAB) {
    if(typeof speechSynthesis === 'undefined') {
      return;
    }
  
    var voices = speechSynthesis.getVoices();

    document.getElementById("voiceSelect").innerHTML = "";
  
    for(var i = 0; i < voices.length; i++) {
        if(voices[i].lang.includes(langAB))
        {
            var option = document.createElement('option');
            option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
  
            option.setAttribute('data-lang', voices[i].lang);
            option.setAttribute('data-name', voices[i].name);
            document.getElementById("voiceSelect").appendChild(option);
        }
    }
}

function changeVoice()
{
    let voiceSelect = document.getElementById("voiceSelect");
    let name = voiceSelect.options[voiceSelect.selectedIndex].getAttribute('data-name');
    let voices = speechSynthesis.getVoices();
    let index = 0;

    for(var i = 0; i < voices.length; i++)
    {
        if(voices[i].name == name)
        {
            index = i;
            break;
        }
    }

    utterance.voice = voices[index];
    utterance.lang - voices[index].lang;

    if(checkCookie("useCookie"))
        setCookie("voiceIndex", document.getElementById("voiceSelect").selectedIndex);
}

function isResetOn()
{
    return document.getElementById('reset').checked;
}

function getNextHolder()
{
    myDisplay.innerHTML = "";
    holderIndex++;
    holderIndex = holderIndex%(myHolders.length);
    tempDisplay = myHolders[holderIndex].cloneNode(true);
    myDisplay.appendChild(tempDisplay);
}

function getNextElement()
{
    if(lastSelected != undefined){
        lastSelected.classList.remove("selected");
    }
    elementIndex++;
    elementIndex = elementIndex%(eleArr.length);
    eleArr[elementIndex].classList.add("selected");
    lastSelected = eleArr[elementIndex];
}

function addToSpeakerBox(toAdd)
{
    mySpeakerBox.innerText += toAdd;
}

function playText(text) {
    speaking = true;
    utterance.text = text;
    utterance.rate = (speakingSpeed*(mySpkSpeedInput.value/100))
    return speechSynthesis.speak(utterance);
}

function onSelection()
{
    let ele = eleArr[elementIndex];
    if(ele.classList.contains("element-return")){}
    else if(ele.classList.contains("element-speak"))
    {
        playText(ele.innerText);
    }
    else
    {
        switch(ele.innerHTML)
        {
            case "\"_\"":
                mySpeakerBox.innerHTML += "&nbsp;";
                break;
            case "\".\"":
                addToSpeakerBox(".");
                break;
            case "\"'\"":
                addToSpeakerBox("'");
                break;
            case "\",\"":
                addToSpeakerBox(",");
                break;
            default:
                addToSpeakerBox(ele.innerText);
                break;
        }
    }
    ele.classList.remove("selected");
    holderSelected = false
}

function onHolderSelect()
{
    let id = tempDisplay.id;
    switch(id)
    {
        case "myBackspace":
            mySpeakerBox.innerText = mySpeakerBox.innerText.slice(0, -1);
            break;
        case "mySpeaker":
            playText(mySpeakerBox.innerText);
            mySpeakerBox.innerHTML = "";
            if(isResetOn())
                holderIndex = -1;
            break;
        default:
            holderSelected = true;
            eleArr = getSelectable(tempDisplay);
            elementIndex = -1;
            getNextElement(); 
            break;
    }
}

function onInput(timeStamp)
{
    if(speaking)
        return;
    lastTimeStamp = timeStamp;
    if(holderSelected)
    {
        onSelection();
        if(isResetOn())
            holderIndex = -1;
    }else
    {
        onHolderSelect();
    }
}

function mainLoop(timeStamp)
{

    window.requestAnimationFrame(mainLoop);
    if(speaking)
        return;
    const secondsSinceLastRender = (timeStamp - lastTimeStamp)/1000;
    if(secondsSinceLastRender < 1/rotationSpeed)
        return;
    if(holderSelected)
    {
        getNextElement();
    }
    else
    {
        getNextHolder();
    }
    lastTimeStamp = timeStamp;
}
//#endregion

populateVoiceList("en");
document.getElementById("displayRotSpeed").innerText = String(myRotSpeedInput.value) + "%";
document.getElementById("displaySpkSpeed").innerText = String(mySpkSpeedInput.value) + "%";
loadCookies();
window.requestAnimationFrame(mainLoop); 