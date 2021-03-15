<template>
<GridLayout columns="40,auto,*" rows="70,auto,*" >

    <GridLayout columns="100,40" ref="panel" row=1 col=1 id="downloading" >
        <Label col=0 :text="text" />
        <Label col=1 :text="icon" class="far icon" />
    </GridLayout>
    
        
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
    components: {} 
} )

// -- =====================================================================================

export default class Gear extends Vue {

text = "Downloading ";
icon = "";

// -- =====================================================================================

mounted () {
    let panel = ( this.$refs.panel as any ).nativeView;
    panel.width = 1;
    panel.visibility = "collapsed";

    Bus.$on( "Downloading_Panel", this.panel );
}

// -- =====================================================================================

visibility_TO: NodeJS.Timeout | any;
panel_Animation: NS.Animation;
panel ( state: "start"|"stop", waiting=5000 ) {

    if ( this.visibility_TO ) clearTimeout( this.visibility_TO );

    let panel = ( this.$refs.panel as any ).nativeView; 

    if ( state === "start" ) 
        this.visibility_TO = setTimeout( () => panel.visibility = "visible", waiting );
    if ( state === "stop" )
        this.textCtr( "stop" );

    let x_def: NS.AnimationDefinition = {};

    x_def.width = state === "start" ? 140 : 1;
    x_def.delay = state === "start" ? waiting+250 : waiting/4;
    x_def.curve = NS.Enums.AnimationCurve.ease;
    x_def.duration = 430;
    
    x_def.target = panel;

    this.panel_Animation = new NS.Animation( [ x_def ], false );
    this.panel_Animation.play().then( () => { 
        if ( state === "start" ) this.textCtr( "start" );
        if ( state === "stop" ) panel.visibility = "collapsed";
    } );

}

// -- =====================================================================================

textCtr_TO: NodeJS.Timeout | any;
textCtr ( state: "start"|"running"|"stop"|"reset" ) {

    // if ( this.textCtr_TO ) clearTimeout( this.textCtr_TO );

    // if ( state === "reset" ) {
    //     this.text = "Downloading ";
    //     this.icon = "";
    //     return 0;
    // }

    // if ( state === "start"  )   this.text = "Downloading ";
    // if ( state === "running")   this.text += ".";
    // if ( state === "stop"   )   this.text = "Downloaded!";

    // this.icon = state === "stop" ? String.fromCharCode( 0xf058 ) : null;

    // this.text = this.text.replace( "....", "" );

    // if ( state !== "stop" ) 
    //     this.textCtr_TO = setTimeout( () => this.textCtr( "running" ), 1200 );
    // else 
    //     this.textCtr_TO = setTimeout( () => this.textCtr( "reset" ), 2000 );

}

// -- =====================================================================================

destroyed () {
    Bus.$off( "Downloading_Panel" );
    if ( this.textCtr_TO ) clearTimeout( this.textCtr_TO );
    if ( this.visibility_TO ) clearTimeout( this.visibility_TO );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    #downloading {
        text-align: left;
        font-size: 14;
        width: 140;
        height: 37;
        border-radius: 4;
        padding: 8 12 0 12;
    }

    .light #downloading { background-color: green; color: #8eb435 }
    .dark  #downloading { background-color: #0e303a; color: #6b6b6b }

    .icon {
        font-size: 16;
        padding-top: 2;
        text-align: left;
    }

</style>