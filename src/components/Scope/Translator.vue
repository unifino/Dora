<template>
<GridLayout rows="*" columns="*" >

<!---------------------------------------------------------------------------------------->

    <StackLayout>
        <Label 
            :visibility="translatorResponded ? 'visible' : 'collapsed'"
            textWrap=true
            class="translationSlot"
            v-for="slot of slots" 
            :key=slot
            :text=slot
            :padding="slot ? '10 15' : 0"
        />
    </StackLayout>

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
import * as tools                       from "@/mixins/tools"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class Translator extends Vue {

// -- =====================================================================================

slots = {};
translatorResponded = false;

// -- =====================================================================================

init ( str: string ) {

    // TODO auto detection
    let from = store.state.inHand.institute.toLowerCase();
    
    // TODO add personal selected Dic
    this.slots = { "en": null, "fa": null };

    this.translatorResponded = false;
    for ( let to of Object.keys( this.slots ) ) this.translate( from, to, str );

}

// -- =====================================================================================

async translate ( from: string, to: string, str: string ) {

    if ( to === from ) {
        delete this.slots[ to ];
        return 0;
    }

    // .. beautifying
    await new Promise( _ => setTimeout( _ , 300 ) );

    tools.translator( from, to, str )
    .then( async translate => {
        
        this.translatorResponded = true;
        Bus.$emit( 'Waiting_Flashing', 0 );
        this.slots[to] = translate;
        
        await new Promise( _ => setTimeout( _ , 0 ) );
        this.$emit( "snapIt", "translate" );
    
    } )
    .catch( async err => {
        
        this.translatorResponded = true;
        Bus.$emit( 'Waiting_Flashing', 0 );
        this.slots[to] = err ? err : "Unable to Translate!";
        
        await new Promise( _ => setTimeout( _ , 0 ) );
        this.$emit( "snapIt", "translate" );

    } );

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>
/*                                          */

    .translationSlot{
        font-size: 14px;
        width: 88%;
    }

    .light .translationSlot { 
        color: #292929;
    }
    .dark  .translationSlot { 
        color: #c0c0c0;
    }

</style>