<template>
<GridLayout id="verbPanel" class="fx" rows="*,auto,*" @tap="play">

<!---------------------------------------------------------------------------------------->

    <Label :text="stamm" row=1 />

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import * as tools                       from "@/mixins/tools"
import * as storage                     from "@/mixins/storageHandler"
import Bus                              from "@/mixins/bus"
import * as tnsPLY                      from "@/mixins/audioPlayer"

// -- =====================================================================================

@Component ( {
    components: { }
} )

// -- =====================================================================================

export default class Verb extends Vue {

// -- =====================================================================================

stamm: string = "";
audioURL: string = "";
verb: TS.UniWord = [ "", {} ];

// -- =====================================================================================

lookUp ( word: string ) {

    return 0;

    const userAgent = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:75.0) Gecko/20100101 Firefox/75.0";

    NS.Http.request( {
        url: "https://www.verbformen.com/?w=" + word,
        method: "GET" ,
        headers: { "User-Agent": userAgent }
    } ).then(

        res => {

            let text = res.content.toString();
            // .. check if it trapped in Captcha
            if ( this.captchaTrap( text ) ) {
                tools.toaster( "Trapped in Captcha!", "short" );
                return;
            }
            let section = this.sectionFinder( text );
            // .. assign text and audio
            this.stammFinder( section );
            this.niveauFinder( section );

        },

        e => console.log( [ e +'' ] )

    )
    .catch( e => console.log( [ e +'' ] ) );

}

// -- =====================================================================================

sectionFinder ( text: string ) {

    let aCut    : string,
        bCut    : string,
        aCutID  : number,
        bCutID  : number;

    aCut   = 'id="vVdBxBox"';
    bCut   = '</section>';

    aCutID = text.indexOf( aCut );
    text   = text.substr( aCutID );
    bCutID = text.indexOf( bCut );

    return text.substr( 0, bCutID );

}

// -- =====================================================================================

stammFinder ( text: string ) {

    let aCut    : string,
        bCut    : string,
        aCutID  : number,
        bCutID  : number,
        rgx = '<\/?!?(a|b|i|u)[^>]*>',
        re  = new RegExp( rgx, 'g' ),
        audio: string;

    // .. get text
    aCut   = 'id="stammformen">';
    bCut   = '</p>';
    aCutID = text.indexOf( aCut );
    text   = text.substr( aCutID + aCut.length );
    bCutID = text.indexOf( bCut );
    text   = text.substr( 0, bCutID );

    // .. get audio
    aCut   = "https";
    bCut   = '.mp3';
    aCutID = text.indexOf( aCut );
    bCutID = text.indexOf( bCut );
    audio  = text.substr( aCutID, bCutID - aCutID + bCut.length );
    text   = text.replace( re, '' );
    text   = text.replace( /(\r\n|\n|\r)/gm, "" );
    text   = text.trim();

    this.stamm = text;
    this.audioURL = audio;

}

// -- =====================================================================================

niveauFinder ( text: string ) {

    let aCut    : string,
        bCut    : string,
        aCutID  : number,
        bCutID  : number,
        rgx = '<\/?!?(b|span)[^>]*>',
        re  = new RegExp( rgx, 'g' ),
        info: string[];

    // .. get text
    aCut   = '<p class="rInf">';
    bCut   = '</p>';
    aCutID = text.indexOf( aCut );
    text   = text.substr( aCutID + aCut.length );
    bCutID = text.indexOf( bCut );
    text   = text.substr( 0, bCutID );
    text   = text.replace( re, '' );
    text   = text.replace( /(\r\n|\n|\r)/gm, "" );
    info   = text.split( "·" );

    this.packBuilder( info );

}

// -- =====================================================================================

packBuilder ( info: string[] ) {

    this.verb[1] = {
        level: info[0].trim() as TS.CEF,
        type: info[1].trim() as "regular"|"irregular",
        auxiliary: info[2].trim() as "sein"|"haben",
    }

    this.verb[2] = [
        {
            type: "dAudio",
            sourceURL: this.audioURL,
            copyRight: true,
            text: this.stamm,
        }
    ]
    console.log(this.verb);


}

// -- =====================================================================================

play () {
    tnsPLY.init( this.audioURL );
    setTimeout( () => tnsPLY.play(), 700 );
}

// -- =====================================================================================

captchaTrap ( text: string ) {
    return ( text.includes( "Maximale Anzahl an Zugriffen" ) ) ? true : false;
}

// -- =====================================================================================

mounted () {}

// -- =====================================================================================

beforeDestroy () {}

// -- =====================================================================================

destroyed () {}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    #verbPanel{
        background-color: black;

        border-color: blanchedalmond;
        border-width: 1;
        border-radius: 7;
        text-align: center;
        font-size: 16;
        font-family: "Pompiere-Regular";
        font-family: "DMSans-Regular";
        font-family: "WaitingfortheSunrise-Regular";
        font-family: "Kalam-Regular";
        font-family: "ShadowsIntoLight-Regular";
        font-family: "BadScript-Regular";
    }
</style>