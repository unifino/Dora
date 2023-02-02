<template>
<GridLayout 
    ref="sideBarBox"
    visibility="hidden"
    columns="25,auto,*,25" 
    rows="20*,auto,12*"
>

<!---------------------------------------------------------------------------------------->

    <GridLayout col=1 row=1 class="box" >

        <ScrollView orientation="vertical" >

            <StackLayout horizontalAlignment="center" >

                <nButton 
                    v-for="(button,i) in myButtons" 
                    :key="i+button.class"
                    :myClass="'sideButton fas ' + button.class"
                    :myLabel="String.fromCharCode( '0x' + button.icon )"
                    @tap=button.fnc
                />

            </StackLayout>

        </ScrollView>

    </GridLayout>

<!---------------------------------------------------------------------------------------->

    <StackLayout col=2 row=1 >

        <Label
            v-for="slot in mySlots"
            :key="slot.text"
            :text="slot.text"
            class="tarnationSlot"
            :fontFamily="slot.fontFace"
            :fontSize="slot.fontSize"
            textWrap="true"
        />

    </StackLayout>

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
// * tns plugin add nativescript-clipboard
import { setText }                      from "nativescript-clipboard"
import * as tools                       from "@/mixins/tools"
import YouTubePlayer                    from "@/components/ClassRoom/YouTubePlayer.vue"
import VideoPlayer                      from "@/components/ClassRoom/VideoPlayer.vue"

// -- =====================================================================================

interface mySlot { text: string, fontFace: string, fontSize: number };

@Component ( { 
    components: { nButton } 
} )

// -- =====================================================================================

export default class SideBar extends Vue {

// -- =====================================================================================

mySlots: { [key: string]: mySlot } = {};
translates: [ {}? ] = [];
playerModule: YouTubePlayer | VideoPlayer;

// -- =====================================================================================

buttons = [
                                                                                           
/* mark      */ { icon: 'f005', class: ''          , fnc: () => this.phrasedToggler()   } ,
/* translate */ { icon: 'f1ab', class: 'translate' , fnc: () => this.translate()        } ,
/* copy      */ { icon: 'f0c5', class: 'copy'      , fnc: () => this.copy()             } ,
                                                                                           
]

// -- =====================================================================================

get myButtons () {

    this.buttons[0].class = 'mark';
    for( let i of store.state.preserve.selected ) 
        if( store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ).content[i][1].phrased ) 
            this.buttons[0].class = 'marked'

    return this.buttons;

}

// -- =====================================================================================


init ( model: YouTubePlayer | VideoPlayer ) {
    ( this.$refs.sideBarBox as any ).nativeView.visibility = "visible";
    this.playerModule = model;
}

// -- =====================================================================================

phrasedToggler () {

    if ( !store.state.preserve.selected.length ) return 0;

    let subtitle = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ).content;

    for ( let i of store.state.preserve.selected ) {
        if ( subtitle[i][1].phrased ) delete subtitle[i][1].phrased;
        else subtitle[i][1].phrased = "blue";
    }

    // .. force re-rendering
    store.state.preserve.selected = [ ...store.state.preserve.selected ];

}

// -- =====================================================================================

translate () {

    if ( !store.state.preserve.selected.length ) return 0;

    this.playerModule.pause();

    this.mySlots = {};
    this.mySlots[ "fa" ] = {
        text: "Translating ...",
        fontFace: store.state.appConfig.fontFace,
        fontSize: store.state.appConfig.fontSize
    };

    let from = store.state.inHand.institute,
        subtitle = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ).content;

    let str = this.concat();
    let lastID = store.state.preserve.selected.length -1;
    let idx = store.state.preserve.selected[ lastID ];

    this.translationHandler( from, "fa", str );
    if ( from !== "en" ) this.translationHandler( from, "en", str );

}

// -- =====================================================================================

translationHandler ( from: string, to: string, str: string ) {

    let lastID = store.state.preserve.selected.length -1;
    let idx = store.state.preserve.selected[ lastID ];

    // .. touch slot in mySlots[]
    if ( typeof this.mySlots[ to ] === "undefined" ) this.mySlots[ to ] = {} as any;
    // .. touch slide in translates[]
    if ( typeof this.translates[ idx ] === "undefined" ) this.translates[ idx ] = {};

    // .. get translation
    if ( !this.translates[ idx ][ to ] ) {
        tools.translator( from, to, str  )
        .then( data => {
            this.mySlots[ to ].text = data;
            this.translates[ idx ][ to ] = data;
            this.clearTranslations();
            this.translationSlotManger();
        } )
        .catch( err => this.mySlots[ to ].text = err );
    }
    // .. set the already caught translation
    else this.mySlots[ to ].text = this.translates[ idx ][ to ];

    this.translationSlotManger();

}

// -- =====================================================================================

translationSlotManger () {

    let fontFace = store.state.appConfig.fontFace;
    let fontSize = store.state.appConfig.fontSize;

    Object.keys( this.mySlots ).forEach( key => {
        this.mySlots[ key ].fontFace = key === "fa" ? "Homa" : fontFace;
        this.mySlots[ key ].fontSize = key === "fa" ? fontSize -2.5 : fontSize;
    } );

    this.$forceUpdate();

}

// -- =====================================================================================

translate_TO: NodeJS.Timeout | any;
clearTranslations () {

    if ( this.translate_TO ) clearTimeout( this.translate_TO );

    this.translate_TO = setTimeout( () => {
        for ( let slot of Object.keys( this.mySlots ) ) {
            this.mySlots[ slot ].text = null;
        }
        this.$forceUpdate();
    } , 5000 );

}

// -- =====================================================================================

copy () {
    let str = this.concat();
    if ( str ) setText( str );
    tools.toaster( str ? 'Sentence has been copied!' : 'Nothing to copy!' );
}

// -- =====================================================================================

concat () {

    let str = "",
        subtitle = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ).content,
        c = 0;

    for ( let i of store.state.preserve.selected ) {
        str += subtitle[i][1].isBreakLine ? "\n" : subtitle[i][0];
        if ( c < store.state.preserve.selected.length -1 ) 
            if ( !subtitle[i][1].isBreakLine )
                str += " ";
        c++;
    }

    return str;

}

// -- =====================================================================================

destroyed () {
    if ( this.translate_TO ) clearTimeout( this.translate_TO );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .box {
        width: 50;
        height: 172;
        border-radius: 7;
        padding: 10 0;
    }

    .light .box { background-color: #3abedb }
    .dark  .box { background-color: #082c1e }
    
    .sideButton {
        vertical-align: center;
        font-size: 23px;
        text-align: center;
        padding: 12 0;
        margin: 0;
    }

    .light .mark { color: #606161; }
    .dark  .mark { color: #55544f; }

    .light .marked { color: #3d7e08; }
    .dark  .marked { color: #418630; }

    .translate { font-size: 21px }
    .light .translate  { color: #2a4e3d; }
    .dark  .translate  { color: #0d6892; }
    
    .light .copy { color: #2a4e3d; }
    .dark  .copy { color: #138fc9; }

/*                                          */

    .tarnationSlot {
        border-radius: 7;
        padding: 15 30;
    }

</style>