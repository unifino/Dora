<template>

    <VNSPlayer
        visibility="collapsed"
        ref="player"
        autoplay="false"
        src=""
        observeCurrentTime="true"
        height="auto"
    />

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import { Video }                        from 'nativescript-videoplayer'
import Bus                              from "@/mixins/bus"
import Subtitle                         from "@/components/ClassRoom/Subtitle.vue"
import SubtitleSum                      from "@/components/ClassRoom/SubtitleSum.vue"

// -- =====================================================================================

@Component ( {
    components: {}
} )

// -- =====================================================================================

export default class VideoTNSPlayer extends Vue {

// -- =====================================================================================

player
subtitle: Subtitle
subtitleSum: SubtitleSum

// -- =====================================================================================

mounted () {

    // app.on( app.suspendEvent, _ => { 
    //     try{ vid.pause() } catch (e) { tools.toaster( e + '' ) } 
    // } )

    // app.on( app.resumeEvent,  _ => { 
    //     vid.seekToTime( this.position ) 
    //     vid.play() 
    // } )

}

// -- =====================================================================================

init () {

    // .. register screen
    this.player = ( this.$refs.player as any ).nativeView
    this.player.visibility = "visible"
    this.player.src = store.state.inHand.mediaPath

    this.player.on( Video.currentTimeUpdatedEvent, this.reportCurrentTime )
    this.player.on( Video.playbackStartEvent, () => store.state.mediaState = 'playing' )
    this.player.on( Video.pausedEvent, () => store.state.mediaState = 'paused' )

    let refs = this.$parent.$parent.$refs
    this.subtitle = refs.subtitle as Subtitle
    this.subtitleSum = refs.subtitleSum as SubtitleSum

    // .. auto start
    this.play();

}

// -- =====================================================================================

play () {
    // .. reload src | resolve downloading process bug
    this.player.src = store.state.inHand.mediaPath
    this.player.play()
    // this.subtitle.visibility = "visible"
    // this.subtitle.visibility = "collapsed"
    // this.subtitleSum.visibility = "collapsed"
    this.subtitleSum.visibility = "visible"
}

// -- =====================================================================================

pause () {
    this.player.pause()
    // this.subtitle.visibility = "collapsed"
    this.subtitleSum.visibility = "visible"
}

// -- =====================================================================================

seekTo ( time: number, exact?: boolean ) {
    let currentTime = this.player.getCurrentTime() /1000
    this.player.seekToTime( ( exact? time : currentTime + time ) *1000 )
}

// -- =====================================================================================

reportCurrentTime () {
    let currentTime = this.player.getCurrentTime() /1000
    Bus.$emit( "Subtitle_PresentPerTime", currentTime )
}

// -- =====================================================================================

destroyed () {
    try {
        this.player.off( Video.currentTimeUpdatedEvent )
        this.player.off( Video.playbackStartEvent )
        this.player.off( Video.pausedEvent )
        this.player.destroy()
    } catch {}
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

</style>