<template>

    <TextField
        v-if=editMode
        ref="nEdit"
        color="#069106"
        :text=myText
        :class=properClass
        :fontFamily="$store.state.appConfig.fontFace"
        :fontSize="$store.state.appConfig.fontSize"
        @returnPress="onReturnPress( $event )"
    />

    <Label 
        v-else-if="activeDoubleTap"
        ref="nWord"
        :class=properClass
        :text=myText
        :refId=refId
        :fontFamily="$store.state.appConfig.fontFace"
        :fontSize="$store.state.appConfig.fontSize"
        @touch=wordTouched
        @longPress=myLongPress
        @tap=myTap
        @doubleTap=myDoubleTap
    />

    <Label
        v-else
        ref="nWord"
        :class=properClass
        :text=myText
        :refId=refId
        :fontFamily="$store.state.appConfig.fontFace"
        :fontSize="$store.state.appConfig.fontSize"
        @touch=wordTouched
        @longPress=myLongPress
        @tap=myTap
    />

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import store                            from "@/mixins/store"
import * as tools                       from "@/mixins/tools"
import Bus                              from "@/mixins/bus"
import PageMargin                       from "@/components/ClassRoom/Books/PageMargin.vue"
import * as tnsPLY                      from "@/mixins/audioPlayer"

// -- =====================================================================================

@Component

// -- =====================================================================================

export default class n_Word extends Vue {

// -- =====================================================================================

@Prop() myText;
@Prop() myClass;
@Prop() refId;
@Prop() autoTranslate;
@Prop() editMode;
@Prop() activeDoubleTap;

// -- =====================================================================================

get properClass () {

    let classPlus = this.myClass;

    if ( store.state.preserve.selected.includes( this.refId ) ) classPlus += " selected";
    if ( store.state.preserve.flash.includes( this.refId ) ) classPlus += " flash";

    return classPlus;

}

// -- =====================================================================================

end = -1;
itMoved = false;
moveStartAt: number;

// -- =====================================================================================

wordTouched ( args ) {

    // .. press effect
    if ( args.action === "down" ) args.object.className += " pressed";
    if ( args.action === "up"   ) args.object.className = this.properClass;

    if ( store.state.here !== "ClassRoom" ) return 0;

    // .. ClassRoom actions
    switch ( args.action ) {

        case "move":
            this.itMoved = true;
            if ( ( store.state.mode === "reading" || store.state.mode === "selective" ) )
                this.moveCtl( args );
            break;

        case "up":
            args.object.className = args.object.className.replace( " warmingUp", "" );
            let passedTime = new Date().getTime() - this.moveStartAt;
            if ( this.itMoved && passedTime > 300 ) Bus.$emit( 'Book_selecting', false );
            this.itMoved = false;
            this.moveStartAt = 0;
            // ! checkkkk
            // ( this.$parent.$refs.pageMarginLeft as PageMargin ).activator( false );
            // ( this.$parent.$refs.pageMarginRight as PageMargin ).activator( false );
            break;

    }

}

// -- =====================================================================================

moveCtl ( args ) {

    // .. new Movement has been started
    if ( !this.moveStartAt ) {
        store.state.preserve.selected = [];
        args.view.className += " warmingUp";
        this.moveStartAt = new Date().getTime();
    }

    // ..Movement need more time
    if ( new Date().getTime() - this.moveStartAt < 300 ) return 0;

    // .. initial Point of Movement Registration
    if ( !store.state.preserve.selected.length ) {
        store.state.preserve.selected = [ args.object.refId ];
        Bus.$emit( 'Book_selecting', true );
    }

    // .. checking Pointer Position
    this.hoverOnWord( args );
    this.hoverOnPageMargin( args, this.$parent.$refs.pageMarginLeft as PageMargin );
    this.hoverOnPageMargin( args, this.$parent.$refs.pageMarginRight as PageMargin );

}

// -- =====================================================================================

hoverOnWord ( args ) {

    let el,
        p_pos = { 
            x: args.view.getLocationInWindow().x + args.getX(),
            y: args.view.getLocationInWindow().y + args.getY()
        },
        a: number,
        b: number;

    ( Object.keys( this.$parent.$refs ) as any ).some( i_ref => {

        if ( i_ref.includes( "word_" ) ) {

            el = this.$parent.$refs[ i_ref ][0].nativeView;

            if ( this.isOnIt( el.getLocationInWindow(), p_pos, el.getActualSize() ) ) {

                this.end = el.refId;

                a = args.object.refId;
                b = el.refId;
                // .. exchange variables
                if ( a > b ) { b = a; a = el.refId; }

                store.state.preserve.selected = [];
                for ( let i=a; i<=b; i++ ) store.state.preserve.selected.push(i);

                return true;

            }

        }

    } );

}

// -- =====================================================================================

hoverOnPageMargin ( args, margin: PageMargin ) {

    let el = ( margin as any ).nativeView ,
        p_pos = { 
            x: args.view.getLocationInWindow().x + args.getX(),
            y: args.view.getLocationInWindow().y + args.getY()
        };

    let action = this.isOnIt( el.getLocationInWindow(), p_pos, el.getActualSize() );

    // ! CHECKKKK
    margin.activator ( action );

}

// -- =====================================================================================

isOnIt (
    i_pos: { x     : number, y      : number },
    p_pos: { x     : number, y      : number },
    size : { width : number, height : number }
) {

    let isOnIt = (
        i_pos.x <= p_pos.x              &&
        p_pos.x <= i_pos.x + size.width &&

        i_pos.y <= p_pos.y              &&
        p_pos.y <= i_pos.y + size.height  
    );

    return isOnIt;

}

// -- =====================================================================================

myTap ( args ) {
    // .. register real-currentTime - first
    store.state.realCurrentTime = tnsPLY.getCurrentTime();
    // .. register tap action - second
    this.$emit( 'myTap' , args );
    if ( this.autoTranslate && this.myText ) this.miniTranslator( this.myText );
}

// -- =====================================================================================

myDoubleTap ( args ) {
    this.$emit( 'myDoubleTap' , args );
}

// -- =====================================================================================

myLongPress ( args ) {
    this.$emit( 'myLongPress', args );
}

// -- =====================================================================================

miniTranslator ( word: string = this.myText ){

    // .. find the word in the glossar
    let ins = store.state.inHand.institute;
    let uon = tools.deepSearch ( word , store.state.glssDB[ ins ] );

    // .. it has been found!
    if ( uon ) {

        let dic = store.state.appConfig.dictionaries,
            uin = store.state.glssDB[ ins ][ uon ];

        // .. some dic has data
        if ( uin[ dic[0] ] || uin[ dic[1] ] ) {
            let space = uin[ dic[0] ] && uin[ dic[1] ] ? "  🍏  " : "";
            tools.toaster( ( uin[ dic[0] ] || "" ) + space + ( uin[ dic[1] ] || "" ) );
        }
        else tools.toaster( "..." );

    }
    else tools.toaster( "Err: Contact Developer!" );

}

// -- =====================================================================================

onReturnPress( args ) {
    this.$emit( 'newText', this.refId, args.object.text );
}

// -- =====================================================================================

setFocus () {

    this.editMode = true;

    if ( typeof this.$refs.nEdit === "undefined" ) setTimeout( () => this.setFocus(), 10 );
    else ( this.$refs.nEdit as any ).nativeView.focus();

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .parole { padding: 2 }

    .light .parole { color: #0c0c08 }
    .dark  .parole { color: #adac9f }

/*                                          */

    .word {
        width:auto;
        padding: 4 2;
        border-radius: 0;
        border-width: 1;
        margin: 1;
        android-elevation: 0;
    }

    .light .word{
        color: #04131f;
        border-color: transparent;
        background-color: transparent;
    }

    .dark .word{
        color: #f8f1e8;
        border-color: transparent;
        background-color: transparent;
    }
    
    .breakLine {
        width: 98%; 
        padding: 4 2;
        margin: 1;
        opacity: 0;
    }

/*                                          */

    .light .b { color: #0099ff; }
    .dark  .b { color: #557b94; }

    .light .g { color: #069106; }
    .dark  .g { color: #069106; }

    .light .r { color: #9c0a42; }
    .dark  .r { color: #9c0a42; }

/*                                          */

    .phrase { text-decoration: underline }
    .light .phrase { color: #13a0b9 }
    .dark  .phrase { color: #68a8ea }

    .light .red { color: #d14217 }
    .dark  .red { color: #d14217 }

    .light .marked { color: #7fbd1b }
    .dark  .marked { color: #a7ca11 }

    .new { border-radius: 5 }
    .light .new { border-color: rgba(139, 177, 214, 0.336) }
    .dark  .new { border-color: rgba(50, 125, 200, 0.14) }

    .bind { border-radius: 5 }
    .light .bind { border-color: #b30e97 }
    .dark  .bind { border-color: brown }

/*                                          */

    .pressed {
        font-weight: bold;
        border-radius: 4;
    }

    .light .pressed {
        color: #000000;
        border-color: #929497;
    }

    .dark .pressed {
        color: #e4e4e4;
        border-color: #929497;
    }

    .hidden {
        width: 0;
        height: 0;
        padding: 0;
        border-width: 0;
        margin: 0;
    }

    .deleted {
        text-decoration: line-through;
        border-radius: 4;
        opacity: .4;
    }

    .light .deleted {
        background-color: rgb(255, 255, 255);
        color: gray;
    }

    .dark .deleted {
        background-color: black;
        color: gray;
    }

/*                                          */

    .selected { border-radius: 4 }

    .light .selected {
        border-color: #58bed8;
        background-color: #58bed8;
        color: white;
    }

    .dark .selected {
        border-color: #0882a0;
        background-color: #0882a0;
        color: white;
    }

/*                                          */

    .binding .word,
    .editing .word {
        border-color: transparent;
        background-color: transparent;
        text-decoration: none;
    }

    .light .binding .word{ color: #000000 }
    .dark  .binding .word{ color: #d1caca }

    .light .editing .word{ color: #000000 }
    .dark  .editing .word{ color: #d1caca }

    .binding .selected {
        border-radius: 4;
        border-color: #131212;
        background-color: #f3aa3d;
    }

    .editing .selected {
        border-radius: 4;
        border-color: #131212;
        background-color: #ebebeb;
    }

    .light .binding .selected{ color: #000000 }
    .dark  .binding .selected{ color: #000000 }

    .light .editing .selected{ color: #131212 }
    .dark  .editing .selected{ color: #131212 }

/*                                          */

    @keyframes flashingInLight {
        0% { 
            background-color: transparent;
        }
        40% { 
            border-color: #292929;
            background-color: rgba(209, 206, 192, 0.4);
            color: #141414;
        }
        70% { 
            background-color: transparent;
        }
    }

    @keyframes flashingInDark {
        0% { 
            background-color: transparent;
        }
        40% { 
            border-color: #f8f8f8;
            background-color: rgba(238, 197, 12, 0.2);
            color: #141414; 
        }
        70% { 
            background-color: transparent;
        }
    }

    .bookCover .flash { border-radius: 4 }

    .light .bookCover .flash {
        animation-name: flashingInLight;
        animation-duration: 1s;
        animation-iteration-count: 2;
    }

    .dark .bookCover .flash {
        animation-name: flashingInDark;
        animation-duration: 1s;
        animation-iteration-count: 2;
    }

/*                                          */

    @keyframes warmingUpInLight {
        from { background-color: transparent }
        to   { background-color: #58bed8   }
    }

    @keyframes warmingUpInDark {
        from { background-color: transparent }
        to   { background-color: #0882a0   }
    }

    .light .warmingUp {
        animation-name: warmingUpInLight;
        animation-duration: .5s;
        animation-fill-mode: forwards;
    }

    .dark .warmingUp {
        animation-name: warmingUpInDark;
        animation-duration: .5s;
        animation-fill-mode: forwards;
    }

</style>