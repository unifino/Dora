<template>
<Page @swipe="swipeControl" @navigatedTo="$store.state.here='Salon_F'">
<GridLayout>

<!---------------------------------------------------------------------------------------->

    <Label
        :visibility="isWaiting ? 'visible' : 'collapsed'"
        class="waitingCurtain"
        text="Calculating ..."
    />

<!---------------------------------------------------------------------------------------->

    <FlashCardMenu @sort-toggler="sortToggler" :sortPhase="sortPhase" ref="myMenu" />

<!---------------------------------------------------------------------------------------->

    <GridLayout :visibility="!isWaiting ? 'visible' : 'hidden'" rows="*,auto,*">
        <Frame row=1 id="flashcardsRail" ><Page /></Frame>
    </GridLayout>

<!---------------------------------------------------------------------------------------->

</GridLayout>
</Page>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import * as tools                       from "@/mixins/tools"
import * as storage                     from "@/mixins/storageHandler"
import FlashCard                        from "@/components/Salon/F/FlashCard.vue"
import FlashCardMenu                    from "@/components/Salon/F/FlashCard_Menu.vue"
import * as tnsPLY                      from "@/mixins/audioPlayer"
import Bus                              from "@/mixins/bus"
import Scope                            from "@/components/Scope/Scope.vue"

// -- =====================================================================================

@Component ( {
    components: { FlashCard, FlashCardMenu }
} )

// -- =====================================================================================

export default class Salon_F extends Vue {

// -- =====================================================================================

sortPhase: { code:TS.SortPhase, name: string } = {
    code: store.state.appConfig.sortCode ,
    name: TS.SortPhase[ store.state.appConfig.sortCode ]
};

myVIP: TS.VIPSentence = [ "No more sentences.", { isFake: true } as any ];
myTraces: number[];
myTracePointer: number;
activeId: number;
isWaiting = false;
ready = false;

// -- =====================================================================================

mounted () { 
    this.doorCtl( "open" );
    Bus.$on( "Salon_F_Exit", () => this.backOrExit() );
}

// -- =====================================================================================

backOrExit () {
    if ( store.state.scopeIsActive ) Bus.$emit( "Scope_DeskCtl", "down" );
    else storage.saveFlashCards().finally( () => ( this as any ).$navigateBack() );
}

// -- =====================================================================================

init_TO: NodeJS.Timeout | any;
init () {

    if ( this.init_TO ) clearTimeout( this.init_TO );

    if ( store.state.needCalculation ) this.init_TO = setTimeout( () => this.init() , 10 );
    else {
        this.activeId = null;
        this.myTraces = [];
        this.myTracePointer = -1;
        this.nextSlide();
    }

}

// -- =====================================================================================

doorCtl ( act: 'open' | 'close' ) {

    let place = this.$root.$children[0].$refs.salon_F;

    let callBack = () => {
        if ( act === "open" ) {
            this.init();
            this.dataChangingController();
            ( this.$refs.myMenu as FlashCardMenu ).wakeUp( 900 );
        }
    };

    tools.doorRemote( "Salon_F", place, act, callBack );

}

// -- =====================================================================================

dataChangingController () {

    store.watch(

        state => store.state.needCalculation ,
        newVal => {
            this.isWaiting = newVal;
            if ( this.isWaiting ) this.myUIRefresher();
        },

    );

}

// -- =====================================================================================

myUIRefresher_TO: NodeJS.Timeout | any;
myUIRefresher () {

    if ( this.myUIRefresher_TO ) clearTimeout( this.myUIRefresher_TO );

    // .. stop it if we will not return back to it from a Lesson
    if ( store.state.here === "Institute" ) return 0;

    if ( store.state.here === "Salon_F" ) this.init();
    else this.myUIRefresher_TO = setTimeout( () => this.myUIRefresher() , 100 );

}

// -- =====================================================================================

swipeControl ( args: NS.SwipeGestureEventData ) {

    if ( this.end_TO ) clearTimeout( this.end_TO );

    if ( args.direction === NS.SwipeDirection.left ) this.nextSlide();
    if ( args.direction === NS.SwipeDirection.right ) this.previousSlide();

}

// -- =====================================================================================

sortToggler () {

    let modes = Object.keys( TS.SortPhase ).length / 2;

    let nextMode = ( this.sortPhase.code +1 ) % modes;

    this.sortPhase = {
        code: TS.SortPhase[ TS.SortPhase[ nextMode ] ],
        name: TS.SortPhase[ nextMode ] 
    };

    // .. register data
    store.state.appConfig.sortCode = this.sortPhase.code;

}

// -- =====================================================================================

end_TO
async nextSlide () {

    // .. prevent to action
    if ( ( this.$root.$children[0].$refs.scope as Scope ).isDragging ) return 0;

    // TODO lesson should be checked before this, maybe it would be corrupted

    let myActiveBox = store.state.activeBox[ store.state.inHand.institute ];

    // .. no Action
    if ( this.myTracePointer === this.myTraces.length ) return 0;

    // .. pointer is at the End
    if ( this.myTraces.length -1 === this.myTracePointer ) {

        // .. all sentences has been presented.
        if ( this.myTraces.length === myActiveBox.length ) {
            this.myVIP = [ "The End.", { isFake: true } as any ];
            this.end_TO = setTimeout( () => ( this as any ).$navigateBack(), 1600 );
        }

        else await this.oneSentence().then( _ => this.myTraces.push( this.activeId ) );

    }

    // .. pointer is not at the End
    else {
        this.activeId = this.myTraces[ this.myTracePointer +1 ];
        this.myVIP = store.state.activeBox[ store.state.inHand.institute ][ this.activeId ];
    }

    this.headToFlashCard( "slideLeft" );
    this.myTracePointer++;

}

// -- =====================================================================================

async previousSlide () {

    if ( this.myTracePointer > 0 ) {
        this.activeId = this.myTraces[ this.myTracePointer -1 ];
        this.myVIP = store.state.activeBox[ store.state.inHand.institute ][ this.activeId ];
        this.headToFlashCard( "slideRight" );
        this.myTracePointer--;
    }

}

// -- =====================================================================================

async headToFlashCard( direction: "slideRight" | "slideLeft" ) {

    if ( !this.myVIP[1].isFake ) await storage.organellesLoader( this.myVIP[1].lesson );

    Vue.prototype.$navigateTo( FlashCard, { 
        frame : 'flashcardsRail' ,
        backstackVisible : true ,
        transition : {
            name         : direction,
            duration     : 300 ,
        } ,
        props: {
            VIPSentence: this.myVIP,
            nextSlide: this.nextSlide,
        }
    } );

}

// -- =====================================================================================

async oneSentence () {

    // .. reset Values and settings
    tnsPLY.stop();

    this.myVIP = [ "Searching ...", { isFake: true } as any ];

    let myId: number ,
        min: number = -1 ,
        max: number = store.state.activeBox[ store.state.inHand.institute ].length ;

    do { switch ( this.sortPhase.code ) {

        // .. priority by Random
        case TS.SortPhase.Random: myId = max*Math.random()<<0; break;
        // .. priority by Long Sentences
        case TS.SortPhase.Long: myId = --max; break;
        // .. priority by Short Sentences
        case TS.SortPhase.Short: myId = ++min; break;

    } } while ( this.myTraces.includes( myId ) );

    // .. register this Id
    this.activeId = myId;
    this.myVIP = store.state.activeBox[ store.state.inHand.institute ][ myId ];

}

// -- =====================================================================================

exit () {
    ( this as any ).$navigateBack();
}

// -- =====================================================================================

beforeDestroy () {
    if ( this.end_TO ) clearTimeout( this.end_TO );
    if ( this.init_TO ) clearTimeout( this.init_TO );
    if ( this.myUIRefresher_TO ) clearTimeout( this.myUIRefresher_TO );
    store.state.preserve.flash = [];
    this.doorCtl( "close" );
    store.state.here = "Institute";
    tnsPLY.stopAt(0);
    tnsPLY.playerOptions.audioFile = null;
    tools.lessonUnloader();
}

// -- =====================================================================================

destroyed () {
    Bus.$off( "Salon_F_Exit" );
    tools.dAO( store.state.inHand.institute );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .section {
        border-width: 1 0 0 0;
        border-color: rgb(87, 87, 87);
        padding: 20 0;
    }

    .waitingCurtain {
        text-align: center;
        vertical-align: middle;
        font-size: 17px;
        font-family: Raleway-Regular;
        letter-spacing: .3;
    }

    #flashcardsRail {
        width: 510;
    }

</style>