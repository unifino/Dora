<template>
<StackLayout ref="subtitleSumBox" id="subtitleSumBox" :visibility=visibility>

<!---------------------------------------------------------------------------------------->

    <ScrollView verticalAlignment="middle">
        <StackLayout>

<!---------------------------------------------------------------------------------------->

            <GridLayout
                columns="50,*,50"
                v-for="(line,i) in lines"
                :key="line.i"
                :i=line.i
                :cls=line.cls
                :class="line.cls + ( i === 4 ? ' center' : '' )"
            >

<!---------------------------------------------------------------------------------------->

                <FlexboxLayout
                    class="subtitleContent"
                    colSpan=3
                    flexWrap="wrap"
                    justifyContent="center"
                    alignContent="flex-start"
                >

                    <nWord
                        alignSelf="flex-start"
                        verticalAlignment="middle"
                        v-for="(word,i) in line.wrappedWords"
                        :key="i"
                        :myText="word.text"
                        :myClass="word.cls"
                        :autoTranslate=true
                        :activeDoubleTap=true
                        @myDoubleTap=nWordDoubleTapped
                        @myLongPress=nWordLongPressed
                    />

                </FlexboxLayout>

<!---------------------------------------------------------------------------------------->

                <StackLayout col=0 :ids=line.ids @tap=lineTapped />
                <StackLayout col=2 :ids=line.ids @tap=lineTapped />

<!---------------------------------------------------------------------------------------->

            </GridLayout>

<!---------------------------------------------------------------------------------------->

        </StackLayout>
    </ScrollView>

<!---------------------------------------------------------------------------------------->

</StackLayout>
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

interface WrappedWord { text: string, cls: string };
interface WrappedLine { i: number, wrappedWords: WrappedWord[], cls: string, ids: number[] }

// -- =====================================================================================

@Component ( {
    components: { nWord }
} )

// -- =====================================================================================

export default class Subtitle extends Vue {

// -- =====================================================================================

visibility: 'visible'|'collapsed' = 'collapsed';
depart_ids: number[] = [];
block_ids: number[] = [];
wrappedLines: WrappedLine[] = [];

// -- =====================================================================================

get lines () {

    let o = this.depart_ids.findIndex( x => x > (store.state.preserve.selected[0] | 0) );

    return this.wrappedLines.slice( o-5 | 0, o+3 );

}

// -- =====================================================================================

getLines () {

    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ),
        ids: number[],
        cls: string;

    // .. resolver
    for ( let i=1; i < dText.content.length; i++ ) {
        // .. find Solitude Blocks
        if ( dText.content[i][1].standoff === 'block' ) {
            if ( dText.content[ i-1 ][1].standoff === 'block' ) {
                // .. insert dash as a depart
                dText.content.splice( i, 0, [ "-", { standoff: "depart" } ] );
                i = 1;
            }
        }
    }

    for ( let i in dText.content ) {
        // .. register departs
        if ( dText.content[i][1].standoff == 'depart' ) this.depart_ids.push( Number(i) );
        // .. register blocks
        else if ( dText.content[i][1].standoff == 'block' ) this.block_ids.push( Number(i) );
    }

    // .. checker
    for ( let i=1; i < this.block_ids.length; i++ ) {
        if ( this.block_ids[i-1] - this.depart_ids[i] !== -1 )
            console.log( i, this.block_ids[i], this.depart_ids[i-1] )
    }

    for ( let i=0; i < this.depart_ids.length -1; i++ ) {
        ids = [];
        cls = "subtitleLine";
        for ( let j = this.depart_ids[i]; j < this.depart_ids[ i+1 ]; j++ ) {
            ids.push(j);
            if ( dText.content[j][1].phrased )
                cls = "subtitleLine phrased " + dText.content[j][1].phrased;
        }
        this.wrappedLines.push( { i: this.wrappedLines.length, wrappedWords: null, cls, ids } );
    }

    // .. Wrapping Words
    this.wrappingWords( this.wrappedLines, dText );

}

// -- =====================================================================================

wrappingWords ( wrappedLines: WrappedLine[], dText: TS.Organelle ) {

    let wrappedWords: WrappedWord[] = [],
        cls: string;

    for ( let x in wrappedLines ) {
        wrappedWords = [];
        for ( let idx of wrappedLines[x].ids ) {
            cls = "parole";
            let row = dText.content[ idx ];
            if ( row[1].phrased ) cls += " b";
            if ( tools.wordStating( row[0], "en" ) === "M" ) cls += " g";
            if ( row[1].isBreakLine ) cls = "breakLine";
            // ! remove this line
            if ( !row[1].isBreakLine )
            wrappedWords.push( { text: row[0], cls } );
        }
        wrappedLines[x].wrappedWords = wrappedWords;
    }

}

// -- =====================================================================================

mounted () {}

// -- =====================================================================================

init () {

    this.visibility = "collapsed";

    this.subtitleChecker();

    this.getLines();

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

lineTapped ( args ) {

    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ),
        color: "blue"|"red",
        ids: number[];

    ids = args.object.ids;

    for ( let id of ids ) {
        // .. toggle colors
        if ( !dText.content[ id ][1].phrased ) color = "blue";
        else if ( dText.content[ id ][1].phrased === "blue" ) color = "red";
        else color = null;
        dText.content[ id ][1].phrased = color;
    }

    // .. visual effect
    args.object.parent.class = "subtitleLine " + color;
    this.wrappedLines[ args.object.parent.i ].cls = args.object.parent.class;

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
    // .. force re-rendering
    this.getLines();
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

    #subtitleSumBox {
        background-color: #062129;
        padding: 40 30 85 30;
    }

    .subtitleLine {
        color: #888888;
        font-size: 13;
        padding: 5 0;
        border-color: #555555;
        border-width: 1;
        border-radius: 3;
        margin: 5 7;
    }

    .subtitleContent {
        padding: 0 30;
    }

    .blue {
        background-color: #0f6e0f;
        border-color: #094209;
    }
    .blue .parole{ color: #f7f7f7 }

    .red {
        background-color: #bb130d;
        border-color: #bb130d;
    }
    .red .parole { color: #0a0909 }

    .center {
        border-color: #e6681f;
    }
    .center .parole{ color: whitesmoke }

</style>