<template>
<AbsoluteLayout ref="wrapper" >

    <AbsoluteLayout ref="fixOne" height="100%" width="100%" >

        <GridLayout height="100%" width="100%" rows="20,*,auto,20" class="wall" ref="wall">

            <Image rowSpan=4 src="res://dora" width=165 stretch="aspectFit" />

            <GridLayout row=2 columns="30,auto,*,auto,30" class="fas myIcon" >
                <Label col=3 ref=icon1 :text="String.fromCharCode( '0x' + 'f0a0' )" />
                <Label col=1 ref=text1 class="savingText" text="Saving Data ..." />
                <!-- <Label col=1 ref=icon2 :text="String.fromCharCode( '0x' + 'f1c0' )" /> -->
            </GridLayout>

        </GridLayout>

    </AbsoluteLayout>

</AbsoluteLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import store                            from "@/mixins/store"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class Welcome extends Vue {

// -- =====================================================================================

mounted () {
    this.workingAnimator_1();
    // this.workingAnimator_2();
    Bus.$on( "Welcome_Slide", this.slide );
}

// -- =====================================================================================

randomData () {
    let time = Math.floor( ( Math.random() *700 ) +110 );
    let state = Math.floor( Math.random() *2 );
    let className = state ? "working" : "";
    return { className: className, time: time };
}

// -- =====================================================================================

icon1_TO: NodeJS.Timeout | any;
workingAnimator_1 () {

    if( this.icon1_TO ) clearTimeout( this.icon1_TO );

    let icon1 = ( this.$refs.icon1 as any ).nativeView;
    let randData = this.randomData();
    this.icon1_TO = setTimeout( () => { 
        icon1.className = randData.className;
        this.workingAnimator_1();
    }, randData.time );

}

// -- =====================================================================================

icon2_TO: NodeJS.Timeout | any;
workingAnimator_2 () {

    if( this.icon2_TO ) clearTimeout( this.icon2_TO );

    let icon2 = ( this.$refs.icon2 as any ).nativeView;
    let randData = this.randomData();
    this.icon2_TO = setTimeout( () => { 
        icon2.className = randData.className;
        this.workingAnimator_2();
    }, randData.time );
}

// -- =====================================================================================

slide ( enter: boolean ) {

    if ( enter ) {
        ( this.$refs.wall as any ).nativeView.visibility = "visible";
        ( this.$refs.text1 as any ).nativeView.visibility = "visible";
        store.state.here = "Entrance";
    }

    if( this.icon1_TO ) clearTimeout( this.icon1_TO );
    ( this.$refs.icon1 as any ).nativeView.className = "";
    // if( this.icon2_TO ) clearTimeout( this.icon2_TO );
    // ( this.$refs.icon2 as any ).nativeView.className = "";

    let sizes = ( this.$refs.fixOne as any ).nativeView.getActualSize();

    ( this.$refs.fixOne as any ).nativeView.width = sizes.width;
    ( this.$refs.fixOne as any ).nativeView.height = sizes.height;

    let x_def: NS.AnimationDefinition = {};

    x_def.target = ( this.$refs.wrapper as any ).nativeView;
    x_def.translate = { x: enter ? 0 : -sizes.width/2, y: 0 }
    x_def.curve = NS.Enums.AnimationCurve.easeInOut;
    x_def.width = enter ? "100%" : 1;
    x_def.delay = enter ? 0 : 300;
    x_def.duration = 400;

    let wallAnimation = new NS.Animation( [ x_def ], false );

    wallAnimation.play().then( () => {
        if ( !enter ) ( this.$refs.wall as any ).nativeView.visibility = "collapsed";
    } );

}

// -- =====================================================================================

destroyed () {
    Bus.$off( "Welcome_Slide" );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .light .wall { background-color: #135f82 }
    .light .wall { background-color: #000000 }
    .dark  .wall { background-color: #000000 }

    .myIcon { font-size: 30px }

    .light .myIcon { color: #276783 }
    .dark  .myIcon { color: #141414 }

    .light .working { color: #073f58 }
    .dark  .working { color: #083142 }

    .savingText {
        font-size: 19;
        vertical-align: middle;
        visibility: collapse;
        font-family: Dosis-Regular;
        color: rgb(73, 73, 73);
    }

</style>