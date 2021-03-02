<template>
<GridLayout 
    ref="bookCover" 
    class="bookCover" 
    rows="*,auto,*" 
    columns="50,*,50" 
    @swipe="swipeControl"
>

<!--                                                                                    -->

    <GridLayout row=1 col=1 class="pagesBox" >
        <WrapLayout 
            ref="page" 
            orientation="vertical"
            v-for="(slide,x) in slideBox" 
            :key="x"
            :translateX="x===inx ? 0 : $store.state.windowSize.width"
        >

            <WrapLayout orientation="vertical" v-for="(c,y) in slide" :key=y >

<!--                                                                                    -->

                <Image v-if="c[1].isURL" :src="c[0]+''" class="pic" />
                <StackLayout v-else-if="c[1].isBreakLine" class="divider" />
                <Label v-else :text="c[0]" textWrap="true" />

<!--                                                                                    -->

            </WrapLayout>

        </WrapLayout>
    </GridLayout>

<!--                                                                                    -->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop, Ref }    from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import nWord                            from "@/components/tools/n_Word.vue"
import * as tools                       from "@/mixins/tools"
import MiniMenu                         from "@/components/ClassRoom/MiniMenu.vue"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

interface card {
    type: "Text" | "Image",
    value: string
};

@Component ( { 
    components: { nWord } 
} )

// -- =====================================================================================

export default class Book extends Vue {

// -- =====================================================================================

dText: TS.Organelle;
slideBox: TS.UniText[][] = [];
slidesInHand: number[] = [];
inx: number = -1;
// dots = 0;
exitPermission = false;
maxAttempt = 100;
etikett: number[];

// -- =====================================================================================

mounted () {

    Bus.$on( 'Book_blattern', this.blattern );

    store.watch(
        state => state.mode, 
        newVal => this.bookCoverPainter( newVal )
    );

}

// -- =====================================================================================

init ( dText: TS.Organelle, etikett: number[], bookmark: number ) {

    ( this.$refs.bookCover as any ).nativeView.visibility = "visible";
    this.dText = dText;
    this.etikett = etikett;
    // this.dots = ( this.etikett ).length;

    this.slidesGenerator();

}

// -- =====================================================================================

async slidesGenerator () {

    let slide: TS.UniText[];
    this.slideBox = [];

    this.etikett.unshift( -1 );

    for ( let i=0; i < this.etikett.length -1; i++ ) {
        slide = [];
        for ( let j = this.etikett[i]+1; j < this.etikett[i+1]; j++ ) {
            slide.push( this.dText.content[j] );
        }
        this.slideBox.push( slide );
    }

    this.etikett.shift();

    this.inx = 0;

}

// -- =====================================================================================

async swipeControl ( args: NS.SwipeGestureEventData ) {

    // TODO animation cause problem in Editing Mode
    if ( store.state.mode === "editing" ) return 0;

    Bus.$emit( "ToolBar_Fade", 0, false, false, 150 )

    if ( store.state.mode === "snapping" ) Bus.$emit( "ToolBar_Snap", false );

    await new Promise( _ => setTimeout( _ , 0 ) );

    let d = args.direction;
    if ( d === NS.SwipeDirection.left ) this.blattern( "next" );
    if ( d === NS.SwipeDirection.right ) this.blattern( "previous" );

}

// -- =====================================================================================

exit_TO;
blattern ( direction: "previous"|"next" ) {

    // .. exit checking
    if ( this.exitCtl( direction ) ) return 0;

    let wasOnX = this.inx,
        lesson = store.state.inHand.lesson;

    // .. blattern data
    switch ( direction ) {

        case 'next':
            if ( this.inx < this.etikett.length -1 ) this.inx++;
            else {
                let msg = '❖  THE END.  ❖';
                if ( lesson.chromosome.status === "reading" ) {
                    msg += '\n\nYou can confirm it as "Read"!'
                    let miniMenu = this.$parent.$parent.$refs.miniMenu as MiniMenu;
                    miniMenu.miniMenu( 400, "up" );
                }
                tools.toaster( msg );
            };
            break;

        case 'previous':
            if ( this.inx > 0 ) this.inx--;
            else tools.toaster( '❖  ' + lesson.chromosome.title + '  ❖' );
            break;

    }

    this.jumpTo( this.inx );

    // .. blattern animation
    if ( wasOnX !== this.inx ) {

        let directionFactor = direction == "next" ? 1 : -1;
        let travel = ( this.$refs.bookCover as any ).nativeView.getActualSize().width;

        this.$refs.page[ wasOnX ].nativeView.animate( { 
            translate: { x: -1* travel *directionFactor, y: 0 } ,
        } );
        this.$refs.page[ this.inx ].nativeView.animate( { 
            translate: { x: travel *directionFactor, y: 0 } ,
            duration: 0
        } );
        this.$refs.page[ this.inx ].nativeView.animate( { 
            translate: { x: 0, y: 0 } ,
        } );

    }

}

// -- =====================================================================================

jumpTo ( idx ) {

    this.inx = idx;

    this.slidesInHand = [ ...this.slidesInHand, this.inx ];
    this.slidesInHand = [ ...new Set( this.slidesInHand ) ];

    ( this.$refs.indicator as any ).currentIndex = this.inx +1;

    // .. page caching
    setTimeout( () => {
        this.slidesInHand.push( this.inx -1, this.inx +1 );
        // this.bookPublisher();
    } , 350 );

    // .. soft registration
    this.dText.pinnedPoint = this.inx;

}

// -- =====================================================================================

exitCtl ( direction ) {

    if ( this.inx === 0 && direction === "previous" ) {

        if ( this.exitPermission ) {
            setTimeout( () => ( this as any ).$navigateBack() , 100 );
            return true;
        } else {
            this.exitPermission = true;
            this.exit_TO = setTimeout ( () => this.exitPermission = false , 1400 );
        }

    }
    else if ( this.inx !== 0 ) {
        clearTimeout ( this.exit_TO );
        this.exitPermission = false;
    }

    return false;

}

// -- =====================================================================================

bookCover_Animation;
bookCoverPainter ( mode: TS.AppMode ) {

    // .. bug resolver
    if ( !this.$refs.bookCover ) return 0;

    let theColor = { light: "#00000000", dark: "#00000000" } ;
    let bookCover = ( this.$refs.bookCover as any ).nativeView;

    // TODO colors should be defined upon themes
    switch ( mode ) {
        case "reading"  : theColor = theColor;                              break;
        case "binding"  : theColor = { light: "#e64b0d", dark: "#4b0e0e" }; break;
        case "editing"  : theColor = { light: "#a6aced", dark: "#38393d" }; break;
        case "snapping" : theColor = { light: "#cae6e6", dark: "#0c4553" }; break;
    }
    
    if ( this.bookCover_Animation ) this.bookCover_Animation.cancel();

    let isDark = store.state.darkMode,
        newColor = isDark ? theColor.dark : theColor.light,
        newClass = "bookCover " + mode,
        duration = mode === "reading" ? 500 : 300,
        x_def: NS.AnimationDefinition = {};
    
    bookCover.className = newClass;

    x_def.target = bookCover;
    x_def.curve = NS.Enums.AnimationCurve.ease;
    x_def.backgroundColor = new NS.Color( newColor );
    x_def.duration = duration;
    x_def.delay = 100;
    this.bookCover_Animation = new NS.Animation( [ x_def ], false );
    this.bookCover_Animation.play();

}

// -- =====================================================================================

as
// -- =====================================================================================

beforeDestroy() {
    store.state.preserve.selected = [];
}

// -- =====================================================================================

destroyed () {
    Bus.$off( 'Book_selecting' );
    Bus.$off( 'Book_blattern' );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .bookCover {
        background-color: transparent;
        width: auto;
        color: #38393d;
    }

    .pagesBox {
        width: 95%;
        height: 95%;
    }

    .divider {
        height: 1;
        width: 100%;
        background-color: #38393d;
        margin: 25 0;
    }

    .pic {
        margin: 10 0;
    }

</style>