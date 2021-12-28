<template>
<GridLayout id="curtain" ref="curtain" class="fx" rows="*,100" @tap="pass">

<!---------------------------------------------------------------------------------------->

    <GridLayout rows="60,100,100,*" padding="100 40">

        <TextField
            ref="searchBox"
            row=0
            hint="Suchen nach ..."
            class="searchBox"
            @textChange="search"
        />

        <Verb ref="Verb" row=1 />
        <Wort ref="Wort" row=2 />
        <Local ref="Local"  row=3 />

    </GridLayout>

    <GridLayout row=1  @tap="curtain('hide')" ba></GridLayout>

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
import Verb                             from "@/components/Salon/S/Verb.vue"
import Wort                             from "@/components/Salon/S/Wort.vue"
import Local                            from "@/components/Salon/S/Local.vue"

// -- =====================================================================================

@Component ( {
    components: { Verb, Wort, Local }
} )

// -- =====================================================================================

export default class SearchPanel extends Vue {

// -- =====================================================================================

// .. prevent beneath layers get tapped
pass() { return false; };

// -- =====================================================================================

mounted () {}

// -- =====================================================================================

curtain ( action: "hide" | "show" ) {

    let opacity: number,
        curtain = ( this.$refs.curtain as any ).nativeView;

    switch ( action ) {
        case "hide": opacity = 0; break;
        case "show": opacity = 1; break;
    }

    if ( action === "show" ) curtain.visibility = "visible";
    // .. first phase
    curtain.animate( { opacity: opacity } )
    // .. second phase
    .then( () => { if ( action === "hide" ) curtain.visibility = "hidden"; } );

}

// -- =====================================================================================

search_TO;
search ( event ) {

    let text = event.object.text;
    let Verb = ( this.$refs.Verb as Verb );
    let Wort = ( this.$refs.Wort as Wort );

    // .. clear last search planed job
    clearTimeout( this.search_TO );

    // .. do a search job after a bit delay and having a minimum of letters in hand
    if ( text.length >= 3 ) {
        this.search_TO = setTimeout( () => {
            Verb.lookUp( text );
            Wort.lookUp( text );
        }, 550 );
    }

}

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
    #curtain {
        background-color: rgba(0, 0, 0, 0.88);
        /* opacity: 0; */
        /* visibility: hidden; */
    }

    .searchBox{
        background-color: black;
        color: #a8a8a8;
        placeholder-color: #2073bb;
        width: 270;
        padding-left: 10;
        padding-right: 80;
        border-bottom-width: 1;
        border-color: #dddddd;
        border-radius: 7 7 0 0;
        margin-bottom: 20;
    }

</style>