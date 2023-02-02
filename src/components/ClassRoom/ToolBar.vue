<template>
<AbsoluteLayout ref="rail" visibility="hidden">

<!---------------------------------------------------------------------------------------->

    <ScrollView ref="extra_barBox" class="barBox" orientation="horizontal" >

        <StackLayout 
            class="buttonBox"
            orientation="horizontal" 
            horizontalAlignment="center" 
        >

            <nButton 
                v-for="(button,i) in buttons[ 'phrase' ]" 
                :key="$store.state.mode+'x'+i"
                :myClass="'toolButton fas ' + button.class"
                :myLabel="String.fromCharCode( '0x' + button.icon )"
                @tap=button.fnc
            />

        </StackLayout>

    </ScrollView>

<!---------------------------------------------------------------------------------------->

    <ScrollView ref="more_barBox" class="barBox" orientation="horizontal" >

        <StackLayout 
            class="buttonBox"
            orientation="horizontal" 
            horizontalAlignment="center" 
        >

            <nButton 
                v-for="(button,i) in buttons[ 'more' ]" 
                :key="$store.state.mode+'x'+i"
                :myClass="'toolButton fas ' + button.class"
                :myLabel="String.fromCharCode( '0x' + button.icon )"
                @tap=button.fnc
            />

        </StackLayout>

    </ScrollView>

<!---------------------------------------------------------------------------------------->

    <ScrollView ref="barBox" class="barBox" orientation="horizontal" @tap="fadeMe()" >

        <StackLayout 
            ref="buttonBox"
            class="buttonBox"
            orientation="horizontal" 
            horizontalAlignment="center"
        >

            <nButton 
                v-for="(button,i) in buttons[ $store.state.mode ]" 
                :key="$store.state.mode+'x'+i"
                :myClass="'toolButton fas ' + button.class"
                :myLabel="String.fromCharCode( '0x' + button.icon )"
                @tap="tapHandled=true;button.fnc();"
            />

        </StackLayout>

    </ScrollView>

<!---------------------------------------------------------------------------------------->

</AbsoluteLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import * as tools                       from "@/mixins/tools"
// * tns plugin add nativescript-clipboard
import { setText }                      from "nativescript-clipboard"
import BookModule                       from "@/components/ClassRoom/Books/Book.vue"
import Bus                              from "@/mixins/bus"
import * as tnsPLY                      from "@/mixins/audioPlayer"

// -- =====================================================================================

enum RBS { Mark, Scope, Bind, QuickSnap, Copy, More, Less, BreakLine }
enum MBS { Edit, LineBreak, Snap, Block }
enum SBS { Translate, Highlight_1, Highlight_2, Delete, Copy }
enum PBS { Highlight_x, eraser, Translate, Copy }

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class ToolBar extends Vue {

// -- =====================================================================================

tapHandled = false;
barBox_Animation;
extra_barBox_Animation;
dText: TS.Organelle;

// -- =====================================================================================

buttons = {
                                                                                           
    reading : [                                                                            
/* mark       */ { icon: 'f00c', class: ''     , fnc: () => this.f( "mark" )            } ,
/* scope      */ { icon: 'f002', class: 'scope', fnc: () => this.f( "scope" )           } ,
/* bind       */ { icon: 'f0c1', class: 'bind' , fnc: () => this.f( "bind" )            } ,
/* quick snap */ { icon: 'e131', class: 'q_sp' , fnc: () => this.f( "q_snap" )          } ,
/* copy       */ { icon: 'f0c5', class: 'copy' , fnc: () => this.f( "copy", false )     } ,
/* more       */ { icon: 'f077', class: 'more' , fnc: () => this.f( "more" )            } ,
/* less       */ { icon: 'f078', class: 'less' , fnc: () => this.f( "less" )            } ,
/* breakLine  */ { icon: 'f1dd', class: 'gray' , fnc: () => this.f( "breakLine" )       } ,
    ]                                                                                     ,
                                                                                           
    more : [                                                                               
/* edit       */ { icon: 'f303', class: 'edit' , fnc: () => this.f( "edit" )            } ,
/* lineBreak  */ { icon: 'f1dd', class: 'line' , fnc: () => this.f( "lineBreak" )       } ,
/* snap       */ { icon: 'f276', class: 'snap' , fnc: () => this.f( "snap" )            } ,
/* block      */ { icon: ''    , class: 'pink' , fnc: () => this.f( "block" )           } ,
    ]                                                                                     ,

    snapping : [                                                                               
/*            */ { icon: 'f100', class: 'edit' , fnc: () => this.f( "adjusting", -2 )   } ,
/*            */ { icon: 'f104', class: 'edit' , fnc: () => this.f( "adjusting", -1 )   } ,
/*            */ { icon: ''    , class: 'space', fnc: () => {}                          } ,
/*            */ { icon: 'f105', class: 'edit' , fnc: () => this.f( "adjusting", 1 )    } ,
/*            */ { icon: 'f101', class: 'edit' , fnc: () => this.f( "adjusting", 2 )    } ,
    ]                                                                                     ,
                                                                                           
    selective : [                                                                          
/* scope      */ { icon: 'f002', class: 'scope', fnc: () => this.f( "scope", true )     } ,
/* highlight 1*/ { icon: 'f591', class: 'blue' , fnc: () => this.f( "phrase", "blue" )  } ,
/* highlight 2*/ { icon: 'f591', class: 'red'  , fnc: () => this.f( "phrase", "red" )   } ,
/* delete     */ { icon: 'f12d', class: 'erase', fnc: () => this.f( "delete" )          } ,
/* copy       */ { icon: 'f0c5', class: 'copy' , fnc: () => this.f( "copy", true )      } ,
    ]                                                                                     ,
                                                                                           
    phrase : [                                                                             
/* scope      */ { icon: 'f002', class: 'scope', fnc: () => this.f( "p_Scope" )         } ,
/* highlight 1*/ { icon: 'f591', class: 'blue' , fnc: () => this.f( "p_Phrase", "blue" )} ,
/* highlight 2*/ { icon: 'f591', class: 'red'  , fnc: () => this.f( "p_Phrase", "red" ) } ,
/* erase      */ { icon: 'f591', class: 'gray' , fnc: () => this.f( "p_Erase" )         } ,
/* copy       */ { icon: 'f0c5', class: 'copy' , fnc: () => this.f( "p_Copy" )          } ,
    ]                                                                                     ,
                                                                                           
    restore : [                                                                            
/* restore    */ { icon: 'f829', class:'restore',fnc: () => this.f( "p_Restore" )       } ,
    ]                                                                                      
}

// -- =====================================================================================

// .. functions of buttons
f ( action, extra: boolean|-2|-1|0|1|2|"blue"|"red" = null ) {

    // .. critical Error!
    let preserve = store.state.preserve;
    try { if ( !preserve.selected.length && !preserve.fakeSelected.length ) return 0; } 
    catch { return 0; }

    let a = preserve.selected.length ? preserve.selected[0] : preserve.fakeSelected[0];

    let bookModule = this.$parent.$parent.$refs.book as BookModule;

    switch ( action ) {

        case "mark"     : bookModule.wordMarker(a);                     this.fade(); break;
        case "scope"    : this.scope( extra as boolean );               this.fade(); break;
        case "bind"     : bookModule.binding(a,true);      this.fade(0,false,false); break;
        case "copy"     : this.copy( extra as boolean );                this.fade(); break;
        case "less"     : this.flight(0,false,true);                                 break;
        case "more"     : this.flight(0,true);                                       break;
        case "breakLine": bookModule.removeLineBreak( a );              this.fade(); break;

        case "edit"     : bookModule.editing(a,true);      this.fade(0,false,false); break;
        case "snap"     : this.snap( true );                                         break;
        case "q_snap"   : this.q_snap();                                             break;
        case "lineBreak": bookModule.addLineBreakAfter( a );                         break;
        case "block"    : bookModule.blockToggler(a);                   this.fade(); break;

        case "adjusting": this.adjuster( extra as -2|-1|1|2 );                       break;

        case "phrase"   : bookModule.phraseMarker( extra as null|"blue"|"red" );    this.fade(); break;
        case "delete"   : bookModule.eraser();                          this.fade(); break;

        case "p_Scope"  : this.retrievePhrase(); this.f( "scope", true );            break;
        case "p_Phrase" : this.retrievePhrase(); this.f( "phrase", extra );          break;
        case "p_Erase"  : this.retrievePhrase(); this.f( "phrase", null );           break;
        case "p_Copy"   : this.retrievePhrase(); this.f( "copy", true );             break;

        case "p_Restore": bookModule.restore();                         this.fade(); break;

    }

}

// -- =====================================================================================

mounted () {

    Bus.$on( "ToolBar_Flight", this.flight );
    Bus.$on( "ToolBar_Fade", this.fade );
    Bus.$on( "ToolBar_Extra_off", this.extra_off );
    Bus.$on( "ToolBar_Snap", this.snap );

}

// -- =====================================================================================

init ( dText: TS.Organelle ) {

    this.dText = dText;

    ( this.$refs.rail as any ).nativeView.visibility = "visible";

    let barBox = ( this.$refs.barBox as any ).nativeView;
    barBox.translateY = store.state.windowSize.height /2; 
    barBox.opacity = 0;
    barBox.visibility = "hidden";

    ( this.$refs.more_barBox as any ).nativeView.visibility = "collapsed";
    ( this.$refs.extra_barBox as any ).nativeView.visibility = "collapsed";

}

// -- =====================================================================================

buttonController ( more: boolean, less: boolean, spot: number ) {

    // .. get Data
    let c = store.state.preserve.selected.length,
        id = spot > -1 ? spot : store.state.preserve.selected[ c-1 ];

    // .. spot Mode
    if ( spot > -1 ) {
        store.state.preserve.fakeSelected = [ spot ];
        for ( let button of this.buttons.reading ) button.class += " hide";
        this.buttons.reading[ RBS.BreakLine ].class = "gray lineThrough";
        return 0;
    }

    let wordRow = this.dText.content[ id ],
        max = this.dText.content.length;

    for ( let button of this.buttons.reading ) {
        button.class = button.class.replace( " hide" , "" );
    }
    this.buttons.reading[ RBS.BreakLine ].class = "hide";
    this.buttons.reading[ RBS.More ].class = more ? "more hide" : "more";
    this.buttons.reading[ RBS.Less ].class = more ? "less" : "less hide";

    // .. set Style Mark Button
    let ins = store.state.inHand.lesson.chromosome.institute;
    this.buttons.reading[ RBS.Mark ].class = 
        tools.wordStating( wordRow[0], ins ) === "M" ? 'gray lineThrough' : 'green';

    // .. set Style Block|Bridge Button
    let isBlk = tools.isBlock( wordRow, max, id );

    // .. phrase Control
    let pb = this.buttons.phrase;
    for ( let i in pb ) pb[i].class = pb[i].class.replace( " off", "" );
    if ( wordRow[1].phrased === "blue" ) pb[1].class += " off";
    if ( wordRow[1].phrased === "red" ) pb[2].class += " off";

    this.buttons.more[ MBS.Block ].icon = isBlk ? 'f10d' : 'f10e';

}

// -- =====================================================================================

retrieveText ( recursive: boolean ) {

    let string: string,
        max = store.state.preserve.selected.length,
        a = store.state.preserve.selected[0],
        b = store.state.preserve.selected[ max-1 ];

    string = this.dText.content[a][0] || "";

    if ( recursive ) {
        for ( let i = a+1; i <= b; i++ ) {
            let append = this.dText.content[i][1].isBreakLine ? "\n" : " ";
            string = string + append + this.dText.content[i][0];
        }
    }

    return string;

}

// -- =====================================================================================

retrievePhrase () {

    let phrase: string,
        max = this.dText.content.length,
        m = store.state.preserve.selected[0],
        a: number,
        b: number;

    // TODO divide them by blocks
    a = m;
    while ( a >= 0 && this.dText.content[a][1].phrased ) a--;

    b = m;
    while ( b < max && this.dText.content[b][1].phrased ) b++;

    store.state.preserve.selected = [];
    for ( let i=a+1; i<=b-1; i++ ) store.state.preserve.selected.push(i);
    store.state.mode = "selective";

}

// -- =====================================================================================

copy ( recursive: boolean = false ) {

    setText( this.retrieveText( recursive ) );
    let target = recursive ? "Sentence" : "Word";
    tools.toaster( target + ' has been copied!' );

}

// -- =====================================================================================

snap ( init: boolean ) {

    if ( init ) this.flight( -1, false, true );
    store.state.mode = init ? "snapping" : "reading";

}

// -- =====================================================================================

q_snap () {

    // .. if we have valid registered RCT
    if ( store.state.realCurrentTime !== -1 ) {
        let id = store.state.preserve.selected[0];
        let snap = parseFloat( ( store.state.realCurrentTime -1 ).toFixed(1) );
        // .. assign it
        this.dText.content[ id ][1].snap = snap;
        // .. play it
        tnsPLY.seekTo( snap );
    }

}

// -- =====================================================================================

async adjuster ( code: -2|-1|1|2 ) {

    // .. hover flight simulation
    if ( this.barBox_Animation ) this.barBox_Animation.cancel();
    this.postFlight();

    let factor = code%2 ? .25 : .33,
        append = code * factor,
        id = store.state.preserve.selected[0],
        row = this.dText.content[ id ];

    // .. if it has no data yet!
    if ( typeof row[1].snap === "undefined" ) {

        tnsPLY.init( store.state.inHand.mediaPath );

        await tnsPLY.getDuration().then( secs => {
            if ( secs <= 0 ) { console.log( "File Corrupted!" ); return 0; }
            row[1].snap = tools.snapFinder( id, this.dText.content, secs );
        } );

    }
    // .. still has no Data!
    if ( typeof row[1].snap === "undefined" ) return tools.toaster( "no success!" );

    row[1].snap += append;
    // .. trim number
    row[1].snap = parseFloat( row[1].snap.toFixed(1) );
    tnsPLY.seekTo( row[1].snap );
    tnsPLY.resume();

}

// -- =====================================================================================

scope ( recursive=false ) {
    Bus.$emit( "Scope_DeskCtl", "up", this.retrieveText( recursive ) );
}

// -- =====================================================================================

async flight ( latitude: number, more=false, less=false, spot=-1, exData? ) {

    let barBox = ( this.$refs.barBox as any ).nativeView,
        more_barBox = ( this.$refs.more_barBox as any ).nativeView,
        x_def: NS.AnimationDefinition = {},
        h: number,
        y: number;

    await this.extra_off();

    this.buttonController( more, less, spot );

    if ( this.barBox_Animation ) this.barBox_Animation.cancel();

    barBox.visibility = "visible";
    await new Promise( _ => setTimeout( _ , 0 ) );
    h = barBox.getActualSize().height;

    y = ( spot > -1 ) ? latitude -h/2 + exData/2 : latitude -h -2;
    if ( more ) y = barBox.getLocationInWindow().y -h -7;
    if ( less ) y = barBox.getLocationInWindow().y +h +7;

    x_def.target = barBox;
    x_def.curve = NS.Enums.AnimationCurve.ease,
    x_def.duration = 300;
    x_def.translate = { x: 0, y: y };
    x_def.opacity = 1;

    this.barBox_Animation = new NS.Animation( [ x_def ], false );
    this.barBox_Animation.play().then( () => this.postFlight( spot ) );

    if ( !less && !more ) more_barBox.translateY = y;
    more_barBox.visibility = more || less ? "visible" : "collapsed";

}

// -- =====================================================================================

postFlight ( spot=-1 ) {

    if ( store.state.mode !== "selective" && spot === -1 ) {
        // .. get Data
        let length = store.state.preserve.selected.length;
        let i = store.state.preserve.selected[ length -1 ];
        let phrased = this.dText.content[i][1].phrased;
        if ( phrased && store.state.mode !== "snapping" ) this.extra_on();
    }

    this.fade( 2900, true, false );

}

// -- =====================================================================================

async extra_on () {

    if ( this.extra_barBox_Animation ) this.extra_barBox_Animation.cancel();

    ( this.$refs.extra_barBox as any ).nativeView.visibility = "visible";

    let x_def: NS.AnimationDefinition = {};

    // .. put it behind barBox
    let originY = ( this.$refs.barBox as any ).nativeView.translateY;
    ( this.$refs.extra_barBox as any ).nativeView.translateY = originY;

    let h = ( this.$refs.barBox as any ).nativeView.getActualSize().height +6;

    x_def.target = ( this.$refs.extra_barBox as any ).nativeView;
    x_def.curve = NS.Enums.AnimationCurve.ease,
    x_def.delay = 0;
    x_def.duration = 300;
    x_def.translate = { x: 0, y: originY -h };
    x_def.opacity = 1;

    this.extra_barBox_Animation = new NS.Animation( [ x_def ], false );
    await this.extra_barBox_Animation.play();

    return 0;

}

// -- =====================================================================================

async extra_off () {

    if ( this.extra_barBox_Animation ) this.extra_barBox_Animation.cancel();

    ( this.$refs.extra_barBox as any ).nativeView.visibility = "collapsed";
    ( this.$refs.extra_barBox as any ).nativeView.opacity = 0;

    return 0;

}

// -- =====================================================================================

fadeMe () {
    if ( !this.tapHandled ) this.fade( 100, true, true );
    this.tapHandled =  false;
}

// -- =====================================================================================

fade_TO: NodeJS.Timeout | any;
fade ( delay=0, clean=true, toasterOff=false, duration=300, justLanding=false ) {

    let x_def: NS.AnimationDefinition = {};

    if ( this.barBox_Animation ) this.barBox_Animation.cancel();
    if ( this.fade_TO ) clearTimeout( this.fade_TO );

    x_def.target = ( this.$refs.barBox as any ).nativeView;
    x_def.curve = NS.Enums.AnimationCurve.ease,
    x_def.duration = duration;
    x_def.delay = delay;
    x_def.opacity = 0;

    this.barBox_Animation = new NS.Animation( [ x_def ], false );

    // .. these functions should not blocked by animation
    this.fade_TO = setTimeout( () => {
        ( this.$refs.barBox as any ).nativeView.visibility = "collapsed";
        ( this.$refs.more_barBox as any ).nativeView.visibility = "collapsed";
    }, delay + duration/100 );

    this.barBox_Animation.play()
    .then( () => { if ( !justLanding ) this.postFade( clean, toasterOff ) } );

}

// -- =====================================================================================

postFade ( clean: boolean, toasterOff: boolean ) {

    let mode = store.state.mode;

    if ( toasterOff ) tools.toaster(); 

    if ( mode === "snapping" ) this.snap( false );
    if ( mode === "selective" || mode === "restore" ) store.state.mode = "reading";
    if ( clean ) store.state.preserve.selected = [];

    this.extra_off();

}

// -- =====================================================================================

destroyed () {
    if ( this.fade_TO ) clearTimeout( this.fade_TO );
    Bus.$off( "ToolBar_Fade" );
    Bus.$off( "ToolBar_Flight" );
    Bus.$off( "ToolBar_Extra_off" );
    Bus.$off( "ToolBar_Snap" );
}

// -- =====================================================================================

}

// -- =====================================================================================


</script>

// -- =====================================================================================

<style scoped>
/*                                          */
    .barBox {
        width: 100%;
        height: 55;
        android-elevation: 15;
    }

    .light .barBox { background-color: #3abedb }
    .dark  .barBox { background-color: #20363a }

    .buttonBox { margin: 0 17 }

    .light .blue  { color: #1890b4; }
    .dark  .blue  { color: #247bd1; }

    .light .red   { color: #d34b0c; }
    .dark  .red   { color: #d31212; }

    .light .green { color: #54a017; }
    .dark  .green { color: #44850e; }

    .light .pink  { color: #ad4702; font-size: 13px; padding-top: 8; }
    .dark  .pink  { color: #c95b92; font-size: 13px; padding-top: 8; }

    .light .copy  { color: #2a4e3d; }
    .dark  .copy  { color: #138fc9; }

    .light .bind  { color: #d64912; }
    .dark  .bind  { color: #d48816; }

    .light .less  { padding-top: 10; }
    .dark  .less  { padding-top: 10; }

    .light .more  { padding-top: 10 }
    .dark  .more  { padding-top: 10 }

    .light .hide  { visibility: collapse; }
    .dark  .hide  { visibility: collapse; }

    .light .space { width: 2; margin: 0 7; }
    .dark  .space { width: 2; margin: 0 7; }

    .light .snap  { color: #069636; }
    .dark  .snap  { color: #91c713; }

    .light .q_sp  { color: #079961; }
    .dark  .q_sp  { color: #74bb03; }

    .light .edit  { color: #0d7bad; }
    .dark  .edit  { color: #1ca9eb; }

    .light .line  { color: #dd2095; }
    .dark  .line  { color: #b31a78; }

    .light .erase { color: #2d3233; }
    .dark  .erase { color: #eb801c; }

    .light .scope { color: #c516d4; }
    .dark  .scope { color: #7d50d3; }

    .light .restore { color: #5a8f1e; }
    .dark  .restore { color: #5fa70e; }

    .light .gray  { color: #484c50; background-color: #27b5d4; }
    .dark  .gray  { color: #a0a5a7; background-color: #132327; }

    .light .off   { visibility: collapse; }
    .dark  .off   { visibility: collapse; }

</style>