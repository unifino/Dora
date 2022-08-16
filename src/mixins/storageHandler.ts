declare var android;

import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import * as tools                       from "@/mixins/tools"
import Bus                              from "@/mixins/bus"
import { x007 }                         from '@/mixins/android007Agent'
import path from "path";

// -- =====================================================================================

const exStorage = android.os.Environment.getExternalStorageDirectory();
export const SDCard: string = exStorage.getAbsolutePath().toString();

export let baseFolder   : NS.Folder; // * do not initiate it
export let OffRoad_dir  : NS.Folder; // * do not initiate it
export let Avatars_dir  : NS.Folder; // * do not initiate it
export let Audios_dir   : NS.Folder; // * do not initiate it
export let Videos_dir   : NS.Folder; // * do not initiate it
export let Images_dir   : NS.Folder; // * do not initiate it
export let bBGs_dir     : NS.Folder; // * do not initiate it
let appConfigFile       : NS.File;   // * do not initiate it
let massDBFile          : NS.File;   // * do not initiate it
let glssDBFile          : NS.File;   // * do not initiate it
let flssDBFile          : NS.File;   // * do not initiate it
let rbssDBFile          : NS.File;   // * do not initiate it
let bigKeyFile          : NS.File;   // * do not initiate it

// -- =====================================================================================

export function readAppConfig (): Promise<TS.appConfig> {

    return new Promise ( (rs, rx) => { 

        let appConfigPath = NS.path.join( "app", "assets", "appConfig" );
        appConfigFile = NS.knownFolders.documents().getFile( appConfigPath );

        if ( !NS.File.exists( appConfigFile.path ) ) return rx( 'noConfigFile' );

        let cfg = NS.File.fromPath( appConfigFile.path ).readTextSync();

        if ( TNS_ENV !== 'production' ) {
            try { 
                cfg = JSON.parse( cfg );
                ( cfg as any ).email = "unifino@protonmail.com";
                // store.state.appConfig.beautyBGs = { tree: { height: "45%", translateY: 0 } };
                // ( cfg as any ).email = null;
                ( cfg as any ).activeInstitutes = store.state.appConfig.institutes;
                cfg = JSON.stringify( cfg );
            } 
            catch (err) { 
                store.state.appConfig.email = "unifino@protonmail.com";
                store.state.appConfig.activeInstitutes = store.state.appConfig.institutes;
                cfg = JSON.stringify( store.state.appConfig );
            }
        }

        try { cfg = JSON.parse( cfg ) } catch (err) { return rx( 'configCorrupted' ) }
        // store.state.appConfig.beautyBGs = { tree: { height: "45%", translateY: 0 } };

        // .. if config is valid, function will be resolved!
        if( tools.appConfigValidator( cfg as any ) ) rs( cfg as any );
        // .. config Data is not meet our validation criteria
        else rx( 'fileMismatched' );

    } );

}

// -- =====================================================================================

export async function saveAppConfig () {
    appConfigFile.writeText( JSON.stringify( store.state.appConfig ) );
}

// -- =====================================================================================

export function pathCtr () {
    // .. permission policy has been meet, so assign necessarily Folders!
    baseFolder  = NS.Folder.fromPath( NS.path.join( SDCard, "Dora" ) );
    let bp      = baseFolder.path;
    OffRoad_dir = NS.Folder.fromPath( NS.path.join( bp, "Off Road"              ) );
    Avatars_dir = NS.Folder.fromPath( NS.path.join( bp, ".files", "avatars"     ) );
    Audios_dir  = NS.Folder.fromPath( NS.path.join( bp, ".files", "audios"      ) );
    Videos_dir  = NS.Folder.fromPath( NS.path.join( bp, ".files", "videos"      ) );
    Images_dir  = NS.Folder.fromPath( NS.path.join( bp, ".files", "images"      ) );
    bBGs_dir    = NS.Folder.fromPath( NS.path.join( bp, ".files", "beautyBGs"   ) );
    massDBFile  = NS.knownFolders.documents().getFile( "m.db" );
    glssDBFile  = NS.knownFolders.documents().getFile( "g.db" );
    flssDBFile  = NS.knownFolders.documents().getFile( "f.db" );
    rbssDBFile  = NS.knownFolders.documents().getFile( "r.db" );
    bigKeyFile  = NS.knownFolders.documents().getFile( "key"  );

    if ( TNS_ENV !== 'production' ) {
        massDBFile  = NS.File.fromPath  ( NS.path.join( bp, ".documents", "m.db"  ) );
        glssDBFile  = NS.File.fromPath  ( NS.path.join( bp, ".documents", "g.db"  ) );
        flssDBFile  = NS.File.fromPath  ( NS.path.join( bp, ".documents", "f.db"  ) );
        rbssDBFile  = NS.File.fromPath  ( NS.path.join( bp, ".documents", "r.db"  ) );
        bigKeyFile  = NS.File.fromPath  ( NS.path.join( bp, ".documents", "key"   ) );
    }

}

// -- =====================================================================================

function getBigKey () {

    let bigXStr = bigKeyFile.readTextSync();
    let bigStr  = x007( bigXStr, tools.key(), true );

    let bigKey = {};

    try { bigKey = JSON.parse( bigStr ) } 
    catch { bigKey = tryToRescue( bigKeyFile, true ) }

    return bigKey;

}

// -- =====================================================================================

let bigKeyBusy = false;
export function saveBigKey ( keyString: string ): Promise<object> {

    if ( bigKeyBusy ) return new Promise( _ => setTimeout( _ => saveMass(), 10 ) )

    bigKeyBusy = true;

    return new Promise ( async (rs, rx) => {

        if ( refreshBackUP( bigKeyFile ) )
            bigKeyFile.
            writeText( keyString )
            .then( () => rs( JSON.parse( x007( keyString, tools.key(), true ) ) ) )
            .catch( err => rx() )
            .finally( () => bigKeyBusy = false );
        else 
            rx( "backUpFailed!" );

    } );

}

// -- =====================================================================================

function tryToRescue ( file: NS.File, decode = false ) {

    let data = {},
        bk_path = file.path + ".bak" ;

    if ( NS.File.exists( bk_path ) ) {
        try { 
            if ( decode ) {
                data = JSON.parse( 
                    x007( 
                        NS.File.fromPath( bk_path ).readTextSync(), 
                        tools.key(), 
                        true 
                    ) 
                )
            } 
            else data = JSON.parse( NS.File.fromPath( bk_path ).readTextSync() ) } 
        catch { data = {} }
    }

    return data;

}

// -- =====================================================================================

export function putLessonsInBox () {

    let mDB: { [key: string]: TS.Lesson[] } = {};

    try { mDB = JSON.parse( massDBFile.readTextSync() ) }
    catch { mDB = tryToRescue( massDBFile ) }

    for ( let ins of store.state.appConfig.institutes ) if ( !(ins in mDB) ) mDB[ins] = [];

    // .. loop over lessons - keep for further checks
    // for ( let ins of store.state.appConfig.institutes ) {
    //     for ( let lesson of mDB[ins] ) {
    //         for ( let org of lesson.protoplasm ) {
    //             if( org.type === "dText" ) {
    //                 for ( let word of org.content ) {
    //                     if ( typeof word[1].snap === "number" ) 
    //                         console.log(word[1].snap);
    //                 }
    //             }
    //         }
    //     }
    // }

    store.state.massDB = tools.mDBValidator( mDB, getBigKey() );

    // .. Add OffRoad Lessons
    for ( let ins of store.state.appConfig.activeInstitutes ) OffRoadDriver( ins );

}

// -- =====================================================================================

export function putGlossariesInBox () {

    let gDB: TS.GlssDB = {};

    try { gDB = JSON.parse( glssDBFile.readTextSync() ) }
    catch { gDB = tryToRescue( glssDBFile ) }

    for ( let ins of store.state.appConfig.institutes ) if ( !(ins in gDB) ) gDB[ins] = {};

    store.state.glssDB = gDB;

}

// -- =====================================================================================

export function putFlashcardsInBox () {

    let fDB: { [key: string]: TS.Flashcard[] } = {};

    try { fDB = JSON.parse( flssDBFile.readTextSync() ) }
    catch { fDB = tryToRescue( flssDBFile ) }

    for ( let ins of store.state.appConfig.institutes ) if ( !(ins in fDB) ) fDB[ins] = [];

    store.state.flssDB = fDB;

}

// -- =====================================================================================

export function putRibosomesInBox () {

    let rDB: { [key: string]: TS.Ribosome[] } = {};

    try { rDB = JSON.parse( rbssDBFile.readTextSync() ) }
    catch { rDB = tryToRescue( rbssDBFile ) }

    for ( let ins of store.state.appConfig.institutes ) if ( !(ins in rDB) ) rDB[ins] = [];

    store.state.rbssDB = rDB;

}

// -- =====================================================================================

let mDBBusy = false;
export function saveMass (): Promise<void> {

    if ( mDBBusy ) return new Promise( _ => setTimeout( _ => saveMass(), 10 ) )

    mDBBusy = true;

    return new Promise ( async (rs, rx) => {

        if ( refreshBackUP( massDBFile ) )
            massDBFile.
            writeText( JSON.stringify( store.state.massDB ) )
            .then( () => rs() )
            .catch( err => rx() )
            .finally( () => mDBBusy = false );
        else 
            rx( "backUpFailed!" );

    } );

}

// -- =====================================================================================

let gDBBusy = false;
export function saveGlossar (): Promise<void> {

    if ( gDBBusy ) return new Promise( _ => setTimeout( _ => saveGlossar(), 10 ) )

    gDBBusy = true;

    return new Promise ( async (rs, rx) => {

        if ( refreshBackUP( glssDBFile ) )
            glssDBFile.
            writeText( JSON.stringify( store.state.glssDB ) )
            .then( () => rs() )
            .catch( err => rx() )
            .finally( () => gDBBusy = false );
        else 
            rx( "backUpFailed!" );

    } );

}

// -- =====================================================================================

let fDBBusy = false;
export function saveFlashCards (): Promise<void> {

    if ( fDBBusy ) return new Promise( _ => setTimeout( _ => saveFlashCards(), 10 ) )

    fDBBusy = true;

    return new Promise ( async (rs, rx) => {

        if ( refreshBackUP( flssDBFile ) )
            flssDBFile.
            writeText( JSON.stringify( store.state.flssDB ) )
            .then( () => rs() )
            .catch( err => rx() )
            .finally( () => fDBBusy = false );
        else 
            rx( "backUpFailed!" );

    } );

}

// -- =====================================================================================

let rDBBusy = false;
export function saveRibosomes (): Promise<void> {

    if ( rDBBusy ) return new Promise( _ => setTimeout( _ => saveRibosomes(), 10 ) )

    rDBBusy = true;

    return new Promise ( async (rs, rx) => {

        if ( refreshBackUP( rbssDBFile ) )
            rbssDBFile.
            writeText( JSON.stringify( store.state.rbssDB ) )
            .then( () => rs() )
            .catch( err => rx() )
            .finally( () => rDBBusy = false );
        else 
            rx( "backUpFailed!" );

    } );

}

// -- =====================================================================================

function refreshBackUP ( file: NS. File ) {

    let bk  = NS.File.fromPath ( NS.path.join( file.path + ".bak" ) ),
        _bk = NS.File.fromPath ( NS.path.join( file.path + ".bak.tmp" ) ),
        ok  = false,
        CB  = err => ok = false;

    // .. write tmp file
    _bk.writeSync( file.readSync() );
    // .. check tmp
    try { if ( _bk.readTextSync() === file.readTextSync() ) ok = true } catch {}

    // .. remove old backUP
    bk.removeSync( CB );

    // .. register tmp as bak
    if ( ok ) _bk.renameSync( bk.name, CB );

    return ok;

}

// -- =====================================================================================

export function organellesLoader ( lesson: TS.Lesson ): Promise<void> {

    // ! check availability of file in internet
    return new Promise ( async (rs, rx) => {

        // .. essential organelles
        // TODO just designed for up to 2 organs (one of them should be text)
        let media = lesson.chromosome.model.filter( x => x !== "dText" );
        // .. searching for organelle
        let organelle = lesson.protoplasm.find( x => x.type === media[0] );

        // .. NON-TXT organelles has been Found
        if ( organelle ) await orgHandler( organelle, "mediaPath" );
        // .. it has been NOT found!
        else return rx( media[0] + ": is missed!" );

        // .. decorative organelles
        let avatar = lesson.protoplasm.find( x => x.type === "dAvatar" );
        if ( avatar ) orgHandler( avatar, "avatarPath" );

        // .. register and resolve a void answer
        store.state.inHand.lesson = lesson;
        rs();

    } );

}

// -- =====================================================================================

async function orgHandler ( org: TS.Organelle, mps: string ) {

    let hand = store.state.inHand;

    // .. source will be reset
    hand[ mps ] = null;

    // .. youTube & copyRighted Material will not save locally
    if ( !org.isYouTube && !org.copyRight ) {

        // .. last downloaded & available file will replace the sourceURL
        if ( org.address ) {
            let f = NS.path.join( baseFolder.path, org.address );
            if ( NS.File.exists(f) ) hand[ mps ] = f;
            // ! do not use this line of code! we need it for ram
            // // .. some issues with the file detected!
            // else delete org.address;
        }

        // .. NOTHING STILL has been found in local storage! (re-)download it!
        if ( !hand[ mps ] ) await get_org_media(org).then( p => hand[ mps ] = p );

    }
    // .. Online sourceURL will assign as mediaPath
    else hand[ mps ] = org.sourceURL;

}

// -- =====================================================================================

function get_org_media ( org: TS.Organelle ): Promise<string> {

    return new Promise ( (rs, rx) => {

        let _dir: NS.Folder;
        if ( org.type === "dAudio"   ) _dir = Audios_dir;
        if ( org.type === "dVideo"   ) _dir = Videos_dir;
        if ( org.type === "dImage"   ) _dir = Images_dir;
        if ( org.type === "dAvatar"  ) _dir = Avatars_dir;

        // .. try to purifying the name
        try {
            let pat = _dir.path.replace( baseFolder.path, "" );
            org.address = org.address.replace( pat, "" )
        } catch {}
        // .. use the already allocated PURE name or get a new one
        let name = org.address || anAvailableNameIn( _dir ),
            path = NS.path.join( _dir.path, name );

        // .. downloading Pic
        if ( org.type === "dAvatar" || org.type === "dImage" ) {
            // ! PNG???
            NS.Http.getImage( org.sourceURL ).then( imageSource => {
                if ( imageSource.saveToFile( path, "jpg" ) )
                    org.address = path.replace( baseFolder.path, "" );
                rs( NS.path.join( baseFolder.path, org.address ) );
            } );
        }
        // .. downloading AUDIO|VIDEO
        else {
            Bus.$emit( "Downloading_Panel", "start" );
            NS.Http.getFile( org.sourceURL, path ).then( fileSource => {
                org.address = path.replace( baseFolder.path, "" );
                Bus.$emit( "Downloading_Panel", "stop" );
                rs( NS.path.join( baseFolder.path, org.address ) );
            } );
        }

    } );

}

// -- =====================================================================================

function anAvailableNameIn ( folder: NS.Folder ) {

    let i = 0;
    let newName: string;

    do { newName = tools.randomStr( 7+ i++ ); }
    while ( folder.getEntitiesSync().some( f => f.name.includes( newName ) ) )

    return newName;

}

// -- =====================================================================================

export async function getMedia ( path: string ) {

    let answer: string;

    await NS.Folder.fromPath( path ).getEntities().then( async entities => {

        // TODO support all formats
        for ( const e of entities ) 
            if( NS.File.exists( e.path ) )
                if
                (
                    NS.File.fromPath( e.path ).extension === ".mp3" ||
                    NS.File.fromPath( e.path ).extension === ".mp4"
                )
                    answer = e.path;

    } );

    return answer;

}

// -- =====================================================================================

export async function avatar ( name: string, folderPath: string, avatarURL: string ) {

    let picName = name.replace( /[/|\:*?"<>]/g , ' ' ) + ".jpg";
    let picPath = NS.path.join( folderPath , picName );

    return NS.Http.getFile( avatarURL , picPath )
    .then(
        pic => picPath, 
        e => Promise.reject( e + '' )
    )
    .catch( e => Promise.reject( e + '' ) );

}

// -- =====================================================================================

export async function
media ( name: string, folderPath: string, mediaURL: string, ext: ".mp3"|".mp4" ) {

    // TODO other formats?
    let mediaName = name.replace( /[/|\:*?"<>]/g , ' ' ) + ext;
    let mediaPath = NS.path.join( folderPath , mediaName );

    // store.state.progress = 'Downloading ...';

    return NS.Http.getFile( mediaURL , mediaPath )
    .then(
        audio => mediaPath, 
        e => Promise.reject( e + '' )
    )
    .catch( e => Promise.reject( e + '' ) );

    // store.state.progress = String.fromCharCode( '0xf058' ) + ' Downloaded' , 

}

// -- =====================================================================================

export function have_these_on_local ( ribosome: TS.Ribosome ) {

    let all = store.state.massDB[ store.state.inHand.institute ];
    let i_have_these: string[] = [];

    for ( let lesson of Object.values( all ) )
        if ( lesson.chromosome.code.ribosome === ribosome.code )
            i_have_these.push( lesson.chromosome.code.idx );

    return i_have_these;

}

// -- =====================================================================================

function OffRoadDriver ( ins: string ) {

    // .. get valid OffRoads Data
    let OffRoads = OffRoadReader( ins );

    let n = store.state.massDB[ ins ].filter( x => x.chromosome.code.ribosome === "OFFROAD" ).length;

    // .. convert data to lessons
    for ( let lesson of OffRoads ) {

        let materials = NS.Folder.fromPath( lesson.path ).getEntitiesSync();
        let videos = materials.filter( x => (<any>x).extension === ".mp4" );
        //! just for JPG formats??
        let avatars = materials.filter( x => (<any>x).extension === ".jpg" );
        //! just for SRT formats??
        let subtitles = materials.filter( x => (<any>x).extension === ".srt" );
        let stringPath = JSON.stringify( [ "Off Road", ins, lesson.name, videos[0].name ] );

        // .. add new Lessons
        if ( !store.state.massDB[ ins ].find( x => JSON.stringify( x.chromosome.hPath ) === stringPath ) ) {

            let content: TS.UniText[];
            // .. try to get subtitle in format of SRT
            if ( subtitles.length ) {
                let srt = NS.File.fromPath( subtitles[0].path ).readTextSync();
                content = tools.srtParser( srt );
            }

            let newData: TS.Lesson = { chromosome: null, protoplasm: null };

            newData.chromosome = {
                institute       : ins                                               ,
                model           : [ "dVideo", "dText" ]                             ,
                code            : { ribosome: "OFFROAD", idx: (n++).toString() }    ,
                level           : "C1"                                              ,
                title           : lesson.name                                       ,
                hPath           : [ "Off Road", ins, lesson.name, videos[0].name ]  ,
                vPath           : null                                              ,
                status          : "reading"                                         ,
                sync            : false                                             ,
            }
            newData.protoplasm = [
                {
                    type        : "dVideo"                                          ,
                    address     : newData.chromosome.hPath.join( "/" )              ,
                    sourceURL   : newData.chromosome.hPath.join( "/" )              ,
                },
                {
                    type        : "dText"                                           ,
                    content     : content                                           ,
                }
            ];

            // .. add avatar if exists - path need to be trimmed
            if ( avatars.length ) {
                newData.protoplasm.push(
                    {
                        type        : "dAvatar"                                     ,
                        address     : avatars[0].path.split("/").slice(5).join("/") ,
                    }
                )
            }

            store.state.massDB[ ins ].push( newData );

        }

        // .. remove raw data

    }

}

// -- =====================================================================================

function OffRoadReader ( ins: string ) {

    let path = NS.path.join( OffRoad_dir.path, ins );
    let contents = NS.Folder.fromPath( path ).getEntitiesSync();

    // .. pick just Folders
    contents = contents.filter( item => NS.Folder.exists( item.path ) );
    // .. check Folder has its mandatory data
    contents = contents.filter( folder => {
        let pass_code = 1;
        let junk_code = 0;
        for( let item of NS.Folder.fromPath( folder.path ).getEntitiesSync() ) {
            if( (<any>item).extension === ".mp4" )      pass_code += 700;
            else if( (<any>item).extension === ".srt" ) pass_code += 70;
            else if( (<any>item).extension === ".jpg" ) pass_code += 0;
            // else if( (<any>item).extension === ".png" ) pass_code += 0;
            else junk_code++;
        }
        // .. accepts only folders with one video and|without one str file!
        return (pass_code === 771 || pass_code === 701) && junk_code === 0;
    } );

    return contents;

}

// -- =====================================================================================
