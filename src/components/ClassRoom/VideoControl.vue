<template>

<!---------------------------------------------------------------------------------------->

<GridLayout ref="controlBox" row=3 columns="10*,15*,10*" visibility="collapsed">

    <StackLayout col="0" @tap="seeking( 'previous' )" ></StackLayout>
    <StackLayout col="1" @tap="playToggler()"         ></StackLayout>
    <StackLayout col="2" @tap="seeking( 'next' )"     ></StackLayout>

</GridLayout>

<!---------------------------------------------------------------------------------------->

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import YouTubePlayer                    from "@/components/ClassRoom/YouTubePlayer.vue"
import VideoPlayer                      from "@/components/ClassRoom/VideoPlayer.vue"

// -- =====================================================================================

@Component ( {
    components: {} 
} )

// -- =====================================================================================

export default class VideoControl extends Vue {

// -- =====================================================================================

playerModule: YouTubePlayer | VideoPlayer;

// -- =====================================================================================

init ( model: YouTubePlayer | VideoPlayer ) {
    ( this.$refs.controlBox as any ).nativeView.visibility = "visible";
    this.playerModule = model;
}

// -- =====================================================================================

playToggler () {

    let dVideo = store.state.inHand.lesson.protoplasm.find( x => x.type === "dVideo" );

    if ( store.state.mediaState === 'playing' ) this.playerModule.pause();

    else {
        this.playerModule.play();
        if ( dVideo.pinnedPoint ) this.playerModule.seekTo( dVideo.pinnedPoint, true );
    }

}

// -- =====================================================================================

seeking ( direction ) {

    let factor;

    switch ( direction ) {
        case "previous": factor = -1.0; break;
        case "next":     factor = +1.5; break;
    }

    this.playerModule.seekTo( factor *3 );
   
}

// -- =====================================================================================


// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

</style>