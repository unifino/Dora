export enum Languages {
    en = "English",
    de = "Deutsch",
    it = "Italiano",
    tr = "Türkçe",
    fr = "Français",
    fa = "فارسی",
}

export type Lng = "en"|"de"|"it"|"tr"|"fr"|"fa";

export let RTL_List = [ Languages.fa ];

// -- =====================================================================================

export type ThemaName = 
      'White'
    | 'Smoky'
    | 'Milky'
    | 'Black'
    | 'DarkGreen'
    | 'WarmBlue'
    | 'CozyBlue'
    | 'AppBlue'
    ;

export type ThemaName_Light =
      'White'
    | 'Smoky'
    | 'Milky'
    ;

export type ThemaName_Dark =
      'Black'
    | 'DarkGreen'
    | 'GreatGray'
    | 'WarmBlue'
    | 'CozyBlue'
    | 'AppBlue'
    ;

export enum BGColors {

    White       = "#FFFFFF",
    Smoky       = "#e6e6e6",
    Milky       = "#fcefe6",
    Black       = "#000000",
    DarkGreen   = "#0a1c20",
    GreatGray   = "#1e2c2f",
    WarmBlue    = "#125689",
    CozyBlue    = "#3181a6",
    AppBlue     = "#135f82",

}

// .. the value use for className
export enum B_W {
    Black = "light",
    White = "dark"
}

export enum contentColorType {

    White       = B_W.Black,
    Smoky       = B_W.Black,
    Milky       = B_W.Black,
    Black       = B_W.White,
    DarkGreen   = B_W.White,
    GreatGray   = B_W.White,
    WarmBlue    = B_W.White,
    CozyBlue    = B_W.White,
    AppBlue     = B_W.White,

}

// -- =====================================================================================

export interface appConfig {

    appConfigVersion    : string        ,
    institutes          : string[]      ,
    activeInstitutes    : string[]      ,
    instituteBookmark   : string        ,
    theme               : ThemaName     ,
    fontFace            : string        ,
    fontSize            : number        ,
    sortCode            : number        ,
    baseTime            : number        ,
    minNumberLength     : number        ,
    email               : string        ,
    dictionaries        : [ Lng, Lng ]  ,
    beautyBGs           : string[]      ,

}

// -- =====================================================================================

export interface preinstalled_Lesson_subData {
    name      : string,
    dataFile  : string,
}

export interface preinstalled_Lesson {
    [key: string]: preinstalled_Lesson_subData[]
}

// -- =====================================================================================

export interface travelInfo {

    transitionName  : string,
    institute       : string,
    duration        : number

}

export enum TravelBack {
    fromTop     = "fromTop",
    fromBottom  = "fromBottom"
}

export type here =
      'Entrance'
    | 'Institute'
    | 'ClassRoomEntrance'
    | 'ClassRoom'
    | 'Salon_F'
    | 'IPanel'
    ;

export type AppMode =
      "reading"
    | "snapping"
    | "selective"
    | "binding"
    | "editing"
    | "restore"
    | "setting"
    | "shopping"
    | "traveling"
    | "idle"
    ;

export type Place = "Class"|"Salon_F";

// -- =====================================================================================

export enum SortPhase {
    Random,
    Short,
    Long,
}

// -- =====================================================================================

export interface FolderProperty {
    title       : string,
    icon        : string,
    type        : FolderType,
    path        : string[],
    institute   : string,
    lesson?     : Lesson,
    lessonId?   : number,
    ribosome?   : Ribosome,
}

export type FolderType =
      "ordinary"
    | "special"
    | "shortLink"
    | "divider"
    | "category"
    | "shop"
    | "shopItem"
    ;

// -- =====================================================================================

export interface cell {
    chromosome      : Chromosome                    ,
    protoplasm      : Organelle[]                   ,
}

export interface rawSnap { [key: string]: string }

// -- =====================================================================================

export interface UniText {
    [0]:  string,
    [1]:  UniTextFlags,
    [2]?: LinkedMaterials,
    length : 2|3,
}
export interface UniWord extends UniText {
    [1]: UniWordFlags,
}
export interface UniTextFlags {
    isDeleted?      : boolean                       ,
    phrased?        : "blue"|"red"                  ,
    bind?           : number                        ,
    snap?           : number                        ,
    standoff?       : "block"|"bridge"|"depart"     ,
    isBreakLine?    : boolean                       ,
    isURL?          : boolean                       ,
}
export interface UniWordFlags extends UniTextFlags{
    level?          : CEF                           ,
    type?           : "regular"|"irregular"         ,
    auxiliary?      : "sein"|"haben"                ,
}
export type LinkedMaterials = Organelle[];

// -- =====================================================================================

export interface Ribosome {
    institute       : string                        ,
    code            : string                        ,
    type            : LessonType                    ,
    level           : CEF                           ,
    title           : string                        ,
    avatar          : string                        ,
    source          : string                        ,
    contains        : number|"∞"                    ,
    readMode        : "start"|"random"|"end"        ,
}

export interface Ribosomes { [key: string]: Ribosome }

export interface ChromosomeCode {                    
    ribosome    : string                            ,
    idx         : string                            ,
}                                                    

export interface Chromosome {
                                                     
    institute       : string                        ,
    model           : OrganelleType[]               ,
    code            : ChromosomeCode                ,
    level?          : CEF                           ,
    title           : string                        ,
    hPath           : string[]                      ,
    vPath           : string[]                      ,
    status          : LessonStatus                  ,
    sync            : boolean                       ,
                                                     
}

export interface Lesson {
    chromosome      : Chromosome                    ,
    protoplasm      : Organelle[]                   ,
}

export type Organelle = {                            
                                                     
    type            : OrganelleType                 ,
                                                     
    sourceURL?      : string                        ,
    copyRight?      : boolean                       ,
    address?        : string                        ,
                                                     
    text?           : string                        ,
    content?        : UniText[]                     ,
    etikett?        : { [key: string]: number[] }   ,
    initSnaps?      : [number,number][]             ,
                                                     
    isYouTube?      : boolean                       ,
                                                     
    location?       : "before"|"after"              ,
    pinnedPoint?    : number                        ,
    position?       : number                        ,
                                                     
    hiddenCards?    : number[]                      ,
                                                     
}

export type LessonType = 'audio'|'video'|'mixed'|"plain";
export type OrganelleType =
      "dAudio"
    | "dVideo"
    | "dImage"
    | "dText"
    | "hypText"
    | "dAvatar"
    | "subtitle"
    | "rawText"
    ;

export type LessonStatus = 'reading' | 'read' | 'skipped';

// -- =====================================================================================

export type WordState = 'N'|'L'|'M';
export interface Glossar {
    [key: string]: {
        state: WordState,
        sync: boolean,
        en?: string,
        de?: string,
        it?: string,
        tr?: string,
        fr?: string,
        fa?: string,
    }
}

export interface GlssDB {
    [key: string]: Glossar
}

// -- =====================================================================================

export interface VIPSentence {
    [0]: string,
    [1]: VIPSentenceFlags,
    length : 2,
}

export interface VIPSentenceFlags {
    isFake?         : boolean                       ,
    lesson          : Lesson                        ,
    A               : number                        ,
    B               : number                        ,
    studyHistory?   : {                              
        oldStep     : number                        ,
        lastVisit   : number                        ,
        oldRedHit   : number                        ,
        acted?      : studyActions                  ,
        newStep?    : number                        ,
        newRedHit?  : number                        ,
    }                                               ,
    translations?   : { [index: string]: string }   ,
} 

export interface Flashcard {
    [0]: string,
    [1]: FlashcardFlags,
    length : 2,
}
export interface FlashcardFlags {
    status      : "memorizing"|"hidden" ,
    step        : number                ,
    lastVisit   : number                ,
    redHit?     : number                ,
    code        : ChromosomeCode        ,
    A           : number                ,
    B           : number                ,
    sync        : boolean               ,
}

// -- =====================================================================================

export type mediaState = 'stopped' | 'playing' | 'paused' | 'pausedByScope';

// -- =====================================================================================

export type studyActions = '+' | '-' | 'x' | '0';

// -- =====================================================================================

export type CEF = "A1"|"A2"|"B1"|"B2"|"C1"|"C2"

// -- =====================================================================================

export type PlaceTriggerInfo = {

    [ K in Place ] : {                            

        position : {                              
            x: number                            ,
            y: number                            ,
        }                                        ,

        size : {                                  
            height: number                       ,
            width: number                        ,
        }                                        ,

    }                                             

}

// -- =====================================================================================

export type SSD_Res = {
    status: 200 | 500,
    answer?: string,
    reason?: string
}

export type RamActions = "upload"|"download"|"purge";
export type RamProfiles = { [key in "init"|"empty"|"full"|"error"]: RamProfile };
export type RamProfile = {
    name: "init" | "empty" | "full" | "error" ,
    icon: string,
    iconColor: string
}

export type zip = {
    mass: { [key: string]: Lesson[] },
    flss: { [key: string]: Flashcard[] },
    glss: { [key: string]: Glossar }
}

// -- =====================================================================================

export type DictionaryProfiles = {
    [key in "init"|"ready"|"updating"|"exceedQuota"|"error"]: DictionaryProfile 
};
export type DictionaryProfile = {
    name: "init"|"ready"|"updating"|"exceedQuota"|"error" ,
    icon: string,
    iconColor: string
}

