<template>
<!---------------------------------------------------------------------------------------->

    <WebView ref="webView" visibility="hidden" />

<!---------------------------------------------------------------------------------------->
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import store                            from "@/mixins/store"
// * tns plugin add nativescript-webview-interface
let webViewInterfaceModule = require('nativescript-webview-interface');
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( {} )

// -- =====================================================================================

export default class YouTubePlayer extends Vue {

// -- =====================================================================================

oWebViewInterface;
player;
youTubeId: string|null = null;

// -- =====================================================================================

init() {
    ( this.$refs.webView as any ).nativeView.visibility = "visible";
    this.youTubeId = this.youTubeIDFinder( store.state.inHand.mediaPath );
    this.setupWebViewInterface();
    this.handleEventFromWebView();
}

// -- =====================================================================================

youTubeIDFinder ( url: string ) {

    let youTube = [ "youtube.com/" , "youtu.be/" ];

    if ( url.includes( youTube[0] ) && url.includes( "?v=" ) ) {

        let aCut: string,
            bCut: string;

        aCut = "?v=";
        url = url.substr( url.indexOf( aCut ) + aCut.length );

        bCut = "&";
        if ( url.includes( bCut ) ) url = url.substring( 0, url.indexOf( bCut ) );

        bCut = "/";
        if ( url.includes( bCut ) ) url = url.substring( 0, url.indexOf( bCut ) );

        return url;

    };

    if ( url.includes( youTube[1] ) ) {

        let aCut: string,
            bCut: string,
            bCutId: number;

        aCut = "youtu.be/";
        url = url.substr( url.indexOf( aCut ) + aCut.length );

        bCut = "/";
        bCutId = url.indexOf( bCut );
        if ( bCutId > -1 ) url = url.substring( 0, bCutId );

        return url;

    };

    return null;

}

// -- =====================================================================================

setupWebViewInterface () {
    // .. get youTubeView
    let webView = ( this.$refs.webView as any ).nativeView;
    // .. grant permission
    webView.android.getSettings().setAllowFileAccess(true);
    // .. set YT API
    let src = '~/assets/www/YT_API.html?v=' + this.youTubeId;
    this.oWebViewInterface = new webViewInterfaceModule.WebViewInterface( webView, src );
}

// -- =====================================================================================

handleEventFromWebView () {

    enum PlayerState {
        "unstarted"    = -1,
        "ended"        =  0,
        "playing"      =  1,
        "paused"       =  2,
        "buffering"    =  3,
        "video_cued"   =  5,  
    }

    this.oWebViewInterface.on( 'onStateChange', eventData => {

        // .. register mediaState
        switch ( eventData ) {
            case PlayerState.unstarted : store.state.mediaState = 'stopped'; break;
            case PlayerState.ended     : store.state.mediaState = 'stopped'; break;
            case PlayerState.playing   : store.state.mediaState = 'playing'; break;
            case PlayerState.paused    : store.state.mediaState = 'paused' ; break;
            // case PlayerState.buffering : store.state.mediaState = 'stopped'; break;
            // case PlayerState.video_cued: store.state.mediaState = 'stopped'; break;
        }
        // .. reporting Management
        this.reportCurrentTime( eventData === PlayerState.playing );

    } );

}

// -- =====================================================================================

getCurrentTime_TO: NodeJS.Timeout | any;
reportCurrentTime ( state: boolean ) {

    if ( this.getCurrentTime_TO ) clearTimeout( this.getCurrentTime_TO );

    if ( state ) {

        this.getCurrentTime_TO = setTimeout( () => this.reportCurrentTime( true ), 100 );

        this.oWebViewInterface.callJSFunction( 'whereAreYou', null, currentTime => {
            Bus.$emit( "Subtitle_PresentPerTime", currentTime );
        } );

    }

}

// -- =====================================================================================

play () {
    this.oWebViewInterface.callJSFunction( 'play' );
}

// -- =====================================================================================

pause () {
    this.oWebViewInterface.callJSFunction( 'pause' );
}

// -- =====================================================================================

seekTo ( time: number, exact?: boolean ) {
    this.oWebViewInterface.callJSFunction( 'whereAreYou', null, currentTime => {
        this.oWebViewInterface.callJSFunction( 'goTo', exact? time : currentTime + time );
        Bus.$emit( "Subtitle_PresentPerTime", currentTime );
    } );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

</style>