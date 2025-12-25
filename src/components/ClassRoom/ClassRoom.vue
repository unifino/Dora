<template isPassThroughParentEnabled=false>
<Page isPassThroughParentEnabled=false @tap="preventBeneathGetTapped">
<GridLayout ref="mainBox" class="curtain" columns="30*,10*" rows="40,auto,*,185" visibility="hidden" >

<!---------------------------------------------------------------------------------------->
    <VideoControl   ref="videoControl"  row=3   background="black"    col=1   />
    <ImageDisplay   ref="imageDisplay"  row=1               colSpan=2           />
    <AudioPlayer    ref="audioPlayer"   row=1               colSpan=2           />
    <VideoPlayer    ref="videoPlayer"           rowSpan=3               col=0   />
    <YouTubePlayer  ref="youTubePlayer"         rowSpan=4               col=0   />
    <Adjuster       ref="adjuster"      row=3                           col=0   />
<!---------------------------------------------------------------------------------------->
    <Book           ref="book"                  rowSpan=4   colSpan=2           />
    <HypBook        ref="hypBook"               rowSpan=4   colSpan=2           />
    <Subtitle       ref="subtitle"      row=2   rowSpan=4               col=1   />
    <SubtitleSum    ref="subtitleSum"           rowSpan=4               col=1   />
<!---------------------------------------------------------------------------------------->
    <SideBar        ref="sideBar"       row=3   col=2                           />
<!---------------------------------------------------------------------------------------->
    <MiniMenu       ref="miniMenu"              rowSpan=4   colSpan=2           />
    <ToolBar        ref="toolBar"               rowSpan=4   colSpan=2           />
<!---------------------------------------------------------------------------------------->
    <Tafel          ref="tafel"         row=2               colSpan=2           />
<!---------------------------------------------------------------------------------------->
    <CEntrance      ref="CEntrance"             rowSpan=4   colSpan=2           />
<!---------------------------------------------------------------------------------------->

</GridLayout>
</Page>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import NSVue                            from "nativescript-vue"
import * as tools                       from "@/mixins/tools"
import Bus                              from "@/mixins/bus"
import MiniMenu                         from "@/components/ClassRoom/MiniMenu.vue"
import AudioPlayer                      from "@/components/ClassRoom/AudioPlayer.vue"
import Book                             from "@/components/ClassRoom/Books/Book.vue"
import HypBook                          from "@/components/ClassRoom/Books/HypBook.vue"
import CEntrance                        from "@/components/ClassRoom/ClassRoomEntrance.vue"
import ImageDisplay                     from "@/components/ClassRoom/ImageDisplay.vue"
import SideBar                          from "@/components/ClassRoom/SideBar.vue"
import Subtitle                         from "@/components/ClassRoom/Subtitle.vue"
import SubtitleSum                      from "@/components/ClassRoom/SubtitleSum.vue"
import Adjuster                         from "@/components/ClassRoom/Adjuster.vue"
import Tafel                            from "@/components/ClassRoom/Tafel.vue"
import ToolBar                          from "@/components/ClassRoom/ToolBar.vue"
import VideoControl                     from "@/components/ClassRoom/VideoControl.vue"
import VideoPlayer                      from "@/components/ClassRoom/VideoPlayer.vue"
import YouTubePlayer                    from "@/components/ClassRoom/YouTubePlayer.vue"

// -- =====================================================================================

NSVue.registerElement( "VNSPlayer", () => require( "nativescript-videoplayer" ).Video )

@Component ( {
    components: {
        CEntrance,
        MiniMenu,
        Tafel,
        Book,
        HypBook,
        ToolBar,
        ImageDisplay,
        AudioPlayer,
        SideBar,
        Subtitle,
        SubtitleSum,
        Adjuster,
        VideoControl,
        VideoPlayer,
        YouTubePlayer,
    } 
} )

// -- =====================================================================================

export default class ClassRoom extends Vue {

// -- =====================================================================================

pass
there: TS.here

playerType: "myNSPlayer"|"YTPlayer" = "YTPlayer"
playerModule: YouTubePlayer|VideoPlayer

// -- =====================================================================================

mounted () {

    this.there = store.state.here
    this.doorControl( "open" )
    Bus.$on( "ClassRoom_BackOrExit", this.backOrExit )

}

// -- =====================================================================================

preventBeneathGetTapped () {}

// -- =====================================================================================

backOrExit () {
    if ( store.state.scopeIsActive ) Bus.$emit( "Scope_DeskCtl", "down" )
    else ( this as any ).$navigateBack()
}

// -- =====================================================================================

async doorControl ( act: 'open' | 'close' ) {

    if ( act === "close" ) ( this.$refs.mainBox as any ).nativeView.visibility = "hidden"
    if ( act === "open"  ) ( this.$refs.CEntrance as CEntrance ).init()

    // .. after fully expanded and maximized to borders
    let myCallBack = async () => {

        if ( act === "open" ) {
            ( this.$refs.mainBox as any ).nativeView.visibility = "visible"
            // .. bug resolver
            let target = this.$refs.CEntrance as CEntrance
            if ( target ) setTimeout( () => target.modelAnalyzer(), 0 )
        }

        if ( act === "close" ) {
            store.state.mode = "idle"
            store.state.here = this.there
            // .. deregister Lesson Data
            if ( this.there !== "Salon_F" ) {
                store.state.preserve.selected = []
                store.state.inHand.lesson = null
                store.state.inHand.mediaPath = null
                store.state.inHand.avatarPath = null
            }
        }

    }

    tools.doorRemote( "Class", this.$root.$children[0].$refs.room, act, myCallBack )

}

// -- =====================================================================================

seeking ( direction ) {

    let factor

    switch ( direction ) {
        case "previous": factor = -1.0; break
        case "next":     factor = +1.5; break
    }

    this.playerModule = this.$refs.playerModule as YouTubePlayer|VideoPlayer

    this.playerModule.seekTo( factor *3 )

}

// -- =====================================================================================

beforeDestroy (VideoPlayer) {
    this.doorControl( "close" )
}

// -- =====================================================================================

destroyed () {
    Bus.$off( "ClassRoom_Exit" )
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

</style>