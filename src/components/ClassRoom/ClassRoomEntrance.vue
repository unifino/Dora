<template>
<GridLayout ref="entrance" rows="16*,180,30*,10*,110">

<!---------------------------------------------------------------------------------------->

    <Image row=1 class="avatar" ref="avatar" :src="avatar" stretch="aspectFill" />

<!---------------------------------------------------------------------------------------->

    <Label row=3 class="loading centeredText">
        <FormattedString>
            <Span :text="String.fromCharCode( '0x' + 'f5da' )" class="fas" />
            <Span :text ="loadHint" :color="loadHindColor" />
        </FormattedString>
    </Label>

<!---------------------------------------------------------------------------------------->

    <Label row=4 class="title centeredText" :text="title" textWrap="true" />

<!---------------------------------------------------------------------------------------->

    <GridLayout row=2 class="rendering" :visibility="percent > -1 ? 'visible':'hidden'">
        <StackLayout class="renderBar" horizontalAlignment="left" :width="percent+'%'" />
    </GridLayout>

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import Bus                              from "@/mixins/bus"
import * as storage                     from "@/mixins/storageHandler"
import * as tools                       from "@/mixins/tools"
import * as genetics                    from "@/mixins/genetics"
import Tafel                            from "@/components/ClassRoom/Tafel.vue"
import MiniMenu                         from "@/components/ClassRoom/MiniMenu.vue"
import ImageDisplay                     from "@/components/ClassRoom/ImageDisplay.vue"
import AudioPlayer                      from "@/components/ClassRoom/AudioPlayer.vue"
import Book                             from "@/components/ClassRoom/Books/Book.vue"
import HypBook                          from "@/components/ClassRoom/Books/HypBook.vue"
import SideBar                          from "@/components/ClassRoom/SideBar.vue"
import Subtitle                         from "@/components/ClassRoom/Subtitle.vue"
import ToolBar                          from "@/components/ClassRoom/ToolBar.vue"
import VideoControl                     from "@/components/ClassRoom/VideoControl.vue"
import VideoPlayer                      from "@/components/ClassRoom/VideoPlayer.vue"
import YouTubePlayer                    from "@/components/ClassRoom/YouTubePlayer.vue"

// -- =====================================================================================

@Component

// -- =====================================================================================

export default class ClassRoomEntrance extends Vue {

// -- =====================================================================================

percent = -1;
loadHint = ' Opening ...';
loadHindColor = "#168594";
avatar = 'res://book_cover_' + ( store.state.darkMode ? "dark" : "light" );
title = "";
book: Book;
hypBook: HypBook;
tafel: Tafel;
mainBox;
sideBar: SideBar;
toolBar: ToolBar;
miniMenu: MiniMenu;
subtitle: Subtitle;
audioPlayer: AudioPlayer;
videoPlayer: VideoPlayer;
imageDisplay: ImageDisplay;
videoControl: VideoControl;
youTubePlayer: YouTubePlayer;

// -- =====================================================================================

get renderingVisibility () {
    return ( this.percent > -1 ) ? "visible" : "hidden";
}

// -- =====================================================================================

mounted () {
    Bus.$on( "ClassRoomEntrance_Back", () => {
        try { ( this as any ).$navigateBack() } catch {}
    } );
    Bus.$on( "ClassRoomEntrance_RenderingBar", this.renderingBar );
}

// -- =====================================================================================

init () {

    let refs = this.$parent.$parent.$refs;

    this.book           = refs.book as Book;
    this.hypBook        = refs.hypBook as HypBook;
    this.tafel          = refs.tafel as Tafel;
    this.mainBox        = refs.mainBox as any;
    this.sideBar        = refs.sideBar as SideBar;
    this.toolBar        = refs.toolBar as ToolBar;
    this.miniMenu       = refs.miniMenu as MiniMenu;
    this.subtitle       = refs.subtitle as Subtitle;
    this.audioPlayer    = refs.audioPlayer as AudioPlayer;
    this.videoPlayer    = refs.videoPlayer as VideoPlayer;
    this.imageDisplay   = refs.imageDisplay as ImageDisplay;
    this.videoControl   = refs.videoControl as VideoControl;
    this.youTubePlayer  = refs.youTubePlayer as YouTubePlayer;

    store.state.here = 'ClassRoomEntrance';
    let lesson = store.state.inHand.lesson;

    // .. register sync status
    lesson.chromosome.sync = false;

    this.wallPainter();

    storage.organellesLoader( lesson )
    .then( () => {
        try { this.avatar = store.state.inHand.avatarPath || this.avatar } catch {}
        try { this.title = lesson.chromosome.title } catch {}
    } )
    .catch( err => this.err( err ) );

}

// -- =====================================================================================

async modelAnalyzer () {

    let model = store.state.inHand.lesson.chromosome.model;

    // .. opt out unknown models
    if ( !genetics.modelIsAcceptable( model ) ) return this.err( "Unknown Lesson Model" );

    // .. we have known model : TA
    if ( model.includes( "dAudio" ) )  await this.setup_TA();
    // .. we have known model : TV
    if ( model.includes( "dVideo" ) )  await this.setup_TV();
    // .. we have known model : TI
    if ( model.includes( "dImage" ) )  await this.setup_TI();
    // .. we have known model : HT
    if ( model.includes( "hypText" ) ) await this.setup_HT();

    this.slide_TO = setTimeout( () => this.slide( false ), 100 );

}

// -- =====================================================================================

async setup_TA () {

    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ),
        z = tools.etikettKey();

    // .. class Formation
    this.mainBox.nativeView.rows = "40,auto,*,40";
    // .. audio Player
    this.audioPlayer.init( store.state.inHand.mediaPath );
    // .. miniMenu
    await this.miniMenu.init();
    // .. touch etikett
    dText.etikett = dText.etikett || {};
    // .. provide etikett
    if ( !dText.etikett[z] ) {
        await this.tafel.init();
        dText.etikett[z] = await this.tafel.typeset( dText.content );
    }
    // .. preparing Book
    this.book.init( dText, dText.etikett[z], dText.pinnedPoint || 0 );
    // .. ToolBar
    this.toolBar.init( dText );
    // .. setting environment properties 
    store.state.here = "ClassRoom";
    store.state.mode = "reading";

}

// -- =====================================================================================

async setup_TV () {

    let dVideo = store.state.inHand.lesson.protoplasm.find( x => x.type === "dVideo" );

    // .. miniMenu
    this.miniMenu.controlButtons( "stopped", [ "Speed", "Play", "Pause" ] );
    await this.miniMenu.init();
    // .. sideBar
    this.sideBar.init( dVideo.isYouTube ? this.youTubePlayer : this.videoPlayer );
    // .. youTubePlayer
    if ( dVideo.isYouTube ) this.youTubePlayer.init();
    // .. videoPlayer
    else this.videoPlayer.init();
    // .. videoControl
    this.videoControl.init( dVideo.isYouTube ? this.youTubePlayer : this.videoPlayer );
    // subtitle
    this.subtitle.init();
    // .. wait a bit
    await new Promise( _ => setTimeout( _, 1000 ) );
    // .. setting environment properties 
    store.state.here = "ClassRoom";

}

// -- =====================================================================================

async setup_TI () {

    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ),
        z = tools.etikettKey();

    // .. class Formation
    this.mainBox.nativeView.rows = "40,auto,*,40";
    // .. miniMenu
    this.miniMenu.controlButtons( "stopped", [ "Speed", "Play", "Pause" ] );
    await this.miniMenu.init();
    // .. image
    // ! force download at first 
    await this.imageDisplay.init( store.state.inHand.mediaPath );
    // .. touch etikett
    dText.etikett = dText.etikett || {};
    // .. provide etikett
    if ( !dText.etikett[z] ) {
        await this.tafel.init( true, .8 );
        dText.etikett[z] = await this.tafel.typeset( dText.content );
    }
    // .. preparing Book
    this.book.init( dText, dText.etikett[z], dText.pinnedPoint || 0 );
    // .. ToolBar
    this.toolBar.init( dText );
    // .. setting environment properties 
    store.state.here = "ClassRoom";
    store.state.mode = "reading";

}


// -- =====================================================================================

async setup_HT () {

    let hypText = store.state.inHand.lesson.protoplasm.find( x => x.type === "hypText" );

    // .. class Formation
    this.mainBox.nativeView.rows = "40,auto,*,40";
    // .. miniMenu
    this.miniMenu.controlButtons( "stopped", [ "Speed", "Play", "Pause" ] );
    await this.miniMenu.init();
    // .. touch etikett
    hypText.etikett = hypText.etikett || {};
    // .. provide etikett
    if ( !hypText.etikett[ "any" ] )
        hypText.etikett[ "any" ] = this.hypEtikett( hypText.content );
    // .. preparing Book
    this.hypBook.init( hypText, hypText.etikett[ "any" ], hypText.pinnedPoint || 0 );
    // .. ToolBar
    this.toolBar.init( hypText );
    // .. setting environment properties 
    store.state.here = "ClassRoom";
    store.state.mode = "reading";

}

// -- =====================================================================================

hypEtikett ( content: TS.UniText[] ) {

    let etikett: number[] = [];

    for ( let i in content )
        if ( content[i][1].standoff === "block" || Number(i) === content.length )
            etikett.push( Number(i) );

    return etikett;

}

// -- =====================================================================================

slide_TO: NodeJS.Timeout | any;
slide ( enter: boolean ) {

    if ( enter ) store.state.here = 'ClassRoomEntrance';

    let target = this.$refs.entrance as any,
        x_def: NS.AnimationDefinition = {};

    // .. bug resolver
    if ( !target ) return;

    x_def.target = target.nativeView;
    x_def.translate = { x: enter ? 0 : -store.state.windowSize.width, y: 0 }
    x_def.curve = NS.Enums.AnimationCurve.easeIn;

    let entranceAnimation = new NS.Animation( [ x_def ], false );
    entranceAnimation.play().then( () => {
        if ( !enter ) ( this.$refs.entrance as any ).nativeView.visibility = "hidden";
    } );

}

// -- =====================================================================================

renderingBar ( percent ) {
    this.percent = percent;
    if ( percent === -1 ) this.loadHint = "";
    if ( percent > -1 && percent < 100 ) this.loadHint = ' Rendering ...';
    if ( percent === 100 ) {
        this.loadHint = " Rendered.  ";
        setTimeout( () => this.renderingBar(-1), 300 );
    }
}

// -- =====================================================================================

wallPainter () {
    let theme = store.state.appConfig.theme;
    let BGColor = TS.BGColors[ theme ];
    ( this.$refs.entrance as any ).nativeView.backgroundColor = BGColor;
}

// -- =====================================================================================

err ( msg: string ) {
    this.loadHint = " " + msg;
    this.loadHindColor = "orange";
    setTimeout( () => ( this as any ).$navigateBack(), 3000 );
}

// -- =====================================================================================

beforeDestroy() {
    if ( this.slide_TO ) clearTimeout( this.slide_TO );
}

// -- =====================================================================================

destroyed () {
    Bus.$off( "ClassRoomEntrance_Back" );
    Bus.$off( "ClassRoomEntrance_RenderingBar" );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

`// -- =====================================================================================

<style scoped>

    .avatar {
        height: auto;
        width: 290;
        border-width: 2;
        border-radius: 10;
    }

    .light .avatar {
        border-color: #0a5a6e;
    }

    .dark .avatar {
        border-color: #adadad;
    }

    .loading {
        height: auto;
        padding: 5;
        width: 100%;
        color: #168594;
        font-size: 23px;
        font-family: TextMeOne-Regular;
    }

    .rendering {
        height: 33;
        border-radius: 7;
        margin-top: 100;
        width: 80%;
    }

    .light .rendering {
        background-color: #1cddeb;
    }

    .dark .rendering {
        background-color: #151615;
    }

    .renderBar {
        height: 100%;
        border-radius: 7;
    }

    .light .renderBar {
        background-color: #1ba2ac;
    }

    .dark .renderBar {
        background-color: #0e4549;
    }

    .title {
        width: 80%;
        font-size: 15px;
        font-family: TextMeOne-Regular;
    }

    .light .title {
        color: #505152;
    }

    .dark .title {
        color: #808080;
    }

</style>