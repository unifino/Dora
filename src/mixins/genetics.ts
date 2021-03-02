import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import * as storage                     from "@/mixins/storageHandler"
import { x007 }                         from '@/mixins/android007Agent'
import store                            from "@/mixins/store"
import Bus                              from "@/mixins/bus"
import * as tools                       from "@/mixins/tools"

// -- =====================================================================================

export function copyingRibosome ( ribosome: TS.Ribosome ) {
    // .. register in ribosomeBox
    store.state.rbssDB[ store.state.inHand.institute ][ ribosome.code ] = ribosome;
} 

// -- =====================================================================================

export function removeRibosome ( ribosome: TS.Ribosome ) {
    delete store.state.rbssDB[ ribosome.institute ][ ribosome.code ];
}

// -- =====================================================================================

export function retrieving_cell ( ribosome: TS.Ribosome ): void {

    if ( !store.state.appConfig.email ) {
        tools.toaster( "Log in First!" );
        return;
    }

    Bus.$emit( "Base_HeadToIPanel" );

    let url = tools.ssd + 'x_cell';

    NS.Http.request( {
        url: url ,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify( {
            e: store.state.appConfig.email,
            k: tools.key(),
            r: ribosome.code,
            l: storage.have_these_on_local( ribosome ),
        } )
    } )
    .then(
        async res => {

            let x = res.content.toJSON() as TS.SSD_Res;
            const t =JSON.stringify( {
                e: store.state.appConfig.email,
                k: tools.key(),
                r: ribosome.code,
                l: storage.have_these_on_local( ribosome ),
            } );

            if ( x.status === 200 ) {

                await new Promise( _ => setTimeout( _, 500 ) );

                saveCell( JSON.parse( x007( x.answer as string, tools.key(), true ) ) )
                .then( async () => {

                    Bus.$emit( "IPanel_Result" );
                    await new Promise( _ => setTimeout( _, 1500 ) );
                    Bus.$emit( "Institute_FolderListCalculator" );
                    Bus.$emit( "Battery_update" );

                } )
                .catch( err => Bus.$emit( "IPanel_Result", err ) );
            }
            else Bus.$emit( "IPanel_Result", x.reason );

        },
        e => Bus.$emit( "IPanel_Result", e )
    )
    .catch( e => Bus.$emit( "IPanel_Result", e ) );

}

// -- =====================================================================================

export function saveCell ( cell: TS.cell ): Promise<void> {

    return new Promise ( (rs, rx) => {

        // .. Build Context
        mutator( cell )
        // .. registration
        .then( () => store.state.massDB[ cell.chromosome.institute ].push( cell ) )
        // .. success
        .then( () => rs() )
        .catch ( () => rx( "Unable To Parse Data!" ) );

    } );

}

// -- =====================================================================================

// TODO just designed for up to organs (one of them should be text)
function mutator ( cell: TS.cell ) {

    let context: TS.UniText[];

    // .. Handel new Audio-Text Lesson
    if ( cell.chromosome.model.includes( "dAudio" ) ) context = mutate_audio( cell );
    // .. Handel new Video-Subtitle Lesson
    if ( cell.chromosome.model.includes( "dVideo" ) ) context = mutate_video( cell );
    // .. Handel new Image-Text Lesson
    if ( cell.chromosome.model.includes( "dImage" ) ) context = mutate_image( cell );
    // ! bad practice
    // .. Handel new SLIDE Lesson
    if ( cell.chromosome.model[0] === "rawText" && cell.chromosome.model[1] === "rawText" ) {
        context = mutate_slide( cell );
        return context.length ? Promise.resolve() : Promise.reject();
    }

    // .. update glssDB
    for ( let row of context ) tools.wordStating( row[0], cell.chromosome.institute );
    tools.glssDBUpdater( cell.chromosome.institute );

    return context.length ? Promise.resolve() : Promise.reject();

}

// -- =====================================================================================

function mutate_slide ( cell: TS.cell ) {

    let dRawText = cell.protoplasm[1],
        context = sCB( dRawText.text );

    if ( context.length ) {
        dRawText.type = "dText";
        dRawText.content = context;
        delete dRawText.text;
        cell.chromosome.model[0] = null;
        cell.chromosome.model[1] = "dText";
    }

    return context;

}

// -- =====================================================================================

function mutate_audio ( cell: TS.cell ) {

    let dRawText = cell.protoplasm.find( x => x.type === "rawText" ),
        context = aCB( dRawText.text, dRawText.initSnaps );

    if ( context.length ) {
        dRawText.type = "dText";
        dRawText.content = context;
        delete dRawText.text;
        cell.chromosome.model[1] = "dText";
    }

    return context;

}

// -- =====================================================================================

function mutate_video ( cell: TS.cell ) {

    let dSubtitle = cell.protoplasm.find( x => x.type === "subtitle" ),
        context = vCB( dSubtitle.text );

    if ( context.length ) {
        dSubtitle.type = "dText";
        dSubtitle.content = context;
        delete dSubtitle.text;
        cell.chromosome.model[1] = "dText";
    }

    return context;

}


// -- =====================================================================================

function mutate_image ( cell: TS.cell ) {

    let dRawText = cell.protoplasm.find( x => x.type === "rawText" ),
        context = aCB( dRawText.text, [] );

    if ( context.length ) {
        dRawText.type = "dText";
        dRawText.content = context;
        delete dRawText.text;
        cell.chromosome.model[1] = "dText";
    }

    return context;

}

// -- =====================================================================================

function aCB ( text: string, initSnaps: [number,number][] ) {

    let words = [],
        context: TS.UniText[] = [],
        paragraphs: string[],
        map = {
            amp     : '&' ,
            lt      : '<' ,
            gt      : '>' ,
            quot    : '"' ,
            '#39'   : "'" ,
            '#039'  : "'"
        }

    text = text.trim();
    text = text.replace( /&([^;]+);/g , ( m, c ) => map[c] || ''  );
    text = text.replace( /-/g         , '—'                       );
    text = text.replace( /\t/g        , ' '                       );
    text = text.replace( / +/g        , ' '                       );
    text = text.replace( /\n\s*\n/g   , '\n'                      );
    text = text.trim();

    // ..separate paragraphs
    paragraphs = text.split ( "\n" );

    for ( let [ i, paragraph ] of paragraphs.entries() ) {

        words = paragraph.split( ' ' );

        for ( const word of words ) {
            if ( word ) context.push( [ word, {} ] );
            else context.push( [ null, { isBreakLine: true } ] );
        }

        // .. paragraph separator
        if ( i < paragraphs.length -1 ) context.push( [ null, { isBreakLine: true } ] );

    }

    // .. apply snaps to context
    for ( let x of initSnaps ) {
        if ( x[0] === -1 ) context[ context.length -1 ][1].snap = x[1];
        else if ( x[0] < context.length ) context[ x[0] ][1].snap = x[1];
    }

    return context;

}

// -- =====================================================================================

function vCB ( subtitle: string ) {

    let context: TS.UniText[],
        sub = /<p begin=\".*. end=\".*.\">.*.<\/p>/g,
        srt = /[0-9]*:*[0-9]*:*[0-9,]* --> [0-9]*:*[0-9]*:*[0-9,]*/g;

    // .. sub Mode
    if ( subtitle.match( sub ) ) context = tools.subParser( subtitle );
    // .. srt Mode
    else if( subtitle.match( srt ) ) context = tools.srtParser( subtitle );
    // .. Unknown Text!
    else context = [];

    return context;

}

// -- =====================================================================================

function cCB ( text: string ) {

    // let bubbles: TS.bubble[] = [];

    // // ..separate bubble
    // for ( let bubble of text.split ( "\n\n" ) ) {
    //     bubbles.push( { text: bubble } );
    // }

    // return bubbles;

}

// -- =====================================================================================

function sCB ( rawText: string ) {

    interface card {
        type: "Text" | "Image",
        value: string
    };

    let context: TS.UniText[] = [],
        crd: { a: card[], b: card[] }[] = [];

    // .. try to read Data
    try { crd = JSON.parse( rawText ) } catch {};

    // .. convert Data to UniText
    for ( let i=0; i < crd.length; i++ ) {

        // .. card A
        for ( let a = 0; a < crd[i].a.length; a++ )
            context.push( [ crd[i].a[a].value, { isURL: crd[i].a[a].type === "Image" } ] );

        // .. divider
        context.push( [ null, { isBreakLine: true } ] );

        // .. card B
        for ( let b = 0; b < crd[i].b.length; b++ )
            context.push( [ crd[i].b[b].value, { isURL: crd[i].b[b].type === "Image" } ] );

        // .. end of page
        context.push( [ null, { standoff: "block" } ] );

    }

    return context;

}

// -- =====================================================================================
