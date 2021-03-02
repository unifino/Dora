<template>
<GridLayout ref="dotBox" rows="*" columns="*,auto,auto,auto,*">

<!---------------------------------------------------------------------------------------->

    <Label v-for="x in [0,1,2]" :key=x class="dot" ref="dot" :col=x+1 />

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
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class Waiting extends Vue {

// -- =====================================================================================

mounted () {
    Bus.$on( 'Waiting_Flashing', this.flasher );
}

// -- =====================================================================================

seq_Animation: NS.Animation;
flasher ( state: -1|0|1 ) {
    
    if ( this.seq_Animation ) this.seq_Animation.cancel();

    if ( state === 0 ) {
        ( this.$refs.dotBox as any ).nativeView.visibility = "collapsed";
        return 0;
    }

    ( this.$refs.dotBox as any ).nativeView.visibility = "visible";

    let a_def: NS.AnimationDefinition = {},
        b_def: NS.AnimationDefinition,
        c_def: NS.AnimationDefinition;

    a_def.duration  = 1000;
    a_def.backgroundColor = state === 1 ? 
        new NS.Color( "#a8a3a3" ) : new NS.Color( "#333232" );

    // .. shallow copies
    b_def = { ...a_def };
    c_def = { ...a_def };

    a_def.target = ( this.$refs.dot[0] as any ).nativeView;
    b_def.target = ( this.$refs.dot[1] as any ).nativeView;
    c_def.target = ( this.$refs.dot[2] as any ).nativeView;
    
    b_def.delay = 250;
    c_def.delay = 500;

    this.seq_Animation = new NS.Animation( [ a_def, b_def, c_def ], false );
    this.seq_Animation.play()
    .then( () => this.flasher( -state as -1|1 ) );

}

// -- =====================================================================================

beforeDestroy () {
    Bus.$off( 'Waiting_Flashing' );
}

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .dot {
        width: 10;
        height: 10;
        border-radius: 120;
        margin: 0 3;
    }

    .light .dot { background-color: #a8a3a3 }
    .dark  .dot { background-color: #333232 }

</style>