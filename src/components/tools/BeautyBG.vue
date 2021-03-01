<template>
<GridLayout 
    columns="*,auto" 
    rows="*,auto" 
    :background="$store.state.darkMode ? '#003d47' : '#f4ddcb'" 
>
<!--                                                                                    -->
    
    <Image 
        verticalAlignment="bottom" 
        horizontalAlignment="right" 
        stretch="aspectFit"
        col=1
        row=1
        :src=bg.src 
        :height="bg.height"
        :translateY="bg.translateY"
    />

    <StackLayout
        row=1
        colSpan=2
        @tap="next"
    />

<!--                                                                                    -->

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
import * as storage                     from "@/mixins/storageHandler"
import * as tools                       from "@/mixins/tools"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class BeautyBG extends Vue {

// -- =====================================================================================

BGName = "";

// -- =====================================================================================

get bg () {

    let bg = { src: "", height: "", translateY: 0 },
        bgs = store.state.appConfig.beautyBGs,
        style = store.state.darkMode ? '_dark' : '_light';

    if ( this.BGName ) {
        if ( this.BGName === "tree" ) bg.src = "res://tree" + style;
        else bg.src = NS.path.join( storage.bBGs_dir.path, this.BGName ) + style;
        bg.height = bgs[ this.BGName ].height;
        bg.translateY = bgs[ this.BGName ].translateY;
    }

    // if ( TNS_ENV !== "production" ) try { bg.src = storage.bBGs_dir.path + "/test" + style + ".jpg"; } catch {}
    // if ( TNS_ENV !== "production" ) bg.src += ".jpg";

    return bg;

}

// -- =====================================================================================

mounted () {
    Bus.$on( "BeautyBG_Init", this.init );
}

// -- =====================================================================================

init () {

    this.randomize();

    let bgs = store.state.appConfig.beautyBGs,
        url = tools.ssd + '/beautyBGList';

    // delete bgs.sign;

    NS.Http.getJSON( url ).then(
        async ( res: TS.SSD_Res ) => {
            let list = res.answer;
            for ( let pic of Object.keys( list ) ) {

                if ( !bgs.hasOwnProperty( pic ) ) {

                    let f = 0;
                    for ( let v of [ "_light", "_dark" ] ) {
                        url = tools.ssd + 'giveMeBG?f=';
                        let picName = pic + v;
                        url += picName;
                        let path = NS.path.join( storage.bBGs_dir.path, picName );
                        await NS.Http.getImage( url ).then( imageSource => {
                            if ( imageSource.saveToFile( path, "jpg" ) ) f++;
                        } );
                    }

                    if ( f === 2 ) bgs[ pic ] = list[ pic ];
                    storage.saveAppConfig();

                }

            }
        }
    )

}

// -- =====================================================================================

randomize () {
    let bgs = store.state.appConfig.beautyBGs;
    let rand = Math.floor( Math.random() * Object.keys( bgs ).length );
    this.BGName = Object.keys( bgs )[ rand ];
}

// -- =====================================================================================

next () {
    let bgs = store.state.appConfig.beautyBGs;
    if ( Object.keys( bgs ).length > 1 ) {
        let idx = Object.keys( bgs ).indexOf( this.BGName );
        let next = ( idx + 1 ) % Object.keys( bgs ).length;
        this.BGName = Object.keys( bgs )[ next ];
    }
}

// -- =====================================================================================

destroyed () {
    Bus.$off( "BeautyBG_Init" );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

</style>