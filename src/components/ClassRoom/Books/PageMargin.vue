<template>
<GridLayout rows="*,auto,*" height="100%" >

<!---------------------------------------------------------------------------------------->

    <Label
        row=1
        ref="panel"
        :class="'panel fas ' + this.location"
        :text="String.fromCharCode( '0x' + ( this.location==='left' ? 'f104':'f105' ) )"
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
import Bus                              from "@/mixins/bus"
import Book                             from "@/components/ClassRoom/Books/Book.vue"

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class PageMargin extends Vue {

// -- =====================================================================================

@Prop() location: "left" | "right";

// -- =====================================================================================

panel_Animation;
warmingUp = false;
activator ( activation: boolean ) {
 
    if ( activation && this.noNeedToAction() ) return 0;
    if ( activation && this.warmingUp ) return 0;
    if ( this.panel_Animation ) this.panel_Animation.cancel();
    this.warmingUp = activation;

    let x_def: NS.AnimationDefinition = {};

    x_def.target    = ( this.$refs.panel as any ).nativeView;
    x_def.curve     = NS.Enums.AnimationCurve.easeIn;
    x_def.duration  = activation ? 500 : 300;
    x_def.opacity   = activation ? 1 : 0;
    
    this.panel_Animation = new NS.Animation( [ x_def ], false );

    this.panel_Animation.play()
    .then( () => {
        if ( activation ) {
            let direction = this.location === 'left' ? 'previous' : 'next';
            Bus.$emit( 'Book_blattern', direction );
            this.activator( false );
        }
    } );

}

// -- =====================================================================================

noNeedToAction () {

    let Book = ( this.$parent as Book );
    
    if ( Book.etikett.length -1 === Book.inx && this.location === "right" ) return true; 
    if ( Book.inx === 0 && this.location === "left" ) return true; 

    return false;

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .panel {
        font-size: 30;
        border-radius: 4;
        padding: 15;
        opacity: 0;
    }

    .left { text-align: left }
    .right { text-align: right }

</style>