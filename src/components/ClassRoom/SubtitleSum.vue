<template>
<StackLayout ref="subtitleSumBox" id="subtitleSumBox" :visibility=visibility>

<!---------------------------------------------------------------------------------------->

    <ScrollView verticalAlignment="middle">
        <StackLayout>

<!---------------------------------------------------------------------------------------->

            <GridLayout
                columns="50,*,50"
                v-for="line in lines"
                :key="line.i"
                :i=line.i
                :cls=line.cls
                :class="line.cls"
            >

<!---------------------------------------------------------------------------------------->

                <Label
                    v-if="$store.state.mediaState === 'playing'"
                    :fontFamily="$store.state.appConfig.fontFace"
                    :fontSize="$store.state.appConfig.fontSize"
                    :text=line.text
                    :ids=line.ids
                    @tap=lineTapped
                    colSpan=3
                    class="lineText"
                    textWrap="true"
                />
                <FlexboxLayout
                    v-else
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

interface WrappedWord { text: string, cls: string }
interface WrappedLine { i: number, wrappedWords: WrappedWord[], cls: string, ids: number[], text: string }

// -- =====================================================================================

@Component ( {
    components: { nWord }
} )

// -- =====================================================================================

export default class Subtitle extends Vue {

// -- =====================================================================================

visibility: 'visible'|'collapsed' = 'collapsed'
depart_ids: number[] = []
block_ids: number[] = []
wrappedLines: WrappedLine[] = []

// -- =====================================================================================

get lines () {

    let o = this.depart_ids.findIndex( x => x > (store.state.preserve.selected[0] | 0) )
    o = o-1

    try {
        // .. remove center class tag
        for ( let x of this.wrappedLines.slice( o-5| 0, o+4 ) )
            x.cls = x.cls.replace( " center", "" )
        // .. add center class tag
        this.wrappedLines[o].cls += " center"
    } catch {}

    if ( o%8 === 2 )  return this.wrappedLines.slice( o-1 | 0, o+9 )
    if ( o%8 === 3 )  return this.wrappedLines.slice( o-2 | 0, o+8 )
    if ( o%8 === 4 )  return this.wrappedLines.slice( o-3 | 0, o+7 )
    if ( o%8 === 5 )  return this.wrappedLines.slice( o-4 | 0, o+6 )
    if ( o%8 === 6 )  return this.wrappedLines.slice( o-5 | 0, o+5 )
    if ( o%8 === 7 )  return this.wrappedLines.slice( o-6 | 0, o+4 )
    if ( o%8 === 0 )  return this.wrappedLines.slice( o-7 | 0, o+3 )
    if ( o%8 === 1 )  return this.wrappedLines.slice( o-8 | 0, o+2 )

}

// -- =====================================================================================

getLines () {

    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ),
        ids: number[],
        cls: string,
        text: string

    for ( let i in dText.content ) {
        // .. register departs
        if ( dText.content[i][1].standoff == 'depart' ) this.depart_ids.push( Number(i) )
        // .. register blocks
        else if ( dText.content[i][1].standoff == 'block' ) this.block_ids.push( Number(i) )
    }

    for ( let i=0; i < this.depart_ids.length; i++ ) {
        ids = []
        text = ""
        cls = "subtitleLine"

        const myBlockID = typeof this.depart_ids[ i+1 ] === "undefined" ? 
            dText.content.length : this.depart_ids[ i+1 ]
        
        for ( let j = this.depart_ids[i]; j < myBlockID; j++ ) {
            ids.push(j)
            if ( dText.content[j][0] ) text += dText.content[j][0] + " "
            if ( dText.content[j][1].phrased )
                cls = "subtitleLine phrased " + dText.content[j][1].phrased
        }
        
        this.wrappedLines.push( {
            i: this.wrappedLines.length,
            wrappedWords: null,
            cls, ids,
            text
        } )
    }

    // .. Wrapping Words
    this.wrappingWords( this.wrappedLines, dText )

}

// -- =====================================================================================

wrappingWords ( wrappedLines: WrappedLine[], dText: TS.Organelle ) {

    let wrappedWords: WrappedWord[] = [],
        cls: string

    for ( let x in wrappedLines ) {
        wrappedWords = []
        for ( let idx of wrappedLines[x].ids ) {
            cls = "parole"
            let row = dText.content[ idx ]
            if ( row[1].phrased ) cls += " b"
            // ! remove this line
            try { if ( tools.wordStating( row[0], "en" ) === "M" ) cls += " g" } catch {}
            if ( row[1].isBreakLine ) cls = "breakLine"
            // ! remove this line
            if ( !row[1].isBreakLine )
            wrappedWords.push( { text: row[0], cls } )
        }
        wrappedLines[x].wrappedWords = wrappedWords
    }

}

// -- =====================================================================================

mounted () {}

// -- =====================================================================================

init () {

    this.visibility = "visible"

    this.subtitleChecker()

    // ! remove it
    this.trimmer()

    this.getLines()

}

// -- =====================================================================================

subtitleChecker () {
    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" )
    if ( !dText.content || !dText.content.length ) this.virtualStrGenerator()
}

// -- =====================================================================================

trimmer () {
    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" )
    for( let t of dText.content ) {
        if ( typeof t[0] === "string" )
            t[0] = t[0].replace( '{\\an8}', '' )
    }
}

// -- =====================================================================================

virtualStrGenerator () {

    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" )

        tnsPLY.init( store.state.inHand.mediaPath )
        tnsPLY.getDuration().then( secs => {

            let str = "",
                step = 3,
                h,m,s,j

            for ( let i=0; i<secs; i+=step ) {
                str += (i+1) + "\n"
                j = i
                h = (j/(60*60))|0
                m = ((j-h*60*60)/60)|0
                s = (j-h*60*60-m*60)
                str += h + ":" + m + ":" + s + " --> "
                j = i + step
                h = (j/(60*60))|0
                m = ((j-h*60*60)/60)|0
                s = (j-h*60*60-m*60)
                str += h + ":" + m + ":" + s + "\n"
                str += i + " ..." + "\n\n"
            }

            dText.content = tools.srtParser( str )

        } )

}

// -- =====================================================================================

lineTapped ( args ) {

    let dText = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ),
        color: "blue"|"red",
        ids: number[]

    ids = args.object.ids

    for ( let id of ids ) {
        // .. toggle colors
        if ( !dText.content[ id ][1].phrased ) color = "blue"
        else if ( dText.content[ id ][1].phrased === "blue" ) color = "red"
        else color = null
        dText.content[ id ][1].phrased = color
    }

    // .. visual effect
    args.object.parent.class = "subtitleLine " + color
    this.wrappedLines[ args.object.parent.i ].cls = args.object.parent.class

}

// -- =====================================================================================

nWordLongPressed ( args ) {
    Bus.$emit( "Scope_DeskCtl", "up", args.object.text )
}

// -- =====================================================================================

nWordDoubleTapped ( args ) {
    let word = args.object.text
    tools.wordStating( word, store.state.inHand.institute, null, true )
    // .. force re-rendering
    store.state.preserve.selected = [ ...store.state.preserve.selected ]
    // .. force re-rendering
    this.getLines()
}

// -- =====================================================================================

destroyed () {
    Bus.$off( "Subtitle_PresentPerTime" )
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    #subtitleSumBox {
        background-color: #000000;
        padding: 20 30 85 30;
    }

    .subtitleLine {
        color: #888888;
        padding: 5 0;
        border-color: #555555;
        border-width: 1;
        border-radius: 7;
        margin: 5 7;
    }

    .subtitleContent {
        padding: 0 18;
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

    .lineText {
        text-align: center;
        color: #dddddd;
        padding: 1.9 18;
        line-height: 12.7;
    }

</style>