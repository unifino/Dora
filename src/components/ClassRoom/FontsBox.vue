<template>
<GridLayout class="fontsBox" rows="*,*,*" columns="15,60,*,60,15" ref="fontsBox" >
        
    <nButton
     row=1
     col=1
     :visibility="isItemVisible ? 'visible' : 'collapsed'"
     :myLabel="String.fromCharCode( '0x' + 'f00d' )"
     myClass="fas confirmButton"
     @tap="confirm(false)"
    />

    <nButton
     row=1
     col=3
     :visibility="isItemVisible ? 'visible' : 'collapsed'"
     :myLabel="String.fromCharCode( '0x' + 'f00c' )"
     myClass="fas confirmButton"
     @tap="confirm(true)"
    />

<!---------------------------------------------------------------------------------------->

    <GridLayout row=1 col=2 columns="auto,*,auto" class="fontRow" >
        
        <nButton
         col=0
         :myLabel="String.fromCharCode( '0x' + 'f068' )"
         myClass="fas sizeButton"
         @tap="changeSize( 'less' )"
        />

        <GridLayout col=1 @tap="fontActivation(true)">
            <Label class="centeredText" :text="$store.state.appConfig.fontSize"/> 
        </GridLayout>

        <nButton
         col=2
         :myLabel="String.fromCharCode( '0x' + '2b' )"
         myClass="fas sizeButton"
         @tap="changeSize( 'more' )"
        />

    </GridLayout>

<!---------------------------------------------------------------------------------------->

    <GridLayout row=2 col=1 colSpan=3 columns="auto,*,auto" class="fontRow" >
        
        <nButton
         col=0
         :myLabel="String.fromCharCode( '0x' + 'f104' )"
         myClass="fas arrowButton"
         @tap="changeOption( 'previous' )"
        />

        <GridLayout col=1 @tap="fontActivation(true)">
            <Label
             v-for="opt of optionsToPresent"
             :key=opt.name
             ref="slide"
             :class="'centeredText ' + ( opt.inHand ? 'inHand' : 'away' ) + ( opt.active ? ' active' : '' ) "
              :text="'  ' + opt.name + '  '"
             :fontFamily="opt.code"
            /> 
        </GridLayout>

        <nButton
         col=2
         :myLabel="String.fromCharCode( '0x' + 'f105' )"
         myClass="fas arrowButton"
         @tap="changeOption( 'next' )"
        />

    </GridLayout>

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
import { allFonts }                     from "@/mixins/fonts"
import nButton                          from "@/components/tools/n_Button.vue"
import * as tools                       from "@/mixins/tools"
import * as storage                     from "@/mixins/storageHandler"
import MiniMenu                         from '@/components/ClassRoom/MiniMenu.vue'
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( { 
    components: { nButton } 
} )

// -- =====================================================================================

export default class FontsBox extends Vue {

// -- =====================================================================================

get optionsToPresent () {

    this.inHand = 0;
    this.allOptions[0].active = this.allOptions[0].inHand = true;

    if ( !store.state.appConfig.fontFace ) return this.allOptions;
    
    let selectedFont = store.state.appConfig.fontFace;

    for ( let font of this.allOptions ) {
        if ( font.code === selectedFont ) font.active = font.inHand = true;
        else font.active = font.inHand = false;
    }

    this.inHand = this.allOptions.findIndex( row => row.inHand );

    return this.allOptions;

}

// -- =====================================================================================

inHand: number;
allOptions = allFonts.map( font => { return { ...font, active: false, inHand: false } } );

// ! bad practice ...
get isItemVisible () {
    return true;
}

// -- =====================================================================================

mounted () {

    let fontsBox = ( this.$refs.fontsBox as any ).nativeView; 
    let bgColor = store.state.darkMode ? 'rgba(46, 172, 201, 0)' : 'rgba(4, 58, 58, 0)';
    fontsBox.translateX = 0;
    fontsBox.translateY = 180;
    fontsBox.opacity = 0;

}

// -- =====================================================================================

pallet_animation;
pallet ( show=false ) {

    Bus.$emit( 'Indicator_visibility', !show );

    // ! bad practice ...
    if ( !show && this.isItemVisible ) Bus.$emit( "MiniMenu_MiniMenu", 300 , "down" );

    if ( this.pallet_animation ) this.pallet_animation.cancel();

    let fontsBox = ( this.$refs.fontsBox as any ).nativeView; 
    let o_def: NS.AnimationDefinition = {};

    o_def.target    = fontsBox;
    o_def.duration  = 300;
    o_def.translate = { x:0, y: show ? 0 : 180 };
    o_def.opacity   = show ? 1 : 0;

    this.pallet_animation = new NS.Animation( [ o_def ], false );
    this.pallet_animation.play();

}

// -- =====================================================================================

confirm ( state: boolean ) {

    // .. Hard Registration
    if ( state ) storage.saveAppConfig();

    // .. reset FontFace & FontSize
    else {
        storage.readAppConfig().then( appConfig => {

            // .. reset position
            this.$refs.slide[ this.inHand ].nativeView.translateX = -180;

            store.state.appConfig.fontFace = appConfig.fontFace;
            store.state.appConfig.fontSize = appConfig.fontSize;

            // .. reset position
            this.inHand = allFonts.findIndex( row => row.code === appConfig.fontFace );
            this.$refs.slide[ this.inHand ].nativeView.translateX = 0;

        } );
    }

    // .. hide the pallet
    this.pallet( false );

}

// -- =====================================================================================

changeOption ( direction: "previous"|"next" ){
    let length = this.optionsToPresent.length;
    this.inHand = tools.changeOption( direction, length, this.$refs, this.inHand );
    this.fontActivation();
}

// -- =====================================================================================

changeSize ( step: "less"|"more" ) {
    store.state.appConfig.fontSize += step === "less" ? -.5 : +.5;
    this.allOptions[ this.inHand ].defaultSize = store.state.appConfig.fontSize;
}

// -- =====================================================================================

fontActivation ( hardRegistration = false ) {
    
    for ( let font of this.allOptions ) {
        font.active = false;
        font.inHand = false;
    }

    this.allOptions[ this.inHand ].active = true;
    this.allOptions[ this.inHand ].inHand = true;
    store.state.appConfig.fontSize = this.allOptions[ this.inHand ].defaultSize;
    store.state.appConfig.fontFace = this.allOptions[ this.inHand ].code;

    if ( hardRegistration ) storage.saveAppConfig();

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>
/*                                          */
    .fontRow{
        height: 40;
        border-radius: 7;
        font-size: 15px;
        width: 180;
    }

    .light .fontRow { background-color: #2eacc9; color: white }
    .dark  .fontRow { background-color: #043a3a; color: #d4d4d4 }

    .away { transform: translateX( -170 ) }

</style>