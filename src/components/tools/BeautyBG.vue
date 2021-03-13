<template>
<GridLayout 
    columns="*,auto" rows="*,auto,60" 
    :background="$store.state.darkMode ? '#003d47' : '#f4ddcb'"
>

<!---------------------------------------------------------------------------------------->

    <Image 
        verticalAlignment="bottom"
        horizontalAlignment="right"
        stretch="aspectFit"
        col=1
        row=1
        :src=bg
        height="40%"
    />

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
import * as storage                     from "@/mixins/storageHandler"
import * as tools                       from "@/mixins/tools"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( {} )

// -- =====================================================================================

export default class BeautyBG extends Vue {

// -- =====================================================================================

BGName = "";

// -- =====================================================================================

get bg () {

    let bg: string,
        style = store.state.darkMode ? '_dark' : '_light';

    if ( this.BGName ) {
        if ( this.BGName === "tree" ) bg = "res://tree" + style;
        else bg = NS.path.join( storage.bBGs_dir.path, this.BGName ) + style;
    }

    return bg;

}

// -- =====================================================================================

mounted () {
    Bus.$on( "BeautyBG_Init", this.init );
    Bus.$on( "BeautyBG_Next", this.next );
}

// -- =====================================================================================

init () {

    this.randomize();

    let bgs = store.state.appConfig.beautyBGs,
        url = tools.ssd + 'beautyBGList';

    NS.Http.getJSON( url ).then(
        async ( res: TS.SSD_Res ) => {

            let list = JSON.parse( res.answer as string );

            for ( let pic of list ) {

                if ( !bgs.includes( pic ) ) {

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

                    if ( f === 2 ) bgs.push( pic );
                    storage.saveAppConfig();

                }

            }

        }
    )

}

// -- =====================================================================================

randomize () {
    let bgs = store.state.appConfig.beautyBGs;
    let rand = Math.floor( Math.random() * bgs.length );
    this.BGName = bgs[ rand ];
}

// -- =====================================================================================

next () {
    let bgs = store.state.appConfig.beautyBGs;
    if ( bgs.length > 1 ) {
        let idx = bgs.indexOf( this.BGName );
        let next = ( idx + 1 ) % bgs.length;
        this.BGName = bgs[ next ];
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