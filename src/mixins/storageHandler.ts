declare var android

import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import * as tools                       from "@/mixins/tools"
import Bus                              from "@/mixins/bus"
import { x007 }                         from '@/mixins/android007Agent'
import * as genetics                    from "@/mixins/genetics"

// -- =====================================================================================

const exStorage = android.os.Environment.getExternalStorageDirectory()
export const SDCard: string = exStorage.getAbsolutePath().toString()

export let baseFolder   : NS.Folder // * do not initiate it
export let OffRoad_dir  : NS.Folder // * do not initiate it
export let MNTBike_dir  : NS.Folder // * do not initiate it
export let Avatars_dir  : NS.Folder // * do not initiate it
export let Audios_dir   : NS.Folder // * do not initiate it
export let Videos_dir   : NS.Folder // * do not initiate it
export let Images_dir   : NS.Folder // * do not initiate it
export let bBGs_dir     : NS.Folder // * do not initiate it
let appConfigFile       : NS.File   // * do not initiate it
let massDBFile          : NS.File   // * do not initiate it
let glssDBFile          : NS.File   // * do not initiate it
let flssDBFile          : NS.File   // * do not initiate it
let rbssDBFile          : NS.File   // * do not initiate it
let favsDBFile          : NS.File   // * do not initiate it
let bigKeyFile          : NS.File   // * do not initiate it

// -- =====================================================================================

export function readAppConfig (): Promise<TS.appConfig> {

    return new Promise ( (rs, rx) => {

        let appConfigPath = NS.path.join( "app", "assets", "appConfig" )
        appConfigFile = NS.knownFolders.documents().getFile( appConfigPath )

        if ( !NS.File.exists( appConfigFile.path ) ) return rx( 'noConfigFile' )

        let cfg = NS.File.fromPath( appConfigFile.path ).readTextSync()

        if ( TNS_ENV !== 'production' ) {
            try {
                cfg = JSON.parse( cfg )
                ( cfg as any ).email = "unifino@protonmail.com";
                // store.state.appConfig.beautyBGs = { tree: { height: "45%", translateY: 0 } }
                // ( cfg as any ).email = null
                ( cfg as any ).activeInstitutes = store.state.appConfig.institutes
                cfg = JSON.stringify( cfg )
            }
            catch (err) {
                store.state.appConfig.email = "unifino@protonmail.com"
                store.state.appConfig.activeInstitutes = store.state.appConfig.institutes
                cfg = JSON.stringify( store.state.appConfig )
            }
        }

        try { cfg = JSON.parse( cfg ) } catch (err) { return rx( 'configCorrupted' ) }
        // store.state.appConfig.beautyBGs = { tree: { height: "45%", translateY: 0 } }

        // .. if config is valid, function will be resolved!
        if( tools.appConfigValidator( cfg as any ) ) rs( cfg as any )
        // .. config Data is not meet our validation criteria
        else rx( 'fileMismatched' )

    } )

}

// -- =====================================================================================

export async function saveAppConfig () {
    appConfigFile.writeText( JSON.stringify( store.state.appConfig ) )
}

// -- =====================================================================================

export function pathCtr () {
    // .. permission policy has been meet, so assign necessarily Folders!
    baseFolder  = NS.Folder.fromPath( NS.path.join( SDCard, ".Dora" ) )
    let bp      = baseFolder.path
    OffRoad_dir = NS.Folder.fromPath( NS.path.join( bp, "Off Road"              ) )
    MNTBike_dir = NS.Folder.fromPath( NS.path.join( bp, "Mountain Bike"         ) )
    Avatars_dir = NS.Folder.fromPath( NS.path.join( bp, ".files", "avatars"     ) )
    Audios_dir  = NS.Folder.fromPath( NS.path.join( bp, ".files", "audios"      ) )
    Videos_dir  = NS.Folder.fromPath( NS.path.join( bp, ".files", "videos"      ) )
    Images_dir  = NS.Folder.fromPath( NS.path.join( bp, ".files", "images"      ) )
    bBGs_dir    = NS.Folder.fromPath( NS.path.join( bp, ".files", "beautyBGs"   ) )
    massDBFile  = NS.knownFolders.documents().getFile( "m.db" )
    glssDBFile  = NS.knownFolders.documents().getFile( "g.db" )
    flssDBFile  = NS.knownFolders.documents().getFile( "f.db" )
    rbssDBFile  = NS.knownFolders.documents().getFile( "r.db" )
    favsDBFile  = NS.knownFolders.documents().getFile( "v.db" )
    bigKeyFile  = NS.knownFolders.documents().getFile( "key"  )

    if ( TNS_ENV !== 'production' ) {
        massDBFile  = NS.File.fromPath  ( NS.path.join( bp, ".documents", "m.db"  ) )
        glssDBFile  = NS.File.fromPath  ( NS.path.join( bp, ".documents", "g.db"  ) )
        flssDBFile  = NS.File.fromPath  ( NS.path.join( bp, ".documents", "f.db"  ) )
        rbssDBFile  = NS.File.fromPath  ( NS.path.join( bp, ".documents", "r.db"  ) )
        favsDBFile  = NS.File.fromPath  ( NS.path.join( bp, ".documents", "v.db"  ) )
        bigKeyFile  = NS.File.fromPath  ( NS.path.join( bp, ".documents", "key"   ) )
    }

}

// -- =====================================================================================

function getBigKey () {

    let bigXStr = bigKeyFile.readTextSync()
    let bigStr  = x007( bigXStr, tools.key(), true )

    let bigKey = {}

    try { bigKey = JSON.parse( bigStr ) }
    catch { bigKey = tryToRescue( bigKeyFile, true ) }

    return bigKey

}

// -- =====================================================================================

let bigKeyBusy = false
export function saveBigKey ( keyString: string ): Promise<object> {

    if ( bigKeyBusy ) return new Promise( _ => setTimeout( _ => saveMass(), 10 ) )

    bigKeyBusy = true

    return new Promise ( async (rs, rx) => {

        if ( refreshBackUP( bigKeyFile ) )
            bigKeyFile.
            writeText( keyString )
            .then( () => rs( JSON.parse( x007( keyString, tools.key(), true ) ) ) )
            .catch( err => rx() )
            .finally( () => bigKeyBusy = false )
        else
            rx( "backUpFailed!" )

    } )

}

// -- =====================================================================================

function tryToRescue ( file: NS.File, decode = false ) {

    let data = {},
        bk_path = file.path + ".bak"

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

    return data

}

// -- =====================================================================================

export function putLessonsInBox () {

    let mDB: { [key: string]: TS.Lesson[] } = {}

    try { mDB = JSON.parse( massDBFile.readTextSync() ) }
    catch { mDB = tryToRescue( massDBFile ) }

    for ( let ins of store.state.appConfig.institutes ) if ( !(ins in mDB) ) mDB[ins] = []

    // .. loop over lessons - keep for further checks
    // for ( let ins of store.state.appConfig.institutes ) {
    //     for ( let lesson of mDB[ins] ) {
    //         for ( let org of lesson.protoplasm ) {
    //             if( org.type === "dText" ) {
    //                 for ( let word of org.content ) {
    //                     if ( typeof word[1].snap === "number" )
    //                         console.log(word[1].snap)
    //                 }
    //             }
    //         }
    //     }
    // }

    store.state.massDB = tools.mDBValidator( mDB, getBigKey() )

    // .. Add OffRoad Lessons
    for ( let ins of store.state.appConfig.activeInstitutes ) {
        store.state.massDB[ ins ] = store.state.massDB[ ins ].filter( x => x.chromosome.code.ribosome !== "OFFROAD" )
        ultraDriver( ins, "video" )
    }
    
    // .. Add MNTBike Lessons
    for ( let ins of store.state.appConfig.activeInstitutes ) {
        store.state.massDB[ ins ] = store.state.massDB[ ins ].filter( x => x.chromosome.code.ribosome !== "MNTBIKE" )
        ultraDriver( ins, "audio" )
    }

}

// -- =====================================================================================

export function putGlossariesInBox () {

    let gDB: TS.GlssDB = {}

    try { gDB = JSON.parse( glssDBFile.readTextSync() ) }
    catch { gDB = tryToRescue( glssDBFile ) }

    for ( let ins of store.state.appConfig.institutes ) if ( !(ins in gDB) ) gDB[ins] = {}

    store.state.glssDB = gDB

}

// -- =====================================================================================

export function putFlashcardsInBox () {

    let fDB: { [key: string]: TS.Flashcard[] } = {}

    try { fDB = JSON.parse( flssDBFile.readTextSync() ) }
    catch { fDB = tryToRescue( flssDBFile ) }

    for ( let ins of store.state.appConfig.institutes ) if ( !(ins in fDB) ) fDB[ins] = []

    store.state.flssDB = fDB

}

// -- =====================================================================================

export function putFavoritesInBox () {

    let vDB: { [key: string]: string[] } = {}

    try { vDB = JSON.parse( favsDBFile.readTextSync() ) }
    catch { vDB = tryToRescue( favsDBFile ) }

    for ( let ins of store.state.appConfig.institutes ) if ( !(ins in vDB) ) vDB[ins] = []

    store.state.favsDB = vDB

}

// -- =====================================================================================

export function putRibosomesInBox () {

    let rDB: { [key: string]: TS.Ribosome[] } = {}

    try { rDB = JSON.parse( rbssDBFile.readTextSync() ) }
    catch { rDB = tryToRescue( rbssDBFile ) }

    for ( let ins of store.state.appConfig.institutes ) if ( !(ins in rDB) ) rDB[ins] = []

    store.state.rbssDB = rDB

}

// -- =====================================================================================

let mDBBusy = false
export function saveMass (): Promise<void> {

    let ubrig_massDB: { [key: string]: TS.Lesson[] } = {}
    ubrig_massDB = OFF_MNT_X()

    if ( mDBBusy ) return new Promise( _ => setTimeout( _ => saveMass(), 10 ) )

    mDBBusy = true

    return new Promise ( async (rs, rx) => {

        if ( refreshBackUP( massDBFile ) )
            massDBFile.
            writeText( JSON.stringify( ubrig_massDB ) )
            .then( () => rs() )
            .catch( err => rx() )
            .finally( () => mDBBusy = false )
        else
            rx( "backUpFailed!" )

    } )

}

// -- =====================================================================================

let gDBBusy = false
export function saveGlossar (): Promise<void> {

    if ( gDBBusy ) return new Promise( _ => setTimeout( _ => saveGlossar(), 10 ) )

    gDBBusy = true

    return new Promise ( async (rs, rx) => {

        if ( refreshBackUP( glssDBFile ) )
            glssDBFile.
            writeText( JSON.stringify( store.state.glssDB ) )
            .then( () => rs() )
            .catch( err => rx() )
            .finally( () => gDBBusy = false )
        else
            rx( "backUpFailed!" )

    } )

}

// -- =====================================================================================

let fDBBusy = false
export function saveFlashCards (): Promise<void> {

    if ( fDBBusy ) return new Promise( _ => setTimeout( _ => saveFlashCards(), 10 ) )

    fDBBusy = true

    return new Promise ( async (rs, rx) => {

        if ( refreshBackUP( flssDBFile ) )
            flssDBFile.
            writeText( JSON.stringify( store.state.flssDB ) )
            .then( () => rs() )
            .catch( err => rx() )
            .finally( () => fDBBusy = false )
        else
            rx( "backUpFailed!" )

    } )

}

// -- =====================================================================================

let vDBBusy = false
export function saveFavorites (): Promise<void> {

    if ( vDBBusy ) return new Promise( _ => setTimeout( _ => saveFavorites(), 10 ) )

        vDBBusy = true

    return new Promise ( async (rs, rx) => {

        if ( refreshBackUP( favsDBFile ) )
            favsDBFile.
            writeText( JSON.stringify( store.state.favsDB ) )
            .then( () => rs() )
            .catch( err => rx() )
            .finally( () => vDBBusy = false )
        else
            rx( "backUpFailed!" )

    } )

}

// -- =====================================================================================

let rDBBusy = false
export function saveRibosomes (): Promise<void> {

    if ( rDBBusy ) return new Promise( _ => setTimeout( _ => saveRibosomes(), 10 ) )

    rDBBusy = true

    return new Promise ( async (rs, rx) => {

        if ( refreshBackUP( rbssDBFile ) )
            rbssDBFile.
            writeText( JSON.stringify( store.state.rbssDB ) )
            .then( () => rs() )
            .catch( err => rx() )
            .finally( () => rDBBusy = false )
        else
            rx( "backUpFailed!" )

    } )

}

// -- =====================================================================================

function refreshBackUP ( file: NS. File ) {

    let bk  = NS.File.fromPath ( NS.path.join( file.path + ".bak" ) ),
        _bk = NS.File.fromPath ( NS.path.join( file.path + ".bak.tmp" ) ),
        ok  = false,
        CB  = err => ok = false

    // .. write tmp file
    _bk.writeSync( file.readSync() )
    // .. check tmp
    try { if ( _bk.readTextSync() === file.readTextSync() ) ok = true } catch {}

    // .. remove old backUP
    bk.removeSync( CB )

    // .. register tmp as bak
    if ( ok ) _bk.renameSync( bk.name, CB )

    return ok

}

// -- =====================================================================================

export function organellesLoader ( lesson: TS.Lesson ): Promise<void> {

    // ! check availability of file in internet
    return new Promise ( async (rs, rx) => {

        // .. essential organelles
        // TODO just designed for up to 2 organs (one of them should be text)
        let media = lesson.chromosome.model.filter( x => x !== "dText" )
        // .. searching for organelle
        let organelle = lesson.protoplasm.find( x => x.type === media[0] )

        // .. NON-TXT organelles has been Found
        if ( organelle ) await orgHandler( organelle, "mediaPath" )
        // .. it has been NOT found!
        else return rx( media[0] + ": is missed!" )

        // .. decorative organelles
        let avatar = lesson.protoplasm.find( x => x.type === "dAvatar" )
        if ( avatar ) orgHandler( avatar, "avatarPath" )
        else store.state.inHand.avatarPath = null

        // .. register and resolve a void answer
        store.state.inHand.lesson = lesson
        rs()

    } )

}

// -- =====================================================================================

async function orgHandler ( org: TS.Organelle, mps: string ) {

    let hand = store.state.inHand

    // .. source will be reset
    hand[ mps ] = null

    // .. youTube & copyRighted Material will not save locally
    if ( !org.isYouTube && !org.copyRight ) {

        // .. last downloaded & available file will replace the sourceURL
        if ( org.address ) {
            let f = NS.path.join( baseFolder.path, org.address )
            if ( NS.File.exists(f) ) hand[ mps ] = f
            // ! do not use this line of code! we need it for ram
            // // .. some issues with the file detected!
            // else delete org.address
        }

        // .. NOTHING STILL has been found in local storage! (re-)download it!
        if ( !hand[ mps ] ) await get_org_media(org).then( p => hand[ mps ] = p )

    }
    // .. Online sourceURL will assign as mediaPath
    else hand[ mps ] = org.sourceURL

}

// -- =====================================================================================

function get_org_media ( org: TS.Organelle ): Promise<string> {

    return new Promise ( (rs, rx) => {

        let _dir: NS.Folder
        if ( org.type === "dAudio"   ) _dir = Audios_dir
        if ( org.type === "dVideo"   ) _dir = Videos_dir
        if ( org.type === "dImage"   ) _dir = Images_dir
        if ( org.type === "dAvatar"  ) _dir = Avatars_dir

        // .. try to purifying the name
        try {
            let pat = _dir.path.replace( baseFolder.path, "" )
            org.address = org.address.replace( pat, "" )
        } catch {}
        // .. use the already allocated PURE name or get a new one
        let name = org.address || anAvailableNameIn( _dir ),
            path = NS.path.join( _dir.path, name )

        // .. downloading Pic
        if ( org.type === "dAvatar" || org.type === "dImage" ) {
            // ! PNG???
            NS.Http.getImage( org.sourceURL ).then( imageSource => {
                if ( imageSource.saveToFile( path, "jpg" ) )
                    org.address = path.replace( baseFolder.path, "" )
                rs( NS.path.join( baseFolder.path, org.address ) )
            } )
        }
        // .. downloading AUDIO|VIDEO
        else {
            Bus.$emit( "Downloading_Panel", "start" )
            NS.Http.getFile( org.sourceURL, path ).then( fileSource => {
                org.address = path.replace( baseFolder.path, "" )
                Bus.$emit( "Downloading_Panel", "stop" )
                rs( NS.path.join( baseFolder.path, org.address ) )
            } )
        }

    } )

}

// -- =====================================================================================

function anAvailableNameIn ( folder: NS.Folder ) {

    let i = 0
    let newName: string

    do { newName = tools.randomStr( 7+ i++ ) }
    while ( folder.getEntitiesSync().some( f => f.name.includes( newName ) ) )

    return newName

}

// -- =====================================================================================

export async function getMedia ( path: string ) {

    let answer: string

    await NS.Folder.fromPath( path ).getEntities().then( async entities => {

        // TODO support all formats
        for ( const e of entities )
            if( NS.File.exists( e.path ) )
                if
                (
                    NS.File.fromPath( e.path ).extension === ".mp3" ||
                    NS.File.fromPath( e.path ).extension === ".mp4" ||
                    NS.File.fromPath( e.path ).extension === ".mkv"
                )
                    answer = e.path

    } )

    return answer

}

// -- =====================================================================================

export async function avatar ( name: string, folderPath: string, avatarURL: string ) {

    let picName = name.replace( /[/|\:*?"<>]/g , ' ' ) + ".jpg"
    let picPath = NS.path.join( folderPath , picName )

    return NS.Http.getFile( avatarURL , picPath )
    .then(
        pic => picPath,
        e => Promise.reject( e + '' )
    )
    .catch( e => Promise.reject( e + '' ) )

}

// -- =====================================================================================

export async function
media ( name: string, folderPath: string, mediaURL: string, ext: ".mp3"|".mp4"|".mkv" ) {

    // TODO other formats?
    let mediaName = name.replace( /[/|\:*?"<>]/g , ' ' ) + ext
    let mediaPath = NS.path.join( folderPath , mediaName )

    // store.state.progress = 'Downloading ...'

    return NS.Http.getFile( mediaURL , mediaPath )
    .then(
        audio => mediaPath,
        e => Promise.reject( e + '' )
    )
    .catch( e => Promise.reject( e + '' ) )

    // store.state.progress = String.fromCharCode( '0xf058' ) + ' Downloaded' ,

}

// -- =====================================================================================

export function have_these_on_local ( ribosome: TS.Ribosome ) {

    let all = store.state.massDB[ store.state.inHand.institute ]
    let i_have_these: string[] = []

    for ( let lesson of Object.values( all ) )
        if ( lesson.chromosome.code.ribosome === ribosome.code )
            i_have_these.push( lesson.chromosome.code.idx )

    return i_have_these

}

// -- =====================================================================================

function ultraDriver ( ins: string, type: "audio"|"video" ) {

    // .. get valid OffRoads Data
    let Folders = FolderReader( ins, type ),
        newData: TS.Lesson = { chromosome: null, protoplasm: null }

    // .. convert data to lessons
    for ( let lesson of Folders ) {

        let materials = NS.Folder.fromPath( lesson.path ).getEntitiesSync()
        let iDataFile = materials.filter( x => (<any>x).name === "iData.json" )[0]

        // ..load iData File
        if ( iDataFile ) {
            let iData = NS.File.fromPath( iDataFile.path ).readTextSync()
            //! chcek its integrity
            newData = JSON.parse( iData )
        }
        // .. create new File
        else {
            type === "audio" ?
            audioLessonCreator( newData, ins, lesson ):
            videoLessonCreator( newData, ins, lesson )
        }
        
        // ! BIG BAD BUG -- No ADDING NEW LESSON FROM SCRATCH
        // .. register the lesson
        store.state.massDB[ ins ].push( newData )
    
    }

}

// -- =====================================================================================

function FolderReader ( ins: string, type: "audio"|"video" ) {

    const folder = type === "video" ? OffRoad_dir : MNTBike_dir
    const m_xt = type === "video" ? [ ".mp4" , ".mkv" ] : [ ".mp3", null ]
    const t_xt = type === "video" ? ".srt" : ".txt"

    let path = NS.path.join( folder.path, ins )
    let contents = NS.Folder.fromPath( path ).getEntitiesSync()

    // .. pick just Folders - Receursive
    for ( let f of contents ) {
        contents.push(
            ...NS.Folder.fromPath( f.path ).getEntitiesSync().filter(
                item => NS.Folder.exists( item.path )
            )
        )
    }

    // .. check Folder has its mandatory data
    contents = contents.filter( folder => {
        let pass_code = 1
        let junk_code = 0
        for( let item of NS.Folder.fromPath( folder.path ).getEntitiesSync() ) {
            if( (<any>item).extension === m_xt[0] )         pass_code += 700
            else if( (<any>item).extension === m_xt[1] )    pass_code += 700
            else if( (<any>item).extension === t_xt )       pass_code += 70
            else if( (<any>item).extension === ".jpg" )     pass_code += 0
            else if( (<any>item).name === "iData.json" )    pass_code += 0
            else junk_code++
        }
        // .. accepts only folders with one video and|without one str file!
        return (pass_code === 771 || pass_code === 701) && junk_code === 0
    } )

    return contents

}

// -- =====================================================================================

let off_mnt_Busy = false
function OFF_MNT_Saver ( lesson: TS.Lesson ): Promise<void> {

    if ( off_mnt_Busy )
        return new Promise( _ => setTimeout( _ => OFF_MNT_Saver( lesson ), 10 ) )

    off_mnt_Busy = true

    return new Promise ( async (rs, rx) => {

        // .. hPath MODE : reading lessons
        // .. vPath MODE : read lessons
        let address: string
        if ( lesson.chromosome.hPath ) address = lesson.chromosome.hPath.join( "/" )
        else {
            let cPath = lesson.chromosome.vPath.slice()
            cPath.pop()
            cPath.shift()
            address = cPath.join( "/" )
        }

        let path = NS.path.join( baseFolder.path, address, "iData.json" )
        let file = NS.File.fromPath( path )

        file.
        writeText( JSON.stringify( lesson ) )
        .then( () => rs() )
        .catch( err => rx() )
        .finally( () => off_mnt_Busy = false )

        off_mnt_Busy = false

    } )

}

// -- =====================================================================================

function OFF_MNT_X (): { [key: string]: TS.Lesson[] } {

    let OFF_MNT_Lessons: TS.Lesson[],
        ubrig_massDB: { [key: string]: TS.Lesson[] } = {}

    for ( let ins of Object.keys( store.state.massDB ) ) {

        OFF_MNT_Lessons =
            store.state.massDB[ ins ].filter( x => x.chromosome.code.ribosome === "OFFROAD" || x.chromosome.code.ribosome === "MNTBIKE" )

        for ( let lesson of OFF_MNT_Lessons ) OFF_MNT_Saver( lesson )

        // .. trim massDB no OffRoad|MNTBike 
        ubrig_massDB[ ins ] =
            store.state.massDB[ ins ].filter( x => x.chromosome.code.ribosome !== "OFFROAD" && x.chromosome.code.ribosome !== "MNTBIKE" )

    }

    return ubrig_massDB

}

// -- =====================================================================================

function videoLessonCreator ( newData: TS.Lesson, ins: string, lesson: NS.FileSystemEntity  ) {

    let materials = NS.Folder.fromPath( lesson.path ).getEntitiesSync()
    //! just for JPG & SRT formats??
    let video = materials.filter(
            x => (<any>x).extension === ".mp4" ||
            (<any>x).extension === ".mkv"
        )[0],
        videoPath: string, avatarPath: string,
        avatar = materials.filter( x => (<any>x).extension === ".jpg" )[0],
        subtitle = materials.filter( x => (<any>x).extension === ".srt" )[0],
        content: TS.UniText[]

    // .. try to get subtitle in format of SRT
    if ( subtitle ) {
        let srt = NS.File.fromPath( subtitle.path ).readTextSync()
        content = tools.srtParser( srt )
    }

    let pasi = lesson.path.split("/").slice(7)

    newData.chromosome = {
        institute       : ins                                               ,
        model           : [ "dVideo", "dText" ]                             ,
        code            : { ribosome: "OFFROAD", idx: pasi.join("/") }      ,
        level           : "C1"                                              ,
        title           : lesson.name                                       ,
        hPath           : [ "Off Road", ins, ...pasi ]                      ,
        vPath           : null                                              ,
        status          : "reading"                                         ,
        sync            : false                                             ,
    }

    videoPath = [ ...newData.chromosome.hPath, video.name ].join( "/" )

    newData.protoplasm = [
        { type: "dVideo", address: videoPath, sourceURL: videoPath },
        { type: "dText", content: content }
    ]

    // .. add avatar if exists - path need to be trimmed
    if ( avatar ) {
        avatarPath = avatar.path.split("/").slice(5).join("/")
        newData.protoplasm.push( { type: "dAvatar", address: avatarPath } )
    }

}

// -- =====================================================================================

function audioLessonCreator ( newData: TS.Lesson, ins: string, lesson: NS.FileSystemEntity  ) {

    let materials = NS.Folder.fromPath( lesson.path ).getEntitiesSync()
    //! just for JPG & SRT formats??
    let audio = materials.filter( x => (<any>x).extension === ".mp3" )[0],
        audioPath: string, avatarPath: string,
        avatar = materials.filter( x => (<any>x).extension === ".jpg" )[0],
        text = materials.filter( x => (<any>x).extension === ".txt" )[0],
        content: TS.UniText[]

    // .. try to get text in format of TXT
    if ( text ) {
        let txt = NS.File.fromPath( text.path ).readTextSync()
        // ! you can add snaps from here
        let snaps = []
        content = genetics.aCB( txt, snaps )
    }

    let pasi = lesson.path.split("/").slice(7)

    newData.chromosome = {
        institute       : ins                                                           ,
        model           : [ "dAudio", "dText" ]                                         ,
        code            : { ribosome: "MNTBIKE", idx: pasi.join("/") }                  ,
        level           : "B2"                                                          ,
        title           : lesson.name                                                   ,
        hPath           : [ "Mountain Bike", ins, ...pasi ]  ,
        vPath           : null                                                          ,
        status          : "reading"                                                     ,
        sync            : false                                                         ,
    }

    audioPath = [ ...newData.chromosome.hPath, audio.name ].join( "/" )

    newData.protoplasm = [
        { type: "dAudio", address: audioPath, sourceURL: audioPath },
        { type: "dText", content: content }
    ]

    // .. add avatar if exists - path need to be trimmed
    if ( avatar ) {
        avatarPath = avatar.path.split("/").slice(5).join("/")
        newData.protoplasm.push( { type: "dAvatar", address: avatarPath } )
    }

}

// -- =====================================================================================

function n_allocator ( n: number, lessons: TS.Lesson[] ) {

    // .. recheck lessons for non-allocated-idx-s
    for ( let lesson of lessons )
        if ( lesson.chromosome.code.idx === null )
            lesson.chromosome.code.idx = ( n++ ).toString()

}

// -- =====================================================================================
