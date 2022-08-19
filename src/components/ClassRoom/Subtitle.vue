<template>
<GridLayout ref="subtitleBox" class="subtitleBox" :visibility=visibility>

    <FlexboxLayout flexWrap="wrap" justifyContent="center" alignContent="flex-start">

        <nWord
            alignSelf="flex-start"
            verticalAlignment="middle"
            v-for="(word,i) in words"
            :key="i"
            :myText="word.text"
            :myClass="word.class"
            :autoTranslate=true
            :activeDoubleTap=true
            @myDoubleTap=nWordDoubleTapped
            @myLongPress=nWordLongPressed
        />

    </FlexboxLayout>

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
import * as tools                       from "@/mixins/tools"
import nWord                            from "@/components/tools/n_Word.vue"
import Bus                              from "@/mixins/bus"
import Scope                            from "@/components/Scope/Scope.vue"
import * as tnsPLY                      from "@/mixins/audioPlayer"

// -- =====================================================================================

@Component ( { 
    components: { nWord } 
} )

// -- =====================================================================================

export default class Subtitle extends Vue {

// -- =====================================================================================

visibility: 'visible'|'collapsed' = 'collapsed';

// -- =====================================================================================

get words () {

    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ),
        wrappedWords: { text: string, class: string }[] = [],
        ins = store.state.inHand.institute,
        cls: string;

    for ( let idx of store.state.preserve.selected ) {
        cls = "parole";
        let row = dText.content[ idx ];
        if ( row[1].phrased ) cls += " b";
        if ( tools.wordStating( row[0], ins ) === "M" ) cls += " g";
        if ( row[1].isBreakLine ) cls = "breakLine";
        // ! remove this line
        if ( !row[1].isBreakLine ) 
        wrappedWords.push( { text: row[0], class: cls } );
    }

    return wrappedWords;

}

// -- =====================================================================================

mounted () {
    Bus.$on( "Subtitle_PresentPerTime", time => this.presentPerTime( time ) );
}

// -- =====================================================================================

init () {

    // ( this.$refs.subtitleBox as any ).nativeView.visibility = "visible";

    this.visibility = "visible";

    this.subtitleChecker();

}

// -- =====================================================================================

subtitleChecker () {
    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" );
    if ( !dText.content || !dText.content.length ) this.virtualStrGenerator();
}

// -- =====================================================================================

virtualStrGenerator () {

    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" );

        tnsPLY.init( store.state.inHand.mediaPath );
        tnsPLY.getDuration().then( secs => {

            let str = "",
                step = 3,
                h,m,s,j;

            for ( let i=0; i<secs; i+=step ) {
                str += (i+1) + "\n";
                j = i;
                h = (j/(60*60))|0;
                m = ((j-h*60*60)/60)|0;
                s = (j-h*60*60-m*60);
                str += h + ":" + m + ":" + s + " --> " ;
                j = i + step;
                h = (j/(60*60))|0;
                m = ((j-h*60*60)/60)|0;
                s = (j-h*60*60-m*60);
                str += h + ":" + m + ":" + s + "\n"
                str += i + " ..." + "\n\n";
            }

            dText.content = tools.srtParser( str );

        } );

}

// -- =====================================================================================

presentPerTime ( time: number ) {

    let preserves = [];

    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ),
        dVideo = store.state.inHand.lesson.protoplasm.find( x => x.type === "dVideo" ),
        subtitle = dText.content,
        a: number,
        b: number;

    for ( let i=0; i < subtitle.length; i++ ) {
        if ( subtitle[i][1].standoff === "depart" ) a = i;
        b = i;
        if ( subtitle[i][1].standoff === "block" && subtitle[i][1].snap >= time ) break;
    }

    if ( subtitle[a][1].snap <= time && time <= subtitle[b][1].snap )
        for ( let i = a; i<= b; i++ )
            preserves.push(i);

    // .. register if there is any
    if ( preserves.length ) store.state.preserve.selected = preserves;

    // .. register this time as PinnedPoint!
    dVideo.pinnedPoint = time;

}

// -- =====================================================================================

nWordLongPressed ( args ) {
    Bus.$emit( "Scope_DeskCtl", "up", args.object.text );
}

// -- =====================================================================================

nWordDoubleTapped ( args ) {
    let word = args.object.text;
    tools.wordStating( word, store.state.inHand.institute, null, true );
    // .. force re-rendering
    store.state.preserve.selected = [ ...store.state.preserve.selected ];
}

// -- =====================================================================================

destroyed () {
    Bus.$off( "Subtitle_PresentPerTime" );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .subtitleBox {
        padding: 18 30;
    }

    .subtitle {
        margin: 0 20;
        padding: 14 23;
        line-height: 7;
        font-size: 18;
        text-align: center;
        border-radius: 4;
    }

    .light .subtitle {
        color: #494949;
        background-color: rgba(250, 250, 250, 0.8);
    }

    .dark  .subtitle {
        color: #888888;
        background-color: rgba(0, 0, 0, 0.6);
    }

    .light .marked { color: #3d7e08 }
    .dark  .marked { color: #74ac1b }

    .breakLine {
        height: 1;
        padding: 0;
        margin: 0;
    }

</style>