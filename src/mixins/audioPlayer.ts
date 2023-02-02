// * tns plugin add nativescript-audio-player
import { TNSPlayer }                    from 'nativescript-audio-player'
import store                            from "./store"

// -- =====================================================================================

export const playerOptions = {
    audioFile: null,
    loop: false ,
    completeCallback: () => store.state.mediaState = "stopped" ,
}

const player = new TNSPlayer();

// -- =====================================================================================

export function init ( path: string ) {
    playerOptions.audioFile = path;
    player.initFromFile( playerOptions );
}

// -- =====================================================================================

export async function getDuration() {
    let duration = await player.getAudioTrackDuration();
    let seconds = parseFloat( duration ) / 1000;
    return seconds;
}

// -- =====================================================================================

export function play() {
    player.play();
    store.state.mediaState = "playing";
}

// -- =====================================================================================

export function pause ( master?: "scope" ) {
    player.pause();
    store.state.mediaState = master ? "pausedByScope" : "paused";
}

// -- =====================================================================================

export function resume () {
    player.resume();
    store.state.mediaState = "playing";
}

// -- =====================================================================================

export function seekTo( second: number ) {
    player.seekTo( second *1000 );
    // store.state.mediaState = "playing";
}

// -- =====================================================================================

export function gearSpeed ( gear: number ) {
    player.changePlayerSpeed( gear );
}

// -- =====================================================================================

export function stop () {
    player.dispose();
    store.state.mediaState = "stopped";
}

// -- =====================================================================================

let TO;
export let stopAt = function ( second: number ): Promise<void> {

    if ( TO ) clearTimeout ( TO );

    return new Promise ( (rs, rx) => {
        if ( player.currentTime >= second *1000 ) rs( stop() );
        else TO = setTimeout( () => rs( stopAt( second ) ), 10 );
    } )

}

// -- =====================================================================================

export function getCurrentTime () {

    return store.state.mediaState === "playing" ?
        parseFloat( (player.currentTime /1000).toFixed(1) ) : -1;

}

// -- =====================================================================================
