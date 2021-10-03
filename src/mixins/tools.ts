import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
// * tns plugin add nativescript-toast
import * as Toast                       from 'nativescript-toast'
import { x007 }                         from '@/mixins/android007Agent'

// -- =====================================================================================

const userAgent = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:75.0) Gecko/20100101 Firefox/75.0";
export const day = 60*60*24;
export const ssd = "https://stark-chamber-36060.herokuapp.com/"; 

// -- =====================================================================================

export function 
instituteTravel ( d: NS.SwipeDirection|null|TS.TravelBack = null ): TS.travelInfo {

    let institutes = store.state.appConfig.activeInstitutes;

    let i = institutes.indexOf( store.state.inHand.institute );

    let type: string , 
        duration: number = 300;

    switch ( d ) {

        case NS.SwipeDirection.left:    i++; type = 'slideLeft';   break;
        case NS.SwipeDirection.right:   i--; type = 'slideRight';  break;
        case TS.TravelBack.fromBottom:       type = 'slideBottom'; break;
        case TS.TravelBack.fromTop:          type = 'slideTop';    break;
        default:
            i = institutes.indexOf( store.state.appConfig.instituteBookmark );
            type = 'fade';
            duration = 1;
            break;

    }

    i = ( i + institutes.length  ) % institutes.length;

    return { 
        transitionName  : type , 
        institute       : institutes[i] ,
        duration        : duration 
    }

}

// -- =====================================================================================

let dAO_TO: NodeJS.Timeout | any;
export async function dAO ( ins: string ) {

    if ( dAO_TO ) clearTimeout( dAO_TO );

    if ( store.state.needCalculation ) {
        dAO_TO = setTimeout( () => dAO( ins ) , 10 );
        return 0;
    }

    store.state.needCalculation = true;
    store.state.activeBox[ ins ] = [];

    // .. retrieve sentences & numbers
    sentenceRetriever( store.state.massDB[ ins ] ).then( answer => {

        store.state.sentenceBox[ ins ] = answer.sentences;
        store.state.numberBox[ ins ]   = answer.numbers;

        activator( answer.sentences, store.state.flssDB[ ins ] )
        .then( actives => store.state.activeBox[ ins ] = actives )
        .then( () => store.state.needCalculation = false )

    } )

}

// -- =====================================================================================

let sentenceBOX: TS.VIPSentence[], 
    numberBOX:  TS.VIPSentence[];
// .. Find all sentences and Filter them by Mark or Phrase
export async function sentenceRetriever ( lessons: TS.Lesson[] ) {

    sentenceBOX = [];
    numberBOX = [];

    for ( let lesson of lessons ) {
        if ( lesson ) {
            // .. just ( read ) Lesson will be considered
            if ( lesson.chromosome.status === "read" ) {
                // .. this file is create by an Audio/Video Lesson
                // TODO just designed for up to organs (one of them should be text)
                let model = lesson.chromosome.model;
                if ( model.includes( "dAudio" ) ) await sentenceRetriever_audio( lesson );
                if ( model.includes( "dVideo" ) ) await sentenceRetriever_video( lesson );
            }
        }
    }

    return { sentences: sentenceBOX, numbers: numberBOX }

}

// -- =====================================================================================

async function sentenceRetriever_audio ( lesson: TS.Lesson ) {

    let c: number = 0,
        beginningID: number,
        context = lesson.protoplasm.find( x => x.type === "dText" ).content;

    for ( const idx in context ) {

        // .. preserving Starting ID of sentence
        if ( c === 0 ) beginningID = parseInt( idx );
        c++;

        let hasBlock = isBlock( context[ idx ], context.length, parseInt(idx) );

        if ( hasBlock ) {
            sentenceRetriever_unify( lesson, beginningID, Number(idx) ); 
            c = 0;
        }

    }

    // .. release CPU from freezing
    await new Promise( _ => setTimeout( _ , 1 ) );

}

// -- =====================================================================================

async function sentenceRetriever_video ( lesson: TS.Lesson ) {

    let subtitle = lesson.protoplasm.find( x => x.type === "dText" ).content;

    let a = 0;
    while( a < subtitle.length -1 ) {
        let b = subtitle.findIndex( (row,i) => row[1].standoff === "block" && i > a );
        sentenceRetriever_unify( lesson, a, b );
        a = b+1;
    }

    // .. release CPU from freezing
    await new Promise( _ => setTimeout( _ , 1 ) );

}

// -- =====================================================================================

function sentenceRetriever_unify( lesson : TS.Lesson, start: number, stop: number ) {

    let minV = store.state.appConfig.minNumberLength,
        sentence = "",
        VIPSentence: TS.VIPSentence,
        sentenceFuse = true, 
        numberFuse = true,
        uContext = lesson.protoplasm.find( x => x.type === "dText" ).content;

    // TODO just designed for up to organs (one of them should be text)
    for( let i = start; i <= stop; i++ ) {

        // .. concat the sentence
        if ( lesson.chromosome.model.includes( "dAudio" ) ) {
            sentence += uContext[i][1].isBreakLine ? 
                "\n" : uContext[i][0];
            if ( i < stop ) sentence += " ";
        }

        if ( lesson.chromosome.model.includes( "dVideo" ) ) {
            sentence += uContext[i][1].isBreakLine ? 
                ( i === stop ? "" : "\n" ) : uContext[i][0];
            if ( i !== stop && !uContext[i][1].isBreakLine ) sentence += " ";
        }

        // .. if belongs to a phrases / contains any marked word
        let ins = lesson.chromosome.institute;
        if ( wordStating( uContext[i][0], ins ) === "M" || uContext[i][1].phrased )
            sentenceFuse = false;

        // .. select sentences with digits
        let digit: number = pureDigit( uContext[i][0] );
        if ( digit !== NaN && digit > 10**minV )
            numberFuse = false;

    }

    VIPSentence = [
        sentence.trim(),
        {
            lesson  : lesson,
            A       : start,
            B       : stop,
        }
    ];

    if ( !sentenceFuse ) sentenceBOX.push( VIPSentence );
    if ( !numberFuse ) numberBOX.push ( VIPSentence );

}

// -- =====================================================================================

export function isBlock ( obj: TS.UniText, length: number, idx?: number ): boolean {

    if ( !obj[0] ) return true;
    if ( !obj[1] ) return false;

    let asNum = Number( ( obj[0] ).replace( ',' , '' ) );

    if ( obj[1].standoff === "bridge" && idx < length -1 ) return false;
    else if
    (
        ( obj[1].standoff === "block" )                         ||
        ( obj[1].isBreakLine )                                  ||
        ( idx === length -1 )                                   ||
        ( obj[0].includes('?') )                                ||
        ( obj[0].includes('!') )                                ||
        ( obj[0].includes(';') )                                ||
        ( obj[0].includes(':') && obj[0].slice(-1) === ':' )    ||
        ( obj[0].includes('.') && isNaN( asNum ) )
    )
        return true;

    else return false;

}

// -- =====================================================================================

function pureDigit ( str: string ): number {
    if ( !str ) return NaN;
    str = str.replace( /\,/g , '' );
    str = str.replace( /\./g , '' );
    return Number( str );
}

// -- =====================================================================================

export async function activator (

    sentenceBox: TS.VIPSentence[],
    flashcards: TS.Flashcard[]

): Promise<TS.VIPSentence[]> {

    let now: number , 
        step: number , 
        time: number , 
        diff: number ,
        next: number ,
        VIPinTimeBox: TS.VIPSentence[],
        baseTime = store.state.appConfig.baseTime;

    // .. make a copy of sentenceBox
    VIPinTimeBox = sentenceBox.slice();

    // .. removing not in Time sentences
    for ( let sentence of VIPinTimeBox ) {

        now = ( new Date().getTime() /1000 ) | 0;

        let idx = flashcards.findIndex( card => card[0] === sentence[0] );
        if ( idx > -1  ) {
            step = flashcards[ idx ][1].step ;
            time = flashcards[ idx ][1].lastVisit;
            diff = ( now - time ) >= 0 ? ( now - time ) : Infinity;
            next = day * ( baseTime ** step );
            // .. remove this sentence on Base of fDB
            if ( diff <= next || flashcards[ idx ][1].status === 'hidden' )
                VIPinTimeBox = VIPinTimeBox.filter( x => x[0] !== sentence[0] );
        }

    }

    // .. sort VIPinTimeBox
    VIPinTimeBox.sort( (x,y) => x[0].length > y[0].length ? 1 : -1 );

    return VIPinTimeBox;

}

// -- =====================================================================================

export let map = {
    amp     : '&' ,
    lt      : '<' ,
    gt      : '>' ,
    quot    : '"' ,
    '#39'   : "'" ,
    '#039'  : "'"
}

// TODO  list of supported languages
export function translator ( from: string, to: string, string: string ): Promise<string> {

    return new Promise ( (rs,rx) => { 

        // .. first Try
        translator_google_free ( from, to, string )
        .then( translate => rs( translate ) )
        .catch( errA => {

            // .. second Try
            translator_myMemory_free( from, to, string )
            .then( translate => rs( translate ) )

            // .. Giving Up
            .catch( errB => rx( errA + "\n\n" + errB ) );

        } );

    } );

}

// -- =====================================================================================

export function translateByImage ( word: string ): Promise<string[]> {

    return new Promise ( (rs,rx) => {

        let url = 'https://www.google.com/';
            url += 'search?q=' + encodeURIComponent ( word );
            url += '&tbm=isch';
            url += '&tbs=isz%3Am';

            NS.Http.request( {
                url: url ,
                method: "GET" ,
                headers: { "User-Agent": userAgent }
            } ).then(

                res => {

                    let r       = res.content.toString(),
                        urls    : string[] = [],
                        aCut    : string,
                        bCut    : string,
                        aCutID  : number,
                        bCutID  : number,
                        url     : string;

                    aCut   = "https://encrypted-tbn0.gstatic.com/images";
                    bCut   = '"';

                    aCutID = r.indexOf( aCut );
                    r      = r.substr( aCutID );
                    bCutID = r.indexOf( bCut );

                    while ( aCutID > -1 && bCutID > -1 ) {

                        url    = r.substr( 0, bCutID );
                        url    = decodeURIComponent( JSON.parse( '"' + url + '"' ) );
                        url    = url.replace( "&amp;", "&" );
                        if ( !urls.includes( url ) ) urls.push( url );

                        r      = r.substr( bCutID );
                        aCutID = r.indexOf( aCut );
                        r      = r.substr( aCutID );
                        bCutID = r.indexOf( bCut );

                    }

                    rs( urls );

                },

                e => rx( [ e +'' ] )

            )
            .catch( e => rx( [ e +'' ] ) );

    } );

}

// -- =====================================================================================

function
translator_google_paid ( from: string, to: string, string: string ): Promise<string> {

    return new Promise ( (rs,rx) => {

        let url = 'https://translation.googleapis.com/language/translate/v2/?';
        url += 'q=' + encodeURIComponent ( string );
        url += '&source=' + from;
        url += '&target=' + to;
        url += '&key=' + "store.state.appConfig.gAPIKey";

        NS.Http.getJSON( url ).then(

            res => {
                let mean = res['data']['translations'][0]['translatedText'];
                mean = mean.replace( /&([^;]+);/g , ( m , c ) => map[c] || '' );
                // .. RTL force Mode 
                if ( to == "fa" && mean.charAt(0).match(/[a-z]/i) ) mean = "ـ " + mean;
                rs ( mean );
            },

            e => {
                let connectionX = 'Error: java.net.UnknownHostException: ' +
                'Unable to resolve host "translation.googleapis.com": ' +
                'No address associated with hostname';
                let msg = (e+"").includes( connectionX ) ? 
                    "No Internet Connection!" : 'Google Translator: ' + e;
                rx ( msg );
            }

        )
        .catch( e => rx ( 'Link : ERROR! ' + e ) );

    } );

}

// -- =====================================================================================

function
translator_google_free ( from: string, to: string, string: string ): Promise<string> {

    return new Promise ( (rs,rx) => {

        let url = 'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t';
        url += '&q=' + encodeURIComponent ( string );
        url += '&sl=' + from;
        url += '&tl=' + to;

        NS.Http.request( {
            url: url ,
            method: "GET" ,
            headers: { "User-Agent": userAgent }
        } ).then(

            async answer => {

                let content = answer.content.toString();

                let mean = JSON.parse( content );
                mean = mean[0][0][0];

                mean = mean.replace( /&([^;]+);/g , ( m , c ) => map[c] || '' );
                // .. RTL force Mode 
                if ( to == "fa" && mean.charAt(0).match(/[a-z]/i) ) mean = "ـ " + mean;
                rs ( mean );

            },

            e => {
                let connectionX = 'Error: java.net.UnknownHostException: ' +
                'Unable to resolve host "translate.googleapis.com": ' +
                'No address associated with hostname';
                let msg = (e+"").includes( connectionX ) ? 
                    "No Internet Connection!" : 'Google Translator: ' + e;
                rx ( msg );
            }

        )
        .catch( e => {
            let quotaX = "SyntaxError: Unexpected token < in JSON at position 0";
            let msg = "Google: "; 
            msg += (e+"").includes( quotaX ) ? "Quota Exceeded!" : 'Link : ERROR! ' + e;
            rx ( msg );
        } );

    } );

}

// -- =====================================================================================

function
translator_myMemory_free ( from: string, to: string, string: string ): Promise<string> {

    let err_01 = "MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY."
    let err_02 = 'Error: java.net.UnknownHostException: ' + 
        'Unable to resolve host "api.mymemory.translated.net": ' +
        'No address associated with hostname';

    return new Promise ( (rs,rx) => {

        let url = "https://api.mymemory.translated.net/get?";
        url += "q=" + string;
        url += "&langpair=" + from + "|" + to;

        NS.Http.getJSON( url ).then(

            res => {
                let mean = res['responseData']['translatedText'];
                mean = mean.replace( /&([^;]+);/g , ( m , c ) => map[c] || '' );
                // .. RTL force Mode 
                if ( to == "fa" && mean.charAt(0).match(/[a-z]/i) ) mean = "ـ " + mean;
                if ( mean.includes( err_01 ) ) rx ( 'MyMemory.net: Quota Exceeded!' );
                rs ( mean );
            } ,

            e => rx ( e.toString() === err_02 ? "No Connection!" : e )

        )
        .catch( e => rx ( 'Link : ERROR! ' + e ) );

    } );

}

// -- =====================================================================================

export function trimmer ( word: string , numCheck = false ) {

    if ( !word ) return word;

    let bads = [ 
        '', '[(]', '[)]', '[[]', ']', '!', '[?]', ':', ';'    ,
        ',', '„'  , '“'  , '”'  , '”', '”', '‚'  , '"', '[\.]' 
    ];
    let quotes = [ '‘', '´', '`' ];

    for ( let x of bads )   word = word.replace( new RegExp( x, "g" )       , ''    );
    for ( let x of quotes ) word = word.replace( new RegExp( x, "g" )       , '\''  );
    if ( numCheck )         word = word.replace( new RegExp( '[0-9]', "g" ) , ''    );

    return word;

}

// -- =====================================================================================

export function deepSearch ( needle: string , strawStock: TS.Glossar ): string|null {

    // .. making the needle neat
    needle = trimmer( needle );

    if ( !needle ) return needle;

    // .. not Found in First Attempt ( aBC )
    if ( !strawStock.hasOwnProperty( needle ) ) {
        needle = needle.toLowerCase();
        // .. not Found in Second Attempt ( abc )
        if ( !strawStock.hasOwnProperty( needle ) ) {
            needle = needle.charAt(0).toUpperCase() + needle.slice(1);
            // .. not Found in Third Attempt ( Abc )
            if ( !strawStock.hasOwnProperty( needle ) ) needle = null;
        }
    }

    // .. null | aBC | abc | Abc
    return needle;

}

// -- =====================================================================================

export function wordStating (

    word: string,
    institute: string,
    newState?: TS.WordState,
    toggle?: boolean

): TS.WordState {

    let neatWord = trimmer( word );
    let glossar = store.state.glssDB[ institute ];

    // .. nothing
    if ( !neatWord ) return "L";

    // .. dealing with a real NaN word
    else if ( isNaN( pureDigit( neatWord ) ) ) {

        let uon = deepSearch( word , glossar );

        // .. old row
        if ( uon ) {
            // .. performing new State
            if ( newState ) {
                glossar[ uon ].state = newState;
                glossar[ uon ].sync = false;
            }
        }
        // .. new Meet
        else glossar[ neatWord ] = { state: newState || "N", sync: false };

        // .. toggle M|L
        if ( toggle ) {
            if ( glossar[ uon || neatWord ].state === "M" )
                glossar[ uon || neatWord ].state = "L";
            else
                glossar[ uon || neatWord ].state = "M";
            // .. register sync status
            glossar[ uon || neatWord ].sync = false;
        }

        // .. reporting current state
        return glossar[ uon || neatWord ].state;

    }

    // .. all Numbers reported as Learned Without Registration!
    else return "L";

}

// -- =====================================================================================

let toaster_TO: NodeJS.Timeout | any;
let toasty;
export function toaster ( msg: string ="" , duration: "short" | "long" = "short" ) {

    clearTimeout( toaster_TO );
    try{ toasty.cancel() } catch {}
    if ( !msg ) return 0;

    let pad = "";
    if ( msg.length < 7 ) for( let i=0; i< 7-msg.length; i++ ) pad += " ";

    if ( pad ) msg = '\n' + pad + msg.replace( "\n", "" ) + pad + '\n';
    else msg = '\n' + pad + msg + pad + '\n';

    toasty = Toast.makeText( msg, duration );

    toaster_TO = setTimeout( () => toasty.show() , 200 );

}

// -- =====================================================================================

export function colorLuminance( hex: string, lum: number ) {

    let rgb = "#", 
        c: number|string;

	// validate hex string
	hex = String( hex ).replace( /[^0-9a-f]/gi, '' );
	if (hex.length < 6) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	lum = lum || 0;

	// convert to decimal and change luminosity
	for ( let i = 0; i < 3; i++ ) {

        c = parseInt( hex.substr(i*2,2), 16 );
		c = Math.round( Math.min( Math.max(0, c + (c * lum)), 255 ) ).toString(16);
		rgb += ( "00" + c ).substr( c.length );

    }

    return rgb;

}

// -- =====================================================================================

export function etikettKey (): string {

    let key = "";

    key += "W(" + store.state.windowSize.width   + ")";
    key += "H(" + store.state.windowSize.height  + ")";
    key += "F(" + store.state.appConfig.fontFace + ")";
    key += "S(" + store.state.appConfig.fontSize + ")";

    return key;

}

// -- =====================================================================================

function invertHex( hex: string ) {

    hex = hex.replace( "#", "" );
    hex = "#" + (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1);
    return hex; 

}

// -- =====================================================================================

let door_Animation: NS.Animation;
export async function doorRemote (

    placeName: TS.Place,
    place: any, 
    act: 'open'|'close', 
    callBack?: Function

) {

    if ( door_Animation && door_Animation.isPlaying ) return 0;

    // .. get nativeView Element
    place = place.nativeView;

    let pos = store.state.placeTrigger[ placeName ].position,
        size = store.state.placeTrigger[ placeName ].size,
        w = store.state.windowSize.width,
        h = store.state.windowSize.height,
        bigV = w > h ? w*2 : h*2,
        origin = { x: pos.x + size.width / 2, y: pos.y + size.height / 2 },
        lum = store.state.darkMode ? -.9 : 3,
        bgColor = place.backgroundColor.toString(),
        colorA = act === "open" ? colorLuminance( bgColor, lum ) : bgColor,
        colorB = act === "open" ? bgColor : colorLuminance( bgColor, lum ),
        x_def: NS.AnimationDefinition = {};

    place.height = place.width = ( act === "open" )? 1 : bigV;
    place.opacity = ( act === "open" ) ? 0.8 : 1;
    place.translateX = ( act === "open" ) ? origin.x : origin.x - bigV/2;
    place.translateY = ( act === "open" ) ? origin.y : origin.y - bigV/2;
    place.borderRadius = bigV;
    place.backgroundColor = colorA;

    // .. need time to adjusting
    await new Promise( _ => setTimeout( _, 0 ) );

    x_def.target    = place;
    x_def.width     = act === "open" ? bigV : 1;
    x_def.height    = act === "open" ? bigV : 1;
    x_def.opacity   = act === "open" ? 1 : .95;
    x_def.duration  = 333;
    x_def.curve     = NS.Enums.AnimationCurve.easeInOut;
    x_def.translate = act === "open" ?
        { x: origin.x - bigV/2, y: origin.y - bigV/2 } : 
        { x: origin.x, y: origin.y };
    x_def.backgroundColor = colorB;

    door_Animation = new NS.Animation( [ x_def ], false );

    door_Animation.play().then( async () => {

        place.backgroundColor = bgColor;

        if ( act === "open" ) {
            place.height = place.width = "100%";
            place.translateX = place.translateY = 0;
            place.borderRadius = 0;
        }

        if ( act === "close" ) place.opacity = 0;

        await new Promise( _ => setTimeout( _, 0 ) );

        callBack();

    } );

}

// -- =====================================================================================

export function 
changeOption ( direction: "previous"|"next", length: number, refs: any, inHand: number ){

    let step = direction === "next" ? +1 : -1,
        x: number;

    x = direction === "next" ? -170 : +170;
    refs.slide[ inHand ].nativeView.animate( { translate: { x: x, y: 0 } } );

    inHand = ( inHand + step + length ) % length;

    x = direction === "next" ? +170 : -170;
    refs.slide[ inHand ].nativeView.translateX = x;

    refs.slide[ inHand ].nativeView.animate( { translate: { x: 0, y: 0 } } );

    return inHand;

}

// -- =====================================================================================

export function milestones ( context: TS.UniText[], duration: number ): number[] {

    let milestones: number[] = [],
        lastId = context.length -1;

    context[0][1].snap = context[0][1].snap || 0;
    // .. margin is set by a relative value!
    if ( context[ lastId ][1].snap < 0 ) {
        context[ lastId ][1].snap += duration;
        // .. this margin is not acceptable for this file
        if ( context[ lastId ][1].snap < 0 ) context[ lastId ][1].snap = duration;
    }
    else context[ lastId ][1].snap = context[ lastId ][1].snap || duration;

    // .. find and set snap points
    for ( let i in context )
        if ( typeof context[i][1].snap === "number" ) 
            milestones.push( Number(i) );

    return milestones;

}

// -- =====================================================================================

export function 
snapFinder ( id: number, context: TS.UniText[], duration: number ): number {

    let miles = milestones( context, duration );

    // .. has snap data
    if ( miles.includes( id ) ) return context[id][1].snap;

    // .. needs to retrieve
    else {

        // .. get before and after
        let a = 0;
        let b = context.findIndex( (row,i) => row[1].snap && i > id );
        let x = miles.indexOf(b);
        if ( x > 0 ) a = miles[ x-1 ];

        // .. corrector
        if ( b === -1 || b <= a ) b = context.length -1;

        if ( context[b][1].snap < context[a][1].snap ) {
            delete context[a][1].snap;
            delete context[b][1].snap;
            return snapFinder( id, context, duration );
        }

        let step = ( context[b][1].snap - context[a][1].snap ) / ( b - a );

        return parseFloat( ( context[a][1].snap + step * ( id - a ) ).toFixed(1) );

    }

}

// -- =====================================================================================

export async function glssDBUpdater ( institute: string ) {

    let glossar = store.state.glssDB[ institute ],
        // .. Quota is not exceeded = true
        fuse_Quota = true,
        // .. All words are ready = true
        fuse_AllSet = true,
        limit = 10;

    // .. get meaning of a set
    for ( const word of Object.keys( glossar ) ) {
        for ( let dic of store.state.appConfig.dictionaries ) {
            // .. get Meaning ( if necessary )
            if ( dic !== institute ) {
                if ( !glossar[ word ][ dic ] ) {
                    await translator( institute, dic, word )
                    .then( mean => {
                        // .. register the meaning
                        glossar[ word ][ dic ] = mean;
                        // .. register sync state
                        glossar[ word ].sync = false;
                    } )
                    .catch( e => fuse_Quota = false );
                    limit--;
                }
            }
        }
        if ( !fuse_Quota || limit < 0 ) break;
    }

    // .. is it totally updated?
    for ( let dic of store.state.appConfig.dictionaries ) {
        if ( dic !== institute )
            if ( Object.keys( glossar ).some( word => !glossar[ word ][ dic ] ) )
            fuse_AllSet = false;
    }

    // .. update again if it needs (!fuse_AllSet) and could (fuse_B)
    if ( !fuse_AllSet && fuse_Quota ) setTimeout( () => glssDBUpdater( institute ), 100 );

    return ( { fuse_Quota, fuse_AllSet } );

}

// -- =====================================================================================

export function randomCode () {

    let result     = '';
    let integers = '0123456789';
    let slots = [];

    for ( let i = 0; i < 3; i++ )
        slots.push( integers.charAt( Math.floor( Math.random()*integers.length ) ) );

    for ( let i = 0; i < 5; i++ ) 
        result += slots[ Math.floor( Math.random()*slots.length ) ];

    return result;

}

// -- =====================================================================================

export function randomStr ( length: number ) {

    let result     = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt( Math.floor( Math.random()*characters.length ) );
    }

    return result;

}

// -- =====================================================================================

export function appConfigValidator ( data: TS.appConfig ) {

    let valid: boolean = true;

    switch ( true ) {

        case typeof data !== "object"                   : valid = false; break;
        case typeof data.appConfigVersion !== "string"  : valid = false; break;
        case !Array.isArray( data.institutes )          : valid = false; break;
        case !Array.isArray( data.activeInstitutes )    : valid = false; break;
        case data.institutes.length < 1                 : valid = false; break;
        case typeof data.theme !== "string"             : valid = false; break;
        case typeof data.fontFace !== "string"          : valid = false; break;
        case typeof data.fontSize !== "number"          : valid = false; break;
        case typeof data.sortCode !== "number"          : valid = false; break;
        case typeof data.baseTime !== "number"          : valid = false; break;
        case typeof data.minNumberLength !== "number"   : valid = false; break;
        case typeof data.email !== "string"             : valid = false; break;
        case !data.email                                : valid = false; break;
        case !Array.isArray( data.dictionaries )        : valid = false; break;
        case typeof data.beautyBGs !== "object"         : valid = false; break;

    }

    return valid;

}

// -- =====================================================================================

export function chromosomeValidator( chromosome: TS.Chromosome, deep?: boolean ) {

    if ( typeof chromosome === "object" )
    if ( chromosome.title )
    if ( chromosome.institute )
    if ( typeof chromosome.vPath === "object" && chromosome.vPath.length > 0 )
    // if ( chromosome.type === "audio" || chromosome.type === "video" )
    // if ( typeof chromosome.uPath === "object" )
    // if ( typeof chromosome.wPath === "object" )
    if ( chromosome.status === "read" || chromosome.status === "reading" )
        return chromosome;

    return false;

}

// -- =====================================================================================

export function key () {

    return x007( JSON.stringify( {
        name: NS.Device.manufacturer + " | " + NS.Device.model,
        uuid: NS.Device.uuid,
    } ) );

}

// -- =====================================================================================

export function mDBValidator ( mDB: { [key: string]: TS.Lesson[] }, bigKey: object ) {

    if ( TNS_ENV === 'production' ) {

        for ( let ins of Object.keys( mDB ) ) {

            mDB[ ins ] = mDB[ ins ].filter( lesson => {
                let code = lesson.chromosome.code;
                if ( bigKey.hasOwnProperty( code.ribosome ) )
                    if ( bigKey[ code.ribosome ].includes( code.idx ) )
                        return true;
            } );

        }

    }

    return mDB;

}

// -- =====================================================================================

export function subParser ( data: string ) {

    let lines = data.split(/\r\n|\n/),
        subtitle: TS.UniText[] = [];

    let aCut, aCutID, bCutID, box, begin, end, text;

    for ( const lineNum in lines ) {

        if ( lines[ lineNum ].match( /<p begin=\".*. end=\".*.\">.*.<\/p>/g ) ) {

            // ------- retrieve begin
            aCut = "<p begin=\"";
            aCutID = lines[ lineNum ].indexOf( aCut ) + aCut.length;

            box    = lines[ lineNum ].substr( aCutID );
            bCutID = box.indexOf( '"' );
            begin  = box.substr( 0, bCutID );

            // ------- retrieve end
            aCut = "end=\"";
            aCutID = box.indexOf( aCut ) + aCut.length;

            box    = box.substr( aCutID );
            bCutID = box.indexOf( '"' );
            end    = box.substr( 0, bCutID );

            // ------- retrieve text
            aCut = ">";
            aCutID = box.indexOf( aCut ) + aCut.length;

            box    = box.substr( aCutID );
            bCutID = box.indexOf( '</p>' );
            text   = box.substr( 0, bCutID );

            // ------- time Parsing
            begin  = begin.split( ':' );
            begin  = Number( begin[2].replace( /,/g , '.' ) ) + 
                     Number( begin[1] ) *60 + 
                     Number( begin[0] ) *60*60 ;
            begin  = Number( begin.toFixed(1) );

            end    = end.split( ':' );
            end    = Number( end[2].replace( /,/g , '.' ) ) + 
                     Number( end[1] ) *60 + 
                     Number( end[0] ) *60*60;
            end    = Number( end.toFixed(1) );

            // ------- text Parsing
            if ( text.indexOf( "- " ) === 0 ) text = text.replace( "- " , "" );
            text = text.replace( "<br/>" , " \n " );
            text = text.trim();

            str2UnifiedText( text, begin, end, subtitle );

        }

    }

    return subtitle;

}

// -- =====================================================================================

export function srtParser ( data: string ) {

    let lines = data.split(/\r\n|\n/),
        subtitle: TS.UniText[] = [];

    let points, begin, end, text;

    for ( let n=0; n < lines.length -2; n++ ) {

        text = "";

        if
        (
            lines[ n +0 ].match( /^\d+$/ ) &&
            lines[ n +1 ].match( /[0-9]*:*[0-9]*:*[0-9,]* --> [0-9]*:*[0-9]*:*[0-9,]*/ )
        )
        {

            // .. time Parsing
            if ( n < lines.length - 1 ) points = lines[ n +1 ].split( '-->' );

            begin  = points[0].split( ':' );
            begin  = Number( begin[2].replace( /,/g , '.' ) ) + 
                     Number( begin[1] ) *60 + 
                     Number( begin[0] ) *60*60;
            begin  = Number( begin.toFixed(1) );

            end    = points[1].split( ':' );
            end    = Number( end[2].replace( /,/g , '.' ) ) + 
                     Number( end[1] ) *60 + 
                     Number( end[0] ) *60*60;
            end    = Number( end.toFixed(1) );

            // .. text Parsing
            text = lines[ n +2 ];
            while (
                n +3 < lines.length && 
                lines[ n +3 ] && 
                !(
                    n +4 < lines.length &&
                    lines[ n +3 ].match( /^\d+$/ ) &&
                    lines[ n +4 ].match( /[0-9]*:*[0-9]*:*[0-9,]* --> [0-9]*:*[0-9]*:*[0-9,]*/ ) 
                )
            )
            {
                text += "\n" + lines[ n +3 ];
                n++;
            }

            str2UnifiedText( text, begin, end, subtitle );

            n += 3;

        }

    }

    return subtitle;

}

// -- =====================================================================================

function str2UnifiedText (

    str: string,
    begin: number,
    end: number,
    subtitle: TS.UniText[]

): void {

    str = str.replace( /\n/g, " \n " );
    str = str.replace( / +/g, " " );
    let words = str.split( " " );

    for ( let i=0; i < words.length; i++ ) {
        let row: TS.UniText = [ null, {} ];
        if ( words[i] === "\n" ) row[1].isBreakLine = true;
        else row[0] = words[i];
        if ( i === 0 ) {
            row[1].snap = begin;
            row[1].standoff = "depart";
        }
        if ( i === words.length -1 ) {
            row[1].snap = end;
            row[1].standoff = "block";
        }
        subtitle.push( row )
    }

}

// -- =====================================================================================

export function confirmLesson( lesson: TS.Lesson ) {

    let chromosome = lesson.chromosome;

    // ! reconsider this
    // .. temporary exception for news
    if ( lesson.chromosome.code.ribosome !== "DWNCHRT" )
        for ( let row of lesson.protoplasm.find( x => x.type === "dText" ).content )
            if ( wordStating( row[0], chromosome.institute ) === "N" )
                wordStating( row[0], chromosome.institute, "L" );

    // .. register in chromosome
    chromosome.status = "read";
    chromosome.vPath = [ "Archive", ...chromosome.hPath || [], chromosome.title ];
    delete chromosome.hPath;

    // TODO MIX MODEL ???
    try {
        delete lesson.protoplasm.find( x => x.type === "dText" ).pinnedPoint;
        delete lesson.protoplasm.find( x => x.type === "dVideo" ).pinnedPoint;
    } catch {}

    // .. hide last toaster
    toaster();

}

// -- =====================================================================================

export function skipLesson( lesson: TS.Lesson ) {

    let chromosome = lesson.chromosome;

    // .. register in chromosome
    chromosome.status = "skipped";
    chromosome.vPath = [ "Archive", ...chromosome.hPath || [], chromosome.title ];
    delete chromosome.hPath;

    // TODO MIX MODEL ???
    try {
        delete lesson.protoplasm.find( x => x.type === "dText" ).pinnedPoint;
        delete lesson.protoplasm.find( x => x.type === "dVideo" ).pinnedPoint;
    } catch {}

    // .. hide last toaster
    toaster();

}

// -- =====================================================================================

export function lessonUnloader () {
    store.state.inHand.lesson = null;
    store.state.inHand.mediaPath = null;
    store.state.inHand.avatarPath = null;
}

// -- =====================================================================================

export function zip () {

    // .. zip all important data to transfer
    let zip: TS.zip = { mass: {}, flss: {}, glss: {} };

    // .. filter non-synced lessons
    for ( const ins of Object.keys( store.state.massDB ) )
        zip.mass[ ins ] = store.state.massDB[ ins ].filter( x => !x.chromosome.sync );

    // .. filter non-synced flashcard
    for ( const ins of Object.keys( store.state.flssDB ) )
        zip.flss[ ins ] = store.state.flssDB[ ins ].filter( x => !x[1].sync );

    // .. filter non-synced words
    for ( const ins of Object.keys( store.state.glssDB ) ) {
        // .. touch glossar for current institute
        zip.glss[ ins ] = {};
        for ( const word of Object.keys( store.state.glssDB[ ins ] ) )
            if ( !store.state.glssDB[ ins ][ word ].sync )
                zip.glss[ ins ][ word ] = store.state.glssDB[ ins ][ word ];
    }

    return Buffer.from( JSON.stringify( zip ), 'utf-8' ).toString( 'base64' );

}

// -- =====================================================================================

export function syncConfirm () {

    // .. lessons are synced
    for ( const ins of Object.keys( store.state.massDB ) )
        for ( const i in store.state.massDB[ ins ] )
            store.state.massDB[ ins ][i].chromosome.sync = true;

    // .. flashcards are synced
    for ( const ins of Object.keys( store.state.flssDB ) )
        for ( const i in store.state.flssDB[ ins ] )
            store.state.flssDB[ ins ][i][1].sync = true;

    // .. words are synced
    for ( const ins of Object.keys( store.state.glssDB ) )
        for ( const word of Object.keys( store.state.glssDB[ ins ] ) )
            store.state.glssDB[ ins ][ word ].sync = true;

    return Promise.resolve();

}

// -- =====================================================================================

export function unzip_scatter( zip: TS.zip ) {

    let tmp_c: TS.ChromosomeCode;
    let tmp_s: string;
    let itemIdx: number;

    try {

        // .. implant Lessons
        for ( const ins of Object.keys( zip.mass ) ) {
            for ( const i in zip.mass[ ins ] ) {
                tmp_c = zip.mass[ ins ][i].chromosome.code;
                itemIdx = store.state.massDB[ ins ].findIndex( x =>
                    x.chromosome.code.idx === tmp_c.idx &&
                    x.chromosome.code.ribosome === tmp_c.ribosome
                )
                // .. update existing Lesson
                if ( ~itemIdx ) store.state.massDB[ ins ][ itemIdx ] = zip.mass[ ins ][i];
                // .. create new one
                else store.state.massDB[ ins ].push( zip.mass[ ins ][i] );
            }
        }

        // .. implant Flashcards
        for ( const ins of Object.keys( zip.flss ) ) {
            for ( const i in zip.flss[ ins ] ) {
                tmp_s = zip.flss[ ins ][i][0];
                itemIdx = store.state.flssDB[ ins ].findIndex( x => x[0] === tmp_s );
                // .. update existing Flashcard
                if ( ~itemIdx ) store.state.flssDB[ ins ][ itemIdx ] = zip.flss[ ins ][i];
                // .. create new one
                else store.state.flssDB[ ins ].push( zip.flss[ ins ][i] );
            }
        }

        // .. implant Flashcards
        for ( const ins of Object.keys( zip.glss ) )
            for ( const word of Object.keys( zip.glss[ ins ] ) )
                store.state.glssDB[ ins ][ word ] = zip.glss[ ins ][ word ];

        // .. report 1 if every thing went well
        return 1;

    }
    // ..something went wrong!
    catch { return 0; }

}

// -- =====================================================================================
