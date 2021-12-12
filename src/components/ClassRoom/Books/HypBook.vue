<template>
<GridLayout
    ref="bookCover"
    class="bookCover"
    rows="150,*,150"
    columns="50,*,50"
    visibility="collapsed"
    @swipe="swipeControl"
>

<!---------------------------------------------------------------------------------------->

    <ScrollView row=1 colSpan=3 class="pagesBox" orientation="vertical"  >

        <StackLayout width="100%" >
            <StackLayout
                v-for="(word,i) in this.hypText.content"
                :key=i
                class="hypRow"
                @tap=playThisOne(word[2])
            >
                <label :text=word[0] textWrap=true whiteSpace=wrap />
            </StackLayout>
        </StackLayout>

    </ScrollView>

<!---------------------------------------------------------------------------------------->

    <PageMargin ref="pageMarginLeft"  rowSpan=3 col=0 :hover="false" location="left"  />
    <PageMargin ref="pageMarginRight" rowSpan=3 col=2 :hover="false" location="right" />

<!---------------------------------------------------------------------------------------->

    <!-- <Indicator ref="indicator" colSpan=3 row=2 :dots=dots :currentIndex="inx +1" /> -->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop, Ref }    from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import nWord                            from "@/components/tools/n_Word.vue"
import * as tools                       from "@/mixins/tools"
import MiniMenu                         from "@/components/ClassRoom/MiniMenu.vue"
import Indicator                        from "@/components/ClassRoom/Books/Indicator.vue"
import PageMargin                       from "@/components/ClassRoom/Books/PageMargin.vue"
import Bus                              from "@/mixins/bus"
import * as tnsPLY                      from "@/mixins/audioPlayer"

// -- =====================================================================================

@Component ( { 
    components: { nWord, Indicator, PageMargin } 
} )

// -- =====================================================================================

export default class HypBook extends Vue {

// -- =====================================================================================

hypText: TS.Organelle = {} as any;
book: { data: TS.UniText, class: string, refId: number }[][] = [];
pagesInHand: number[] = [];
inx: number = -1;
dots = 0;
exitPermission = false;
tapHasBeenHandled = false;
maxAttempt = 100;
etikett: number[];

// -- =====================================================================================

mounted () {

    // Bus.$on( 'Book_selecting', this.selecting );
    Bus.$on( 'Book_blattern', this.blattern );

    // store.watch(
    //     state => state.mode,
    //     newVal => this.bookCoverPainter( newVal )
    // );

}

// -- =====================================================================================

init ( hypText: TS.Organelle, etikett: number[], bookmark: number ) {

    ( this.$refs.bookCover as any ).nativeView.visibility = "visible";
    this.hypText = hypText;
    this.etikett = etikett;
    this.dots = ( this.etikett ).length;

    // // .. get needed-page-ids ready
    // this.bookmarkValidator( bookmark );
    // // .. type the book & publish some page(s)
    // this.bookPublisher();

}

// -- =====================================================================================

playThisOne ( materials: TS.LinkedMaterials ) {

    // .. find audio file
    let audio = materials.find( x => x.type === "dAudio" );
    // .. play it (online) in case of presence of audio file
    if ( audio ) {
        if ( tnsPLY.playerOptions.audioFile !== audio.sourceURL )
            tnsPLY.init( audio.sourceURL );
        // .. wait a bit
        setTimeout( () => tnsPLY.play(), 500 );
    }

}

// -- =====================================================================================

bookmarkValidator( bookmark: number ) {

    // .. beginning of flashing mentioned sentence impact on bookmark
    if ( store.state.preserve.flash.length > 0 ) {
        for ( let i in this.etikett ) {
            if ( this.etikett[i] > store.state.preserve.flash[0] ) {
                bookmark = Number(i);
                break;
            }
        }
    }

    // .. go to the Bookmark
    if ( bookmark < this.etikett.length ) {

        let a: number,
            b: number;

        // .. just 7 Pages
        if ( this.etikett.length > 7 ) { a = bookmark -3; b = bookmark +3; }
        // .. whole Pages
        else { a = 0; b = this.etikett.length -1; }

        for ( let i = a; i <= b; i++ ) if ( i > -1 ) this.pagesInHand.push(i);

        this.inx = bookmark;

    }
    // .. no valid Bookmark! First Page will be shown
    else {
        this.pagesInHand = [0,1];
        this.inx = 0;
    }

}

// -- =====================================================================================

async swipeControl ( args: NS.SwipeGestureEventData ) {

    // // TODO animation cause problem in Editing Mode
    // if ( store.state.mode === "editing" ) return 0;

    // Bus.$emit( "ToolBar_Fade", 0, false, false, 150 )

    // if ( store.state.mode === "snapping" ) Bus.$emit( "ToolBar_Snap", false );

    // await new Promise( _ => setTimeout( _ , 0 ) );

    // let d = args.direction;
    // if ( d === NS.SwipeDirection.left ) this.blattern( "next" );
    // if ( d === NS.SwipeDirection.right ) this.blattern( "previous" );

}

// -- =====================================================================================

exit_TO: NodeJS.Timeout | any;
blattern ( direction: "previous"|"next" ) {

    // .. exit checking
    if ( this.exitCtl( direction ) ) return 0;

    let wasOnX = this.inx,
        lesson = store.state.inHand.lesson;

    // .. blattern data
    switch ( direction ) {

        case 'next':
            if ( this.inx < this.etikett.length -1 ) this.inx++;
            else {
                let msg = '❖  THE END.  ❖';
                if ( lesson.chromosome.status === "reading" ) {
                    msg += '\n\nYou can confirm it as "Read"!'
                    let miniMenu = this.$parent.$parent.$refs.miniMenu as MiniMenu;
                    miniMenu.miniMenu( 400, "up" );
                }
                tools.toaster( msg );
            };
            break;

        case 'previous':
            if ( this.inx > 0 ) this.inx--;
            else tools.toaster( '❖  ' + lesson.chromosome.title + '  ❖' );
            break;

    }

    this.jumpTo( this.inx );

    // .. blattern animation
    if ( wasOnX !== this.inx ) {

        let directionFactor = direction == "next" ? 1 : -1;
        let travel = ( this.$refs.bookCover as any ).nativeView.getActualSize().width;

        this.$refs.page[ wasOnX ].nativeView.animate( { 
            translate: { x: -1* travel *directionFactor, y: 0 } ,
        } );
        this.$refs.page[ this.inx ].nativeView.animate( { 
            translate: { x: travel *directionFactor, y: 0 } ,
            duration: 0
        } );
        this.$refs.page[ this.inx ].nativeView.animate( { 
            translate: { x: 0, y: 0 } ,
        } );

    }

}

// -- =====================================================================================

jumpTo ( idx ) {

    // ! checkkkkk
    tools.toaster( "!!!!!!!" )
    // this.inx = idx;

    // this.pagesInHand = [ ...this.pagesInHand, this.inx ];
    // this.pagesInHand = [ ...new Set( this.pagesInHand ) ];

    // ( this.$refs.indicator as any ).currentIndex = this.inx +1;

    // // .. page caching
    // setTimeout( () => {
    //     this.pagesInHand.push( this.inx -1, this.inx +1 );
    //     this.bookPublisher();
    // } , 350 );

    // // .. soft registration
    // this.dText.pinnedPoint = this.inx;

}

// -- =====================================================================================

exitCtl ( direction ) {

    if ( this.inx === 0 && direction === "previous" ) {

        if ( this.exitPermission ) {
            setTimeout( () => ( this as any ).$navigateBack() , 100 );
            return true;
        } else {
            this.exitPermission = true;
            this.exit_TO = setTimeout ( () => this.exitPermission = false , 1400 );
        }

    }
    else if ( this.inx !== 0 ) {
        clearTimeout ( this.exit_TO );
        this.exitPermission = false;
    }

    return false;

}

// -- =====================================================================================

// nWordTapped ( args ) {

//     // .. Tapped somewhere but not on a word
//     if ( this.notWordHandling( args ) ) return 0;

//     // ! CHECKKKK
//     // .. Tapped on a deleted word
//     // if ( args.object.className.includes( 'deleted' ) ) store.state.mode = "restore";
//     // if ( store.state.mediaState === "playing" ) return 0;

//     this.seeker( args );

//     switch ( store.state.mode ) {

//         case "reading"  : this.reading( args.object.refId );        break;
//         case "selective": this.reading( args.object.refId );        break;
//         case "restore"  : this.nDeletedWordTapped( args );          break;
//         case "binding"  : this.binding( args.object.refId, false ); break;
//         case "editing"  : this.editing( -2, false );                break;
//         case "snapping" : this.focus( args.object.refId );          break;

//     }

// }

// -- =====================================================================================

// nWordLongPressed ( args ) {
//     // Bus.$emit( "Scope_DeskCtl", "up", args.object.text );
//     if ( args.object.className.includes( 'word' ) ) this.seeker( args, true );
// }

// -- =====================================================================================

// notWordHandling ( args ) {

//     if ( !args.object.className.includes( 'word' ) ) {

//         if ( store.state.mode === "editing" ) this.editing( -2, false );
//         if ( store.state.mode === "snapping" ) Bus.$emit( "ToolBar_Snap", false );
//         store.state.preserve.selected = [];
//         if ( store.state.mode === "binding" ) this.binding( args.object.refId, false );

//         // .. Tapped on a breakLine
//         if ( args.object.className.includes( 'breakLine' ) ) this.spotMission( args );

//         return true;

//     }

//     return false;

// }

// -- =====================================================================================

// async seeker ( args, forcePlay = false ) {

//     // .. get Infos
//     await tnsPLY.getDuration().then( secs => {

//         // ! remove file!
//         // .. something is odd
//         if ( secs <= 0 ) { console.log( "File Corrupted!" ); return 0; }

//         // .. additional functionalities: "Play"
//         if ( forcePlay ) {
//             tnsPLY.init( store.state.inHand.mediaPath );
//             tnsPLY.play();
//         }

//         // .. actual seeker function: it follows taps on "reading+playing" mode
//         let start = tools.snapFinder( args.object.refId, this.hypText.content, secs );
//         if ( store.state.mode === "reading" && store.state.mediaState === "playing" ) {
//             tnsPLY.seekTo( start );
//             tnsPLY.resume();
//         }

//     } )
// }

// -- =====================================================================================

// reading ( refId: number ) {

//     if ( store.state.mode === "selective" ) {
//         store.state.mode = "reading";
//         store.state.preserve.selected = [];
//     }

//     let y: number;

//     // .. doubleTap simulation
//     if ( store.state.preserve.selected[0] === refId ) {
//         this.wordMarker( refId );
//         Bus.$emit( "ToolBar_Fade", 0, true, true, 150 );
//     }
//     else {
//         store.state.preserve.selected = [ refId ];
//         y = this.$refs[ "word_" + refId ][0].nativeView.getLocationInWindow().y;
//         Bus.$emit( "ToolBar_Flight", y );
//         this.$refs[ "word_" + refId ][0].miniTranslator();
//     }

//     this.tapHasBeenHandled = true;

// }

// -- =====================================================================================

// selecting ( init: boolean ) {

//     // .. this request has been canceled
//     if ( !store.state.preserve.selected.length ) return 0;

//     if ( init ) {
//         Bus.$emit( "ToolBar_Fade", 0, false, false, 0, true );
//         Bus.$emit( "ToolBar_Extra_off", 0, false, false, 0, true );
//         return 0;
//     }

//     // .. not a phrase selected!
//     if ( store.state.preserve.selected.length === 1 ) {
//         store.state.preserve.selected = [];
//         store.state.mode = "reading";
//         return 0;
//     }

//     let a = store.state.preserve.selected[0];
//     let b = store.state.preserve.selected[ store.state.preserve.selected.length -1 ];

//     // .. sometimes it throw an error!
//     try {
//         let x = this.flightDestination(a, b);
//         let y = this.$refs[ "word_" + x ][0].nativeView.getLocationInWindow().y;
//         store.state.mode = "selective";
//         Bus.$emit( "ToolBar_Flight", y );
//     } catch ( err ) {}

// }

// -- =====================================================================================

// flightDestination ( a: number ,b: number ) {

//     let destination: number;

//     let aBelongsTo = this.$refs[ "word_" + a ][0].nativeView.onPage;
//     let bBelongsTo = this.$refs[ "word_" + b ][0].nativeView.onPage;

//     if      ( aBelongsTo > bBelongsTo && this.inx === aBelongsTo ) destination = b;
//     else if ( aBelongsTo < bBelongsTo && this.inx === bBelongsTo ) destination = b;
//     else    destination = a;

//     return destination;

// }

// -- =====================================================================================

// spotMission ( args ) {

//     store.state.mode = "reading";
//     let refId = args.object.refId;

//     let spot = this.$refs[ "word_" + refId ][0].nativeView.getLocationInWindow().y;
//     let exData = this.$refs[ "word_" + refId ][0].nativeView.getActualSize().height;

//     Bus.$emit( "ToolBar_Flight", spot, false, false, refId, exData );

// }

// -- =====================================================================================

// nDeletedWordTapped ( args ) {

//     let n = args.object.refId,
//         y = this.$refs[ "word_" + n ][0].nativeView.getLocationInWindow().y;

//     store.state.preserve.selected = [n];
//     Bus.$emit( "ToolBar_Flight", y );

//     this.tapHasBeenHandled = true;

// }

// -- =====================================================================================

// bookCoverTapped () {

//     if ( !this.tapHasBeenHandled ) {
//         this.tapHasBeenHandled = true;

//         // .. pause
//         if ( store.state.mediaState === "playing" ) tnsPLY.pause();
//         // .. or resume
//         else if ( store.state.mediaState === "paused" ) tnsPLY.play();

//         if ( store.state.mode === "editing" ) this.editing( -1, false );
//         else {
//             Bus.$emit( "ToolBar_Fade", 0, true, true);
//             store.state.preserve.selected = [];
//         }
//     }

//     this.tapHasBeenHandled = false;

//     Bus.$emit( "MiniMenu_MiniMenu", 250, "down" );

// }

// -- =====================================================================================

// wordMarker ( refId: number ) {
//     let row = this.dText.content[ refId ];
//     tools.wordStating( row[0], store.state.inHand.institute, null, true );
//     this.rePub();
// }

// -- =====================================================================================

// bookCover_Animation;
// bookCoverPainter ( mode: TS.AppMode ) {

//     // .. bug resolver
//     if ( !this.$refs.bookCover ) return 0;

//     let theColor = { light: "#00000000", dark: "#00000000" } ;
//     let bookCover = ( this.$refs.bookCover as any ).nativeView;

//     // TODO colors should be defined upon themes
//     switch ( mode ) {
//         case "reading"  : theColor = theColor;                              break;
//         case "binding"  : theColor = { light: "#e64b0d", dark: "#4b0e0e" }; break;
//         case "editing"  : theColor = { light: "#a6aced", dark: "#38393d" }; break;
//         case "snapping" : theColor = { light: "#cae6e6", dark: "#0c4553" }; break;
//     }

//     if ( this.bookCover_Animation ) this.bookCover_Animation.cancel();

//     let isDark = store.state.darkMode,
//         newColor = isDark ? theColor.dark : theColor.light,
//         newClass = "bookCover " + mode,
//         duration = mode === "reading" ? 500 : 300,
//         x_def: NS.AnimationDefinition = {};

//     bookCover.className = newClass;

//     x_def.target = bookCover;
//     x_def.curve = NS.Enums.AnimationCurve.ease;
//     x_def.backgroundColor = new NS.Color( newColor );
//     x_def.duration = duration;
//     x_def.delay = 100;
//     this.bookCover_Animation = new NS.Animation( [ x_def ], false );
//     this.bookCover_Animation.play();

// }

// -- =====================================================================================

// async binding ( refId: number, init: boolean ) {

//     if ( init ) store.state.mode = "binding";

//     else {
//         store.state.preserve.selected.push( refId );
//         this.bindingAssistant();
//         await new Promise( _ => setTimeout( _ , 100 ) );
//         store.state.mode = "reading";
//     }

// }

// -- =====================================================================================

// bindingAssistant () {

//     if ( store.state.preserve.selected.length !== 2 ) {
//         tools.toaster( 'Error!' );
//         return 0;
//     }

//     let a = store.state.preserve.selected[0],
//         b = store.state.preserve.selected[1],
//         r: [number,number];

//     // .. wipe old Traces
//     for ( let x of [a,b] ) {

//         let i = this.binds.indexOf(x);

//         if ( i > -1 ) {

//             if ( i%2 ) r = this.binds.splice( i-1, 2 ) as [number,number];
//             else r = this.binds.splice( i, 2 ) as [number,number];

//             for ( let y of r ) delete this.dText.content[y][1].bind;

//         }

//     }

//     // .. clear mode
//     if ( a === b ) delete this.dText.content[a][1].bind;
//     // .. add new bind Data
//     else this.dText.content[a][1].bind = b;

//     // ! checkkkk
//     // .. reset selected area
//     // store.state.preserve.selected = [];

//     this.rePub();

// }

// -- =====================================================================================

// async editing ( refId: number, init: boolean ) {

//     if ( this.bookCover_Animation ) this.bookCover_Animation.cancel();

//     this.editingAnimation( !init );

//     if ( init ) {
//         this.$refs[ "word_" + refId ][0].setFocus();
//         store.state.mode = "editing";
//     }
//     else {
//         this.$refs[ "word_" + store.state.preserve.selected[0] ][0].editMode = false;
//         await new Promise( _ => setTimeout( _ , 100 ) );
//         store.state.mode = "reading";
//         store.state.preserve.selected = [];
//     }

// }

// -- =====================================================================================

// focus ( refId: number ) {

//     let y: number;

//     store.state.preserve.selected = [ refId ];
//     y = this.$refs[ "word_" + refId ][0].nativeView.getLocationInWindow().y;
//     Bus.$emit( "ToolBar_Flight", y );

//     this.tapHasBeenHandled = true;

// }

// -- =====================================================================================

// page_Animation;
// editingAnimation ( end: boolean ) {

//     let i = store.state.preserve.selected[0],
//         y = ( this.$refs.page[ this.inx ] as any ).nativeView.getLocationInWindow().y,
//         o = end ? 0 : this.$refs[ "word_" + i ][0].nativeView.getLocationInWindow().y,
//         h = end ? 0 : this.$refs[ "word_" + i ][0].nativeView.getActualSize().height;

//     let x_def: NS.AnimationDefinition = {};

//     x_def.target = ( this.$refs.page[ this.inx ] as any ).nativeView;
//     x_def.curve = NS.Enums.AnimationCurve.ease;
//     x_def.duration = 700;
//     x_def.translate = { x:0, y: end ? 0 : -(y-o) >= h*3 ? y-o+h*2 : 0 };
//     x_def.delay = end ? 300 : 300;
//     this.page_Animation = new NS.Animation( [ x_def ], false );
//     this.page_Animation.play();

// }

// -- =====================================================================================

// editor ( refId: number, text: string ) {

//     text = text.trim();
//     let context = this.dText.content;

//     // .. text modified
//     if ( text ) {

//         let newData: TS.UniText[] = [];

//         for ( let w of text.split( " " ) ) {
//             newData.push( [ w, {} ] );
//             if ( context[ refId ][1].phrased ) 
//                 newData[ newData.length -1 ][1].phrased = context[ refId ][1].phrased;
//         }

//         // .. first row inherits some data
//         if ( context[ refId ][1].snap )
//             newData[0][1].snap = context[ refId ][1].snap;
//         // .. last row inherits some data
//         if ( context[ refId ][1].standoff )
//             newData[ newData.length -1 ][1].standoff = context[ refId ][1].standoff;

//         // TODO remove corresponded BindDATA:  if ( newData[0][ WRS.BindToId ] )
//         // TODO update Further BinsDATA
//         context.splice( refId, 1, ...newData );

//     }
//     // .. text removed completely => treat it as deleted!
//     else context.splice( refId, 1 );

//     delete this.dText.etikett;

//     this.editing( -1, false );

//     this.rePub();

// }

// -- =====================================================================================

// addLineBreakAfter ( refId: number ) {

//     let breakLine: TS.UniText = [ null, { isBreakLine: true } ];

//     this.dText.content.splice( refId +1, 0, breakLine );
//     delete this.dText.etikett;

//     this.rePub();

// }

// -- =====================================================================================

// removeLineBreak ( refId: number ) {

//     this.dText.content.splice( refId , 1 );
//     delete this.dText.etikett;

//     store.state.preserve.selected = [];
//     store.state.preserve.fakeSelected = [];

//     this.rePub();

// }

// -- =====================================================================================

// blockToggler ( refId: number ) {

//     let row = this.dText.content[ refId ],
//         max = this.dText.content.length,
//         isBlock = tools.isBlock( row, max, refId );

//     row[1].standoff = isBlock ? "bridge" : "block";

//     this.rePub();

// }

// -- =====================================================================================

// phraseMarker ( color?: "blue"|"red" ) {

//     for ( let x of store.state.preserve.selected ) {
//         if ( color ) this.dText.content[x][1].phrased = color;
//         else delete  this.dText.content[x][1].phrased;
//     }

//     this.rePub();

// }

// -- =====================================================================================

// eraser () {

//     let a = store.state.preserve.selected[0],
//         b = store.state.preserve.selected[ store.state.preserve.selected.length -1 ];

//     for ( let x of store.state.preserve.selected ) 
//         this.dText.content[x][1].isDeleted = true;

//     this.bookPublisher();

// }

// -- =====================================================================================

// bookCleaner () {

//     this.dText.content = this.dText.content.filter( row => {
//         if( !row[1].isDeleted ) return true;
//         else delete this.dText.etikett;
//     } );

// }

// -- =====================================================================================

// restore () {

//     let lesson = store.state.inHand.lesson,
//         max = this.dText.content.length,
//         m = store.state.preserve.selected[0],
//         a: number,
//         b: number;

//     a = m;
//     while ( a >= 0 && this.dText.content[a][1].isDeleted ) a--;

//     b = m;
//     while ( b < max && this.dText.content[b][1].isDeleted ) b++;

//     store.state.preserve.selected = [];
//     let ins = lesson.chromosome.institute;
//     for ( let i=a+1; i<=b-1; i++ )
//         tools.wordStating( this.dText.content[i][0], ins, "L" );

//     this.bookPublisher();

//     store.state.mode = "reading";

// }

// -- =====================================================================================

// async bookSaver () {
//     this.bookCleaner();
// }

// -- =====================================================================================

// beforeDestroy() {
//     store.state.preserve.selected = [];
//     this.bookSaver();
// }

// -- =====================================================================================

destroyed () {
    Bus.$off( 'Book_selecting' );
    Bus.$off( 'Book_blattern' );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    /* ! should be same as Tafel.vue */
    .bookCover {
        background-color: transparent;
        width: auto;
        /* color: #38393d; */
    }

    .pagesBox {
        width: 80%;
        /* height: 70%; ! should be same as factor of maxHeight */
    }

    .page { width: 510 }
    /* ! should be same as Tafel.vue */

    .hypRow{
        border-width: 1;
        border-color: white;
        border-radius: 5;
        margin: 4;
        padding: 4 7;
        font-family: Farsan-Regular;
        font-size: 15;
    }

</style>