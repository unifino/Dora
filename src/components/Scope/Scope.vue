<template>
<GridLayout ref="rail" rows="*" >

    <GridLayout ref="desk" class="desk" rows="12,auto,25,auto,25,auto,*" @pan="dragMe" >

        <GridLayout row=1 class="barHandle" />

        <Waiting    row=3 />

        <Translator row=3 ref="translator" @snapIt="snapDesk" />

        <WebView    row=5 ref="myWeb" class="myWeb" />

    </GridLayout>

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import * as tools                       from "@/mixins/tools"
import Translator                       from "@/components/Scope/Translator.vue"
import Bus                              from "@/mixins/bus"
import Waiting                          from "@/components/tools/waiting.vue"
import * as tnsPLY                      from "@/mixins/audioPlayer"

// -- =====================================================================================

@Component ( { 
    components: { Translator, Waiting } 
} )

// -- =====================================================================================

export default class Scope extends Vue {

// -- =====================================================================================

desk;
translatorModule: Translator;
isDragging = false;

// -- =====================================================================================

mounted () {
    Bus.$on( "Scope_Init", this.init );
    Bus.$on( "Scope_DeskCtl", this.deskCtl );
}

// -- =====================================================================================

init () {

    this.desk = ( this.$refs.desk as any ).nativeView;
    this.translatorModule = this.$refs.translator as Translator;

    if ( !store.state.windowSize.height ) {
        setTimeout ( () => this.init(), 100 );
        return 0;
    }
    
    this.desk.height = store.state.windowSize.height;
    this.desk.translateY = store.state.windowSize.height +1;
    this.desk.visibility = "visible";

}

// -- =====================================================================================

setMyWebSrc ( str="" ) {

    let myWeb = ( this.$refs.myWeb as any ).nativeView;
    myWeb.android.getSettings().setBuiltInZoomControls(false);
    
    str = "https://duckduckgo.com/?q=" + str;
    if ( str.split( " " ).length < 3 ) str += "&iax=images&ia=images";
    
    myWeb.src = "";
    myWeb.src = encodeURI( str );
    if ( !str ) myWeb.height = 1; 

}

// -- =====================================================================================

setMyWebHeight () {

    let myWeb = ( this.$refs.myWeb as any ).nativeView,
        translator = ( this.translatorModule as any ).nativeView,
        translator_H = translator.getActualSize().height,
        myY = this.desk.getLocationInWindow().y,
        h = store.state.windowSize.height -myY -translator_H -60;
    
    myWeb.height = h;

}

// -- =====================================================================================

async deskCtl ( act: 'up' | 'down', str?: string ) {

    if ( this.desk_Animation && this.desk_Animation.isPlaying ) return 0;

    if ( act === "up" ) {
        store.state.scopeIsActive = true;
        Bus.$emit( 'Waiting_Flashing', 1 );
        this.setMyWebSrc( str );
        this.snapDesk( "waiting" ).then( () => { 
        this.translatorModule.init( str );
            if ( act === "up" ) {
                this.translatorModule.init( str )
                Bus.$emit( 'Waiting_Flashing', 1 );
            };
        } );
    };

    if ( act === "down" ) {
        this.snapDesk( "hide" );
    }

}

// -- =====================================================================================

desk_Animation: NS.Animation;
snapDesk ( snapPosition: "waiting"|"hide"|"translate"|"web" ): Promise<void> {

    return new Promise ( rs => { 

        let desk_H = this.desk.getActualSize().height,
            translator = ( this.translatorModule as any ).nativeView,
            translator_H = translator.getActualSize().height,
            x_def: NS.AnimationDefinition = {},
            snapToY: number;

        switch ( snapPosition ) {
            case "waiting": snapToY = desk_H -75; break;
            case "hide": snapToY = desk_H +1; break;
            case "translate": snapToY = desk_H - translator_H - 60; break;
            case "web": snapToY = 75; break;
        }

        x_def.target = this.desk;
        x_def.translate = { x: 0, y: snapToY }
        x_def.curve = NS.Enums.AnimationCurve.easeIn;
        x_def.duration = 200;

        this.desk_Animation = new NS.Animation( [ x_def ], false );

        this.desk_Animation.play().then( () => {
            translator_H = translator.getActualSize().height,
            this.setMyWebHeight();

            rs();

            // .. pause media
            if ( snapPosition === "translate" ) {
                if ( store.state.mediaState === "playing" ) tnsPLY.pause( "scope" );
            }
            if ( snapPosition === "hide" ) {
                // .. reset webView
                this.setMyWebSrc();
                // .. remove retrieved Data
                this.translatorModule.slots = {};
                // .. resume media
                if ( store.state.mediaState === "pausedByScope" ) tnsPLY.resume();
                store.state.scopeIsActive = false;
            }
        } );

    } );

}

// -- =====================================================================================

prevDeltaY: number;
dragMe ( args: NS.PanGestureEventData ) {

    let desk_H = this.desk.getActualSize().height,
        translator = ( this.translatorModule as any ).nativeView,
        translator_H = translator.getActualSize().height;

    // .. down
    if ( args.state === 1 ) {
        this.isDragging = true;
        this.prevDeltaY = 0;
    }
    
    // .. drag
    else if ( args.state === 2 ) {
        let myDelta = args.deltaY - this.prevDeltaY,
            myNewTranslateY = this.desk.translateY + myDelta;
        this.desk.translateY = myNewTranslateY > 0 ? myNewTranslateY : 0;
        this.prevDeltaY = args.deltaY;
        this.setMyWebHeight();
    }

    // .. up
    else if ( args.state === 3 ) {
        if ( desk_H -this.desk.translateY > desk_H - 100 ) 
            this.snapDesk( "web" );
        if ( desk_H -this.desk.translateY -translator_H < 300 ) 
            this.snapDesk( "translate" );
        if ( desk_H -this.desk.translateY < translator_H/1.2 ) 
            this.snapDesk( "hide" );
        // .. wait a bit
        setTimeout( () => this.isDragging = false, 10 );
    }

}

// -- =====================================================================================

destroyed () {
    Bus.$off( "Scope_Init" );
    Bus.$off( "Scope_DeskCtl" );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .desk {
        android-elevation: 10;
        width: 95%;
        border-radius:  7 7 0 0;
        visibility: hidden;
    }

    .light .desk { background-color: #949393 }
    .dark  .desk { background-color: #042b30 }

    .barHandle {
        width: 100;
        height: 4;
        border-radius: 4;
    }

    .light .barHandle { background-color: #292929 }
    .dark  .barHandle { background-color: #5e5e5e }

    .myWeb {
        height: 1;
    }

</style>