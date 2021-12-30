const path = require('path');
const {ipcRenderer} = require('electron');

//elements
const menu_btn = document.querySelector('#menu-btn');
const profile_picture = document.querySelector('#profile-picture');

const pause_btn = document.querySelector('#pause-btn');
const prev_btn = document.querySelector('#prev-btn');
const next_btn = document.querySelector('#next-btn');

const trans_btn = document.querySelector('#translate-btn');
const trans_card = document.querySelector('.translation-card');
const trans_pull_down = document.querySelector('#translation-pull-down');

const cover = document.querySelector('#cover');
const song_data = document.querySelector('.song-data');
const title = document.querySelector('#title');
const artist = document.querySelector('#artist');

const duration_bar = document.querySelector('.duration-bar');
const empty_bar = document.querySelector('#empty-duration-bar');
const filled_bar = document.querySelector('#filled-duration-bar');
const scrubber = document.querySelector('#scrubber');

const lyrics = document.querySelector('#lyrics');
const lyrics_card = document.querySelector('.lyrics-card');
const lyrics_pull_down = document.querySelector('#lyrics-pull-down');

const lang_btn = document.querySelectorAll('.language-btn');
const not_available = document.querySelector('#not-available');
const french = document.querySelector('#french');
const korean = document.querySelector('#korean');
const english = document.querySelector('#english');
const chinese = document.querySelector('#chinese');
const japanese = document.querySelector('#japanese');
const original = document.querySelector('#original');
const romanized = document.querySelector('#romanized');
const loading_animation = document.querySelector('.loading-animation');

// Websockets
// const DOMAIN= "lyricsplayer.herokuapp.com"
const DOMAIN= "localhost:8888"
let ws = new WebSocket('ws://'+ DOMAIN);

let currentSongDetails = {is_playing: false};
let song_progress;
let user_id;
let lyricPayload;
let button_update = true;
let lyrics_card_type = null;

ipcRenderer.send('id', {});
ipcRenderer.on('id', (e,msg)=>{
    user_id = msg;

    ws.onopen = () => {
        ws.send(JSON.stringify({user_id:user_id,action:"user_id"}));
    };
    
    ws.onmessage = (event) => {
        let data = JSON.parse(event.data);
        let position = updatePlayer(data);
        //common updates
        filled_bar.style.width = `${position}px`;
        scrubber.style.left = `${position-(scrubber.offsetWidth/2)}px`;
        if (button_update && currentSongDetails.is_playing) {
            // console.log("played");
            pause_btn.src = path.join(__dirname, '/assets/Pause Button.svg');
        } else if (button_update && !currentSongDetails.is_playing) {
            // console.log("paused");
            pause_btn.src = path.join(__dirname, '/assets/Play Button.svg');
        }
    };

    ws.onclose = (e) => {
        console.log('socket closed');
    };
    ws.onerror = (e) => {
        console.log('Websocket error: '+e);
    };
});

function updatePlayer(data) {
    switch (Object.keys(data)[0]) {
        case "picture":
            profile_picture.src = data.picture;
            break;
        case "song":
            let song = data.song;
            currentSongDetails = song;
            title.textContent = song.title;
            artist.textContent = song.artist;   
            cover.src = song.image;
            loading_animation.style.display = "flex";
            lang_btn.forEach(element => element.style.display = "none");
            let position = (Number(song.progress_ms)/Number(song.duration_ms))*empty_bar.offsetWidth;
            return position;
            break;
        case "lyrics":
            lyricPayload = data.lyrics; 
            updateLyrics(lyricPayload);
            console.log(lyricPayload);
            break;
        case "update":
            let update = data.update;
            // console.log(Number(update.progress_ms)-Number(currentSongDetails.progress_ms));
            song_progress = (Number(update.progress_ms)/Number(currentSongDetails.duration_ms));
            currentSongDetails.is_playing = update.is_playing;
            currentSongDetails.progress_ms = update.progress_ms;
            return song_progress*empty_bar.offsetWidth;
            break;
        default:
            console.log("invalid data");
            break;
    } 
}

async function forceButtonPress(callback=()=>{}) {
    button_update=false;
    let loop = setInterval(callback,10);
    await new Promise(r=>setTimeout(r,700))
    clearInterval(loop);
    button_update=true;
}

function updateLyrics(lyricPayload) {
    loading_animation.style.display = "none";
    for (let language of Object.keys(lyricPayload)) {
        switch (language) {
            case "english":
                english.style.display = "flex";
                break;
            case "romanized":
                romanized.style.display = "flex";
                break;
            case "japanese":
                japanese.style.display = "flex";
                break;
            case "chinese":
                chinese.style.display = "flex";
                break;
            case "korean":
                korean.style.display = "flex";
                break;
            case "french":
                french.style.display = "flex";
                break;
            case "original":
                original.style.display = "flex";
                break;
            default:
                not_available.style.display = "flex";
                break;
        }
    }
    if (lyrics_card_type) {
        if (Object.keys(lyricPayload).includes(lyrics_card_type)) {
            lyrics.innerText = lyricPayload[lyrics_card_type];
        } else { lyrics.innerText = Object.values(lyricPayload)[0] }
    }
}

//click events
pause_btn.addEventListener('click', () => {
    if (path.basename(pause_btn.src, '.svg').toLowerCase().includes('pause')) {
        ws.send(JSON.stringify({user_id:user_id,action:"pause"}));
        forceButtonPress(() => {
            pause_btn.src = path.join(__dirname, '/assets/Play Button.svg');
            // console.log("working");
        });
    } else {
        ws.send(JSON.stringify({user_id:user_id,action:"play"}));
        forceButtonPress(() => {
            pause_btn.src = path.join(__dirname, '/assets/Pause Button.svg');
            // console.log("working");
        });
    }
});

next_btn.addEventListener('click', () => ws.send(JSON.stringify({user_id:user_id,action:"next"})));
prev_btn.addEventListener('click', () => ws.send(JSON.stringify({user_id:user_id,action:"prev"})));
trans_btn.addEventListener('click', () => {
    trans_card.style.display = 'flex';
    animate(0,(progress) => {move(trans_card,null,progress);},300);
    document.addEventListener("click", clickOff);
});
trans_pull_down.addEventListener('click', () => {
    reverse_animate(1,(progress) => {move(trans_card,null,progress);},300,() =>{
        trans_card.style.display = 'none';
    })
});
korean.addEventListener('click', () => {
    openLyricsCard();
    lyrics.innerText = lyricPayload.korean;
    lyrics_card_type = "korean";
});
english.addEventListener('click', () => {
    lyrics.innerText = lyricPayload.english;
    openLyricsCard();
    lyrics_card_type = "english";
});
chinese.addEventListener('click', () => {
    lyrics.innerText = lyricPayload.chinese;
    openLyricsCard();
    lyrics_card_type = "chinese";
});
japanese.addEventListener('click', () => {
    lyrics.innerText = lyricPayload.japanese;
    openLyricsCard();
    lyrics_card_type = "japanese";
});
romanized.addEventListener('click', () => {
    lyrics.innerText = lyricPayload.romanized;
    openLyricsCard();
    lyrics_card_type = "romanized";
});
original.addEventListener('click', () => {
    lyrics.innerText = lyricPayload.original;
    openLyricsCard();
    lyrics_card_type = "original";
});
french.addEventListener('click', () => {
    lyrics.innerText = lyricPayload.french;
    openLyricsCard();
    lyrics_card_type = "french";
});

function openLyricsCard() {
    lyrics_card.style.display = 'flex';
    animate(0,(progress) => {move(menu_btn,menu_btn_prop,progress);},300);
    animate(0,(progress) => {move(profile_picture,profile_picture_prop,progress)},300);
    if (!lyrics_card_type) {animate(0,moveAll,300, () => {
        menu_btn.style.display = 'none';
        profile_picture.style.display = 'none';
    });};
    reverse_animate(1,(progress) => {move(trans_card,null,progress)},300,() =>{
        trans_card.style.display = 'none';
    });
}

//Scaling properties
const vw = window.innerWidth;
const vh = window.innerHeight;
const cover_prop = {
    top: [150,60],
    left: [50, 0.05*vw],
    height: [300,100],
    width: [300,100],
    borderWidth: [8,4],
    boxShadow: [
        '-9px -9px 10px rgba(255, 255, 255, 0.15), 9px 9px 10px rgba(0, 0, 0, 0.5)',
        '-5px -5px 10px rgba(255, 255, 255, 0.15), 5px 5px 10px rgba(0, 0, 0, 0.5)'
    ]
};
const song_data_prop = {
    top: [525,75],
    width: [0.8*vw,0.6*vw],
    marginLeft: [0.1*vw,0.35*vw]
};
const artist_prop = {fontSize: [14,12]};
const duration_bar_prop = {
    top: [482,140],
    left: [34,0.35*vw],
    height: [11,8],
    width: [330,0.6*vw]
};
const empty_bar_prop = {width:[330,0.6*vw]};
const filled_bar_prop = {height:[10,8]};
const scrubber_prop = {
    top: [-7,-4],
    height: [24,16]
};
const menu_btn_prop = {opacity: [1,0]};
const profile_picture_prop = {opacity: [1,0]};
//move function
function move(el,property,progress) {
    switch (el){
        case trans_card:
            el.style.bottom = `${-el.offsetHeight + el.offsetHeight*progress}px`;
            break;
        case filled_bar || scrubber:
            filled_bar.style.width = `${song_progress*empty_bar.offsetWidth}px`;
            scrubber.style.left = `${song_progress*empty_bar.offsetWidth-(scrubber.offsetWidth/2)}px`;
        default:
            for (const [key,value] of Object.entries(property)) {
                switch (key) {
                    case "boxShadow":
                        el.style[`${key}`] = (progress >= 0.5) ? value[1] : value[0];
                        break;
                    case "opacity":
                        el.style[`${key}`] = (value[0] + ((value[1]-value[0])*progress));
                        break;
                    default:
                        el.style[`${key}`] = `${(value[0] + ((value[1]-value[0])*progress))}px`;
                        break;
                }
            }
            break;
    }
}

function moveAll(progress) {
    lyrics_card.style.top  = (initial_top+full_height*(1-progress)) + 'px';
    move(cover,cover_prop,progress);
    move(song_data,song_data_prop,progress);
    move(artist,artist_prop,progress);
    move(duration_bar,duration_bar_prop,progress);
    move(empty_bar,empty_bar_prop,progress);
    move(filled_bar,filled_bar_prop,progress);
    move(scrubber,scrubber_prop,progress);
}

function reverse_animate(init_percent,move_func,time,callback=()=>{}) {
    init_percent = init_percent.toFixed(2);
    let steps = time/10;
    let i=1;
    let x;
    let progress = init_percent;
    const id = setInterval(() => {
        if (progress <=0.009) {
            callback();
            clearInterval(id);
        } else {
            i-=1/steps;
            x = easeInExpo(i);
            progress = init_percent*x;
            move_func(progress);
        }
    },10);
}
function animate(init_percent,move_func,time,callback=()=>{}) {
    init_percent = init_percent.toFixed(2);
    let steps = time/10;
    let i=0;
    let x;
    let progress = init_percent;
    const id = setInterval(() => {
        if (progress >=1) {
            callback();
            clearInterval(id);
        } else {
            i+=1/steps;
            x = easeOutExpo(i);
            progress = x;
            move_func(progress);
        }
    },10);
}

//easing function
function easeOutExpo(x) {return (x >= 1 ? 1 : (1 - Math.pow(2, -10 * x)));}
function easeInExpo(x) {return (x === 0 ? 0 : Math.pow(2, 10 * x - 10));}

//drag function
let isDown;
let percent=1;
const full_height = 776;
const initial_top = 24;
lyrics_pull_down.addEventListener('mousedown', () => {isDown = true;});
document.addEventListener('mouseup', (e) => {
    if (isDown) {
        menu_btn.style.display = 'inline';
        profile_picture.style.display = 'inline';
        reverse_animate(1,(progress) => {move(menu_btn,menu_btn_prop,progress);},300);
        reverse_animate(1,(progress) => {move(profile_picture,profile_picture_prop,progress)},300);
        reverse_animate(percent,moveAll,300, () => {
            lyrics_card.style.display = 'none';
            lyrics_card_type = null;
        });
    
    }
    isDown = false;
});
document.addEventListener('mousemove', (e) => {
    e.preventDefault();
    if (isDown) {
        let ceiling = e.clientY;
        let base = ceiling + initial_top;
        let height = (full_height - ceiling + initial_top);
        if (ceiling >= initial_top & base <= (full_height+initial_top)) {
            percent = (height)/(full_height); //decreasing
            moveAll(percent);
        }
    }
});

//clicked outside a div
function clickOff(evt) {
    let targetElement = evt.target;

    do {
        if (targetElement == trans_card || targetElement == trans_btn) {
            return;
        }
        targetElement = targetElement.parentNode;
    } while (targetElement);

    console.log("clicked");
    reverse_animate(1,(progress) => {move(trans_card,null,progress);},300,() =>{
        trans_card.style.display = 'none';
    })
    document.removeEventListener("click", clickOff);
}